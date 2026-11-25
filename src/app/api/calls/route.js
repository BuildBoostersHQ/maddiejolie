import { createClient } from '@supabase/supabase-js'
import { requireUser } from '@/lib/apiAuth'
import { NextResponse } from 'next/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Log a call
export async function POST(request) {
  const auth = await requireUser(request)
  if (auth.error) return auth.error
  try {
    const { prospect_id, outcome, notes } = await request.json()
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

    const { data, error } = await supabase
      .from('calls')
      .insert({ prospect_id, outcome, notes })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true, call: data })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// Get call log
export async function GET(request) {
  const auth = await requireUser(request)
  if (auth.error) return auth.error
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

    const { data: calls, error } = await supabase
      .from('calls')
      .select('*, prospects(name, owner_name, phone, trade, stage)')
      .order('called_at', { ascending: false })
      .limit(100)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Stats
    const total = calls.length
    const outcomes = {}
    for (const c of calls) {
      outcomes[c.outcome] = (outcomes[c.outcome] || 0) + 1
    }

    return NextResponse.json({ calls, total, outcomes })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
