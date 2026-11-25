import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const OUTSCRAPER_KEY = process.env.OUTSCRAPER_API_KEY
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const FRANCHISE_KEYWORDS = [
  'home depot', "lowe's", 'lowes', 'ace hardware', 'mr. handyman',
  'mr handyman', 'handyman connection', 'angi', 'taskrabbit', 'thumbtack',
  'servpro', 'servicemaster', 'roto-rooter', 'stanley steemer',
  'chem-dry', 'molly maid', 'merry maids', 'two men and a truck',
  'college hunks', 'junkluggers', '1-800-got-junk', 'wow 1 day',
  'certapro', 'five star painting', 'fresh coat',
]

function isFranchise(name) {
  const lower = (name || '').toLowerCase()
  return FRANCHISE_KEYWORDS.some(kw => lower.includes(kw))
}

function generateSlug(name, city) {
  return `${name}-${city}`
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 80)
}

function scoreProspect(p) {
  let score = 50
  if (p.reviews >= 50) score += 20
  else if (p.reviews >= 25) score += 15
  else if (p.reviews >= 10) score += 10
  else score += 5
  if (p.rating >= 4.8) score += 15
  else if (p.rating >= 4.5) score += 10
  else if (p.rating >= 4.2) score += 5
  if (p.site) score -= 10
  if (p.photos_count > 5) score += 5
  if (p.reviews >= 100) score += 5
  return Math.max(0, Math.min(100, score))
}

function getTopReviewerName(p) {
  if (p.reviews_data?.length > 0) {
    const top = p.reviews_data
      .filter(r => r.author_title && r.review_rating >= 4)
      .sort((a, b) => (b.review_rating || 0) - (a.review_rating || 0))[0]
    if (top) return top.author_title.split(' ')[0]
  }
  return null
}

export async function POST(request) {
  try {
    const { area, trade, limit = 50 } = await request.json()

    if (!area || !trade) {
      return NextResponse.json({ error: 'Area and trade are required' }, { status: 400 })
    }
    if (!OUTSCRAPER_KEY) {
      return NextResponse.json({ error: 'Outscraper API key not configured' }, { status: 500 })
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

    // Step 1: Pull from Outscraper
    const params = new URLSearchParams({
      query: `${trade} in ${area}`,
      limit: Math.min(limit, 100).toString(), // Cap at 100 per request for timeout safety
      async: 'false',
      language: 'en',
      region: 'us',
    })

    const res = await fetch(`https://api.app.outscraper.com/maps/search-v3?${params}`, {
      headers: { 'X-API-KEY': OUTSCRAPER_KEY },
    })

    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json({ error: `Outscraper error: ${text}` }, { status: 502 })
    }

    const data = await res.json()
    const raw = data.data?.[0] || data.data || []

    // Step 2: Filter
    const filtered = raw.filter(p => {
      if (!p.place_id) return false
      if ((p.reviews || 0) < 5) return false
      if ((p.rating || 0) < 4.0) return false
      if (isFranchise(p.name)) return false
      if (!p.phone) return false
      return true
    })

    // Step 3: Deduplicate against existing
    const placeIds = filtered.map(p => p.place_id)
    const existing = new Set()

    for (let i = 0; i < placeIds.length; i += 100) {
      const batch = placeIds.slice(i, i + 100)
      const { data: rows } = await supabase
        .from('prospects')
        .select('place_id')
        .in('place_id', batch)
      if (rows) rows.forEach(d => existing.add(d.place_id))
    }

    const fresh = filtered.filter(p => !existing.has(p.place_id))

    // Step 4: Save to Supabase (without phone verification — that's a separate step)
    const prospects = fresh.map(p => {
      const slug = generateSlug(p.name, p.city || '')
      return {
        place_id: p.place_id,
        name: p.name,
        owner_name: p.owner_title || p.owner || null,
        phone: p.phone,
        phone_type: 'unverified',
        trade: trade,
        city: p.city || '',
        state: p.state || '',
        rating: p.rating || 0,
        review_count: p.reviews || 0,
        top_reviewer_name: getTopReviewerName(p),
        stage: 'prospect',
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
          full_address: p.full_address || null,
        }),
      }
    })

    if (prospects.length > 0) {
      const { error: insertError } = await supabase.from('prospects').insert(prospects)
      if (insertError) {
        return NextResponse.json({ error: `Save error: ${insertError.message}` }, { status: 500 })
      }
    }

    // Save batch record
    await supabase.from('batches').insert({
      area,
      trade,
      raw_count: raw.length,
      filtered_count: filtered.length,
      verified_count: fresh.length,
    })

    return NextResponse.json({
      success: true,
      raw: raw.length,
      filtered: filtered.length,
      duplicates: existing.size,
      saved: prospects.length,
    })

  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
