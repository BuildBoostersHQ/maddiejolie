import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { isOptOut, last10 } from '@/lib/kixie'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY
  || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Kixie's docs don't describe webhook signing, so we support an optional shared secret
// via ?secret=... or the x-kixie-secret header (configure in Kixie's webhook URL/headers).
export async function POST(request) {
  const secret = process.env.KIXIE_WEBHOOK_SECRET
  if (secret) {
    const { searchParams } = new URL(request.url)
    const given = searchParams.get('secret') || request.headers.get('x-kixie-secret')
    if (given !== secret) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let payload
  try { payload = await request.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }
  const d = payload?.data || payload || {}

  const direction = String(d.direction || '').toLowerCase()
  if (direction && !direction.startsWith('in')) return NextResponse.json({ ok: true, ignored: 'not inbound' })

  const body = d.message || ''
  const customer = last10(d.customernumber || d.from || d.number)
  const business = last10(d.businessnumber || d.to)
  if (!customer || !body) return NextResponse.json({ ok: true, ignored: 'missing number or body' })
  if (!SUPABASE_URL || !SUPABASE_KEY) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

  // Phones are stored in mixed formats, so narrow by last 4 digits then compare last 10 in JS
  const { data: candidates } = await supabase.from('prospects').select('*').ilike('phone', `%${customer.slice(-4)}%`)
  const matches = (candidates || []).filter(p => last10(p.phone) === customer)
  const prospect = matches.find(p => business && last10(p.from_number) === business) || matches[0]
  if (!prospect) return NextResponse.json({ ok: true, ignored: 'no matching prospect' })

  await supabase.from('messages').insert({
    prospect_id: prospect.id,
    direction: 'inbound',
    body,
    status: 'received',
    kixie_message_id: d.messageid || null,
    sequence_step: 'inbound',
    brand: prospect.brand || 'mj',
    from_number: prospect.from_number || (business ? d.businessnumber : null),
    batch_id: prospect.batch_id || null,
    sent_at: d.messageDate || new Date().toISOString(),
  })

  const update = { updated_at: new Date().toISOString() }
  if (isOptOut(body)) {
    update.stage = 'lost'
    update.notes = [prospect.notes, 'opted out'].filter(Boolean).join('\n')
  } else if (!['booked', 'closed', 'lost'].includes(prospect.stage)) {
    update.stage = 'responded'
  }
  await supabase.from('prospects').update(update).eq('id', prospect.id)

  return NextResponse.json({ ok: true })
}
