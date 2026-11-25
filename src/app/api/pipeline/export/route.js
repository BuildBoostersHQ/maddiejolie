import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { assignKixieNumber } from '@/lib/constants'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY
  || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

/**
 * GET /api/pipeline/export?brand=mj&trade=Handyman&batch_id=5&stage=prospect
 *
 * Exports verified-mobile prospects as a CSV for Kixie PowerList import.
 * Also assigns from_number to each prospect (sticky — once set, never changes).
 *
 * Query params (all optional filters):
 *   brand     – 'mj' | 'bb' (default: all)
 *   trade     – filter by trade
 *   batch_id  – filter by batch
 *   stage     – filter by pipeline stage (default: 'prospect')
 *   city      – filter by city
 *   limit     – max rows (default: 500)
 *
 * CSV columns match Kixie PowerList format with custom merge fields:
 *   Phone, First Name, Last Name, Company, Demo URL, Top Reviewer,
 *   Trade, City, State, Brand, Score, Prospect ID
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const brand = searchParams.get('brand')
    const trade = searchParams.get('trade')
    const batchId = searchParams.get('batch_id')
    const stage = searchParams.get('stage') || 'prospect'
    const city = searchParams.get('city')
    const limit = parseInt(searchParams.get('limit') || '500', 10)

    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

    // Build query — only verified mobile numbers that haven't been exported yet
    let query = supabase
      .from('prospects')
      .select('*')
      .eq('phone_type', 'mobile')
      .eq('stage', stage)
      .order('score', { ascending: false })
      .limit(limit)

    if (brand) query = query.eq('brand', brand)
    if (trade) query = query.eq('trade', trade)
    if (batchId) query = query.eq('batch_id', batchId)
    if (city) query = query.ilike('city', `%${city}%`)

    const { data: prospects, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!prospects || prospects.length === 0) {
      return NextResponse.json({
        error: 'No verified mobile prospects match your filters',
        filters: { brand, trade, batchId, stage, city },
      }, { status: 404 })
    }

    // Assign from_number to any prospect that doesn't have one yet
    const needsNumber = prospects.filter(p => !p.from_number)
    if (needsNumber.length > 0) {
      const updates = needsNumber.map(p => ({
        id: p.id,
        from_number: assignKixieNumber(p.phone),
      }))

      // Batch update — Supabase upsert by id
      for (const u of updates) {
        await supabase
          .from('prospects')
          .update({ from_number: u.from_number })
          .eq('id', u.id)

        // Also set it on the local object so the CSV gets it
        const p = prospects.find(p => p.id === u.id)
        if (p) p.from_number = u.from_number
      }
    }

    // Build CSV
    const headers = [
      'Phone',
      'First Name',
      'Last Name',
      'Company',
      'Demo URL',
      'Top Reviewer',
      'Trade',
      'City',
      'State',
      'Brand',
      'Score',
      'From Number',
      'Prospect ID',
    ]

    const rows = prospects.map(p => {
      const ownerParts = (p.owner_name || '').split(' ')
      const firstName = ownerParts[0] || ''
      const lastName = ownerParts.slice(1).join(' ') || ''
      const demoUrl = p.brand === 'bb'
        ? `https://buildboosters.com/demo/${p.demo_slug}`
        : `https://maddiejolie.com/demo/${p.demo_slug}`

      return [
        (p.phone || '').replace(/\D/g, ''),
        firstName,
        lastName,
        p.name || '',
        demoUrl,
        p.top_reviewer_name || '',
        p.trade || '',
        p.city || '',
        p.state || '',
        p.brand || 'mj',
        p.score || 0,
        p.from_number || '',
        p.id,
      ]
    })

    // Escape CSV fields
    function esc(val) {
      const s = String(val)
      if (s.includes(',') || s.includes('"') || s.includes('\n')) {
        return `"${s.replace(/"/g, '""')}"`
      }
      return s
    }

    const csv = [
      headers.join(','),
      ...rows.map(r => r.map(esc).join(',')),
    ].join('\n')

    // Return as downloadable CSV
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="kixie-export-${brand || 'all'}-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    })

  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

/**
 * POST /api/pipeline/export
 *
 * Same filters as GET, but returns JSON with count + preview instead of CSV.
 * Use this to preview what will be exported before downloading.
 */
export async function POST(request) {
  try {
    const { brand, trade, batch_id, stage = 'prospect', city, limit = 500 } = await request.json()

    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

    let query = supabase
      .from('prospects')
      .select('id, name, owner_name, phone, phone_type, trade, city, state, brand, score, from_number, demo_slug, top_reviewer_name, stage')
      .eq('phone_type', 'mobile')
      .eq('stage', stage)
      .order('score', { ascending: false })
      .limit(limit)

    if (brand) query = query.eq('brand', brand)
    if (trade) query = query.eq('trade', trade)
    if (batch_id) query = query.eq('batch_id', batch_id)
    if (city) query = query.ilike('city', `%${city}%`)

    const { data: prospects, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Summary stats
    const mjCount = (prospects || []).filter(p => p.brand === 'mj').length
    const bbCount = (prospects || []).filter(p => p.brand === 'bb').length
    const needsNumber = (prospects || []).filter(p => !p.from_number).length
    const trades = {}
    for (const p of (prospects || [])) {
      trades[p.trade] = (trades[p.trade] || 0) + 1
    }

    return NextResponse.json({
      count: (prospects || []).length,
      mjCount,
      bbCount,
      needsFromNumber: needsNumber,
      byTrade: trades,
      preview: (prospects || []).slice(0, 5).map(p => ({
        name: p.name,
        owner: p.owner_name,
        phone: p.phone,
        trade: p.trade,
        city: p.city,
        brand: p.brand,
        score: p.score,
      })),
    })

  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
