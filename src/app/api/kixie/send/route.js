import { createClient } from '@supabase/supabase-js'
import { requireUser } from '@/lib/apiAuth'
import { NextResponse } from 'next/server'
import { assignKixieNumber } from '@/lib/constants'
import { sendKixieSms, isOptOut } from '@/lib/kixie'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY
  || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const STEP_TO_STAGE = { sms1: 'sms12', sms2: 'sms12', sms3: 'sms3', sms4: 'sms4', sms5: 'sms5' }
const NO_REGRESS = ['clicked', 'engaged', 'responded', 'booked', 'closed', 'lost']

export async function POST(request) {
  const auth = await requireUser(request)
  if (auth.error) return auth.error
  let payload
  try { payload = await request.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }
  const { prospect_id, body, sequence_step } = payload || {}
  const step = sequence_step || 'manual'

  if (!prospect_id) return NextResponse.json({ error: 'prospect_id required' }, { status: 400 })
  if (typeof body !== 'string' || !body.trim()) return NextResponse.json({ error: 'body required' }, { status: 400 })
  if (body.length > 1600) return NextResponse.json({ error: 'body too long (max 1600)' }, { status: 400 })
  if (!SUPABASE_URL || !SUPABASE_KEY) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

  const { data: prospect, error: pErr } = await supabase.from('prospects').select('*').eq('id', prospect_id).single()
  if (pErr || !prospect) return NextResponse.json({ error: 'Prospect not found' }, { status: 404 })
  if (!prospect.phone) return NextResponse.json({ error: 'Prospect has no phone' }, { status: 400 })
  if (prospect.stage === 'lost') return NextResponse.json({ error: 'Prospect is lost/opted out' }, { status: 409 })

  // Refuse if any inbound reply looks like an opt-out
  const { data: inbound } = await supabase.from('messages').select('body')
    .eq('prospect_id', prospect.id).eq('direction', 'inbound')
  if ((inbound || []).some(m => isOptOut(m.body))) {
    return NextResponse.json({ error: 'Prospect replied with an opt-out' }, { status: 409 })
  }

  // Sticky from_number
  let fromNumber = prospect.from_number
  if (!fromNumber) {
    fromNumber = assignKixieNumber(prospect.phone)
    if (!fromNumber) return NextResponse.json({ error: 'No Kixie number configured for this prospect' }, { status: 400 })
    await supabase.from('prospects').update({ from_number: fromNumber }).eq('id', prospect.id)
  }

  const result = await sendKixieSms({ to: prospect.phone, body, fromNumber })
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status || 502 })

  const { data: message, error: mErr } = await supabase.from('messages').insert({
    prospect_id: prospect.id,
    direction: 'outbound',
    body,
    status: 'sent',
    kixie_message_id: result.messageId,
    sequence_step: step,
    brand: prospect.brand || 'mj',
    from_number: fromNumber,
    batch_id: prospect.batch_id || null,
  }).select().single()
  if (mErr) return NextResponse.json({ error: `Sent, but failed to log message: ${mErr.message}` }, { status: 500 })

  let stage = prospect.stage
  const nextStage = STEP_TO_STAGE[step]
  if (nextStage && !NO_REGRESS.includes(prospect.stage)) {
    await supabase.from('prospects').update({ stage: nextStage, updated_at: new Date().toISOString() }).eq('id', prospect.id)
    stage = nextStage
  }

  return NextResponse.json({ success: true, message, stage, from_number: fromNumber })
}
