#!/usr/bin/env node

/**
 * Build Boosters Prospecting Pipeline
 *
 * Usage: node scripts/pipeline.js --area "Miami-Dade" --trade "handyman" --limit 500
 *
 * Flow:
 * 1. Pull contractors from Outscraper API
 * 2. Filter: min 5 reviews, min 4.0 stars, no franchises
 * 3. Deduplicate against existing prospects in Supabase (by place_id)
 * 4. Verify phone numbers with Twilio (keep mobile only)
 * 5. Score prospects
 * 6. Save to Supabase
 *
 * Requires .env.local with:
 *   OUTSCRAPER_API_KEY, TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN,
 *   NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
 */

const fs = require('fs')
const path = require('path')

// Load env
const envPath = path.join(__dirname, '..', '.env.local')
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8')
  for (const line of envContent.split('\n')) {
    const [key, ...vals] = line.split('=')
    if (key && vals.length) process.env[key.trim()] = vals.join('=').trim()
  }
}

const OUTSCRAPER_KEY = process.env.OUTSCRAPER_API_KEY
const TWILIO_SID = process.env.TWILIO_ACCOUNT_SID
const TWILIO_TOKEN = process.env.TWILIO_AUTH_TOKEN
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Known franchise/chain keywords to filter out
const FRANCHISE_KEYWORDS = [
  'home depot', 'lowe\'s', 'lowes', 'ace hardware', 'mr. handyman',
  'mr handyman', 'handyman connection', 'angi', 'taskrabbit', 'thumbtack',
  'servpro', 'servicemaster', 'roto-rooter', 'stanley steemer',
  'chem-dry', 'molly maid', 'merry maids', 'two men and a truck',
  'college hunks', 'junkluggers', '1-800-got-junk', 'wow 1 day',
  'certapro', 'five star painting', 'fresh coat',
]

// Mini-TCPA states — these go to email, not SMS
const MINI_TCPA_STATES = [
  'AZ', 'CA', 'CT', 'FL', 'IN', 'MD', 'NJ', 'NY',
  'OK', 'SC', 'TX', 'UT', 'VA', 'WA', 'WI',
]

// Parse CLI args
const args = {}
for (let i = 2; i < process.argv.length; i += 2) {
  const key = process.argv[i].replace('--', '')
  args[key] = process.argv[i + 1]
}

const AREA = args.area || 'Miami, FL'
const TRADE = args.trade || 'handyman'
const LIMIT = parseInt(args.limit) || 500
const DRY_RUN = args.dry === 'true'

// ---- Outscraper ----

async function pullFromOutscraper(query, location, limit) {
  console.log(`\n📡 Pulling from Outscraper: "${query}" in "${location}" (limit: ${limit})`)

  const params = new URLSearchParams({
    query: `${query} in ${location}`,
    limit: limit.toString(),
    async: 'false',
    language: 'en',
    region: 'us',
  })

  const res = await fetch(`https://api.app.outscraper.com/maps/search-v3?${params}`, {
    headers: { 'X-API-KEY': OUTSCRAPER_KEY },
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Outscraper error ${res.status}: ${text}`)
  }

  const data = await res.json()
  const results = data.data?.[0] || data.data || []
  console.log(`   Got ${results.length} raw results`)
  return results
}

// ---- Filtering ----

function isFranchise(name) {
  const lower = (name || '').toLowerCase()
  return FRANCHISE_KEYWORDS.some(kw => lower.includes(kw))
}

function filterProspects(raw) {
  console.log(`\n🔍 Filtering ${raw.length} prospects...`)

  const filtered = raw.filter(p => {
    // Must have place_id
    if (!p.place_id) return false

    // Min 5 reviews
    if ((p.reviews || 0) < 5) return false

    // Min 4.0 stars
    if ((p.rating || 0) < 4.0) return false

    // No franchises
    if (isFranchise(p.name)) return false

    // Must have a phone number
    if (!p.phone) return false

    return true
  })

  console.log(`   ${raw.length} → ${filtered.length} after filtering`)
  console.log(`   Dropped: ${raw.length - filtered.length} (low reviews/rating, franchises, no phone)`)

  return filtered
}

// ---- Deduplication ----

async function deduplicateAgainstSupabase(prospects) {
  console.log(`\n🔄 Deduplicating against existing prospects...`)

  const { createClient } = require('@supabase/supabase-js')
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

  const placeIds = prospects.map(p => p.place_id)

  // Fetch existing place_ids in batches of 100
  const existing = new Set()
  for (let i = 0; i < placeIds.length; i += 100) {
    const batch = placeIds.slice(i, i + 100)
    const { data } = await supabase
      .from('prospects')
      .select('place_id')
      .in('place_id', batch)

    if (data) data.forEach(d => existing.add(d.place_id))
  }

  const fresh = prospects.filter(p => !existing.has(p.place_id))
  console.log(`   ${prospects.length} → ${fresh.length} new (${existing.size} already in database)`)

  return fresh
}

// ---- Phone Verification ----

async function verifyPhones(prospects) {
  console.log(`\n📱 Verifying ${prospects.length} phone numbers with Twilio...`)

  const verified = []
  let mobile = 0, landline = 0, voip = 0, errors = 0

  for (const p of prospects) {
    try {
      const phone = p.phone.replace(/\D/g, '')
      if (!phone || phone.length < 10) {
        errors++
        continue
      }

      const auth = Buffer.from(`${TWILIO_SID}:${TWILIO_TOKEN}`).toString('base64')
      const res = await fetch(
        `https://lookups.twilio.com/v2/PhoneNumbers/+1${phone}?Fields=line_type_intelligence`,
        { headers: { Authorization: `Basic ${auth}` } }
      )

      if (!res.ok) {
        errors++
        continue
      }

      const data = await res.json()
      const lineType = data.line_type_intelligence?.type || 'unknown'

      if (lineType === 'mobile') {
        verified.push({ ...p, phone_type: 'mobile' })
        mobile++
      } else if (lineType === 'nonFixedVoip') {
        // VoIP can sometimes receive SMS, skip to be safe
        voip++
      } else {
        landline++
      }

      // Rate limit: ~2 per second to be safe
      if (verified.length % 10 === 0) {
        process.stdout.write(`   Verified ${mobile + landline + voip + errors}/${prospects.length}...\r`)
      }
      await new Promise(r => setTimeout(r, 500))

    } catch (err) {
      errors++
    }
  }

  console.log(`   Results: ${mobile} mobile ✓, ${landline} landline ✗, ${voip} VoIP ✗, ${errors} errors`)
  return verified
}

// ---- Scoring ----

function scoreProspect(p) {
  let score = 50

  // Reviews (up to +20)
  if (p.reviews >= 50) score += 20
  else if (p.reviews >= 25) score += 15
  else if (p.reviews >= 10) score += 10
  else score += 5

  // Rating (up to +15)
  if (p.rating >= 4.8) score += 15
  else if (p.rating >= 4.5) score += 10
  else if (p.rating >= 4.2) score += 5

  // Has website already? Lower priority (they might have an agency)
  if (p.site) score -= 10

  // Has Google photos? Shows they care about their listing
  if (p.photos_count > 5) score += 5

  // Lots of reviews = established, good target
  if (p.reviews >= 100) score += 5

  return Math.max(0, Math.min(100, score))
}

// ---- Extract top reviewer name (for SMS message 3) ----

function getTopReviewerName(p) {
  if (p.reviews_data && p.reviews_data.length > 0) {
    // Get the highest-rated review with a name
    const topReview = p.reviews_data
      .filter(r => r.author_title && r.review_rating >= 4)
      .sort((a, b) => (b.review_rating || 0) - (a.review_rating || 0))[0]

    if (topReview) {
      return topReview.author_title.split(' ')[0] // First name only
    }
  }
  return null
}

// ---- Generate demo slug ----

function generateSlug(name, city) {
  const slug = `${name}-${city}`
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 80)
  return slug
}

// ---- Save to Supabase ----

async function saveToSupabase(prospects, batchInfo) {
  console.log(`\n💾 Saving ${prospects.length} prospects to Supabase...`)

  const { createClient } = require('@supabase/supabase-js')
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

  // Save batch record
  const { data: batch } = await supabase
    .from('batches')
    .insert({
      area: batchInfo.area,
      trade: batchInfo.trade,
      raw_count: batchInfo.rawCount,
      filtered_count: batchInfo.filteredCount,
      verified_count: prospects.length,
    })
    .select()
    .single()

  console.log(`   Batch #${batch?.id} created`)

  // Save prospects in batches of 50
  let saved = 0
  for (let i = 0; i < prospects.length; i += 50) {
    const chunk = prospects.slice(i, i + 50).map(p => {
      const slug = generateSlug(p.name, p.city || '')
      const state = extractState(p.full_address || p.state || '')

      return {
        place_id: p.place_id,
        name: p.name,
        owner_name: p.owner_title || p.owner || null,
        phone: p.phone,
        phone_type: p.phone_type || 'mobile',
        trade: TRADE,
        city: p.city || '',
        state: state,
        rating: p.rating || 0,
        review_count: p.reviews || 0,
        top_reviewer_name: getTopReviewerName(p),
        stage: 'new',
        score: scoreProspect(p),
        demo_url: `/demo/${slug}`,
        demo_slug: slug,
        google_photos: JSON.stringify((p.photos_sample || []).slice(0, 5)),
        google_place_url: p.place_url || null,
        outscraper_data: JSON.stringify({
          site: p.site || null,
          description: p.description || null,
          category: p.category || null,
          working_hours: p.working_hours || null,
        }),
      }
    })

    const { error } = await supabase.from('prospects').insert(chunk)
    if (error) {
      console.error(`   Error saving batch: ${error.message}`)
    } else {
      saved += chunk.length
    }
  }

  console.log(`   Saved ${saved} prospects`)
  return saved
}

function extractState(address) {
  // Try to extract 2-letter state code from address
  const stateMatch = address.match(/\b([A-Z]{2})\b/)
  if (stateMatch) return stateMatch[1]

  // Common state names
  const states = {
    'florida': 'FL', 'new york': 'NY', 'california': 'CA', 'texas': 'TX',
    'georgia': 'GA', 'illinois': 'IL', 'pennsylvania': 'PA', 'ohio': 'OH',
    'north carolina': 'NC', 'michigan': 'MI', 'new jersey': 'NJ',
    'virginia': 'VA', 'washington': 'WA', 'arizona': 'AZ', 'massachusetts': 'MA',
    'tennessee': 'TN', 'indiana': 'IN', 'maryland': 'MD', 'colorado': 'CO',
    'minnesota': 'MN', 'wisconsin': 'WI', 'missouri': 'MO', 'connecticut': 'CT',
  }

  const lower = address.toLowerCase()
  for (const [name, code] of Object.entries(states)) {
    if (lower.includes(name)) return code
  }

  return ''
}

// ---- Main ----

async function main() {
  console.log('═══════════════════════════════════════')
  console.log('  Build Boosters Pipeline')
  console.log('═══════════════════════════════════════')
  console.log(`  Area: ${AREA}`)
  console.log(`  Trade: ${TRADE}`)
  console.log(`  Limit: ${LIMIT}`)
  console.log(`  Dry run: ${DRY_RUN}`)
  console.log('═══════════════════════════════════════')

  // Check required keys
  if (!OUTSCRAPER_KEY) throw new Error('Missing OUTSCRAPER_API_KEY in .env.local')
  if (!TWILIO_SID) throw new Error('Missing TWILIO_ACCOUNT_SID in .env.local')
  if (!TWILIO_TOKEN) throw new Error('Missing TWILIO_AUTH_TOKEN in .env.local')
  if (!SUPABASE_URL) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL in .env.local')
  if (!SUPABASE_KEY) throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local')

  // Step 1: Pull from Outscraper
  const raw = await pullFromOutscraper(TRADE, AREA, LIMIT)

  // Step 2: Filter
  const filtered = filterProspects(raw)

  // Step 3: Deduplicate
  const fresh = await deduplicateAgainstSupabase(filtered)

  if (fresh.length === 0) {
    console.log('\n✅ No new prospects to process. All already in database.')
    return
  }

  // Step 4: Verify phones
  const verified = await verifyPhones(fresh)

  if (verified.length === 0) {
    console.log('\n⚠️  No mobile numbers found in this batch.')
    return
  }

  // Step 5: Tag mini-TCPA prospects
  for (const p of verified) {
    const state = extractState(p.full_address || p.state || '')
    p._miniTcpa = MINI_TCPA_STATES.includes(state)
  }

  const smsEligible = verified.filter(p => !p._miniTcpa)
  const emailOnly = verified.filter(p => p._miniTcpa)
  console.log(`\n📊 SMS eligible: ${smsEligible.length}, Email only (mini-TCPA): ${emailOnly.length}`)

  // Step 6: Save to Supabase
  if (DRY_RUN) {
    console.log('\n🏁 DRY RUN — would save:')
    verified.slice(0, 5).forEach(p => {
      console.log(`   ${p.name} | ${p.phone} | ⭐${p.rating} (${p.reviews}) | Score: ${scoreProspect(p)}`)
    })
    if (verified.length > 5) console.log(`   ... and ${verified.length - 5} more`)
  } else {
    await saveToSupabase(verified, {
      area: AREA,
      trade: TRADE,
      rawCount: raw.length,
      filteredCount: filtered.length,
    })
  }

  // Summary
  console.log('\n═══════════════════════════════════════')
  console.log('  Pipeline Complete')
  console.log('═══════════════════════════════════════')
  console.log(`  Raw pulled:     ${raw.length}`)
  console.log(`  After filter:   ${filtered.length}`)
  console.log(`  New (deduped):  ${fresh.length}`)
  console.log(`  Verified mobile: ${verified.length}`)
  console.log(`  SMS eligible:   ${smsEligible.length}`)
  console.log(`  Email only:     ${emailOnly.length}`)
  console.log('═══════════════════════════════════════')
}

main().catch(err => {
  console.error('\n❌ Pipeline error:', err.message)
  process.exit(1)
})
