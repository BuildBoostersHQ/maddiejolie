import { createClient } from '@supabase/supabase-js'
import { requireUser } from '@/lib/apiAuth'
import { NextResponse } from 'next/server'

const TWILIO_SID = process.env.TWILIO_ACCOUNT_SID
const TWILIO_TOKEN = process.env.TWILIO_AUTH_TOKEN
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Verify a batch of unverified phone numbers
// Called repeatedly until all are verified
export async function POST(request) {
  const auth = await requireUser(request)
  if (auth.error) return auth.error
  try {
    if (!TWILIO_SID || !TWILIO_TOKEN) {
      return NextResponse.json({ error: 'Twilio credentials not configured' }, { status: 500 })
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

    // Get up to 15 unverified prospects (small batch for timeout safety)
    const { data: prospects, error: fetchError } = await supabase
      .from('prospects')
      .select('id, phone')
      .eq('phone_type', 'unverified')
      .limit(15)

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    if (!prospects || prospects.length === 0) {
      return NextResponse.json({ done: true, message: 'All phones verified', verified: 0, remaining: 0 })
    }

    let mobile = 0, landline = 0, voip = 0, errors = 0
    const auth = Buffer.from(`${TWILIO_SID}:${TWILIO_TOKEN}`).toString('base64')

    for (const p of prospects) {
      try {
        const phone = p.phone.replace(/\D/g, '')
        if (!phone || phone.length < 10) {
          await supabase.from('prospects').update({ phone_type: 'invalid' }).eq('id', p.id)
          errors++
          continue
        }

        const number = phone.startsWith('1') ? `+${phone}` : `+1${phone}`
        const res = await fetch(
          `https://lookups.twilio.com/v2/PhoneNumbers/${number}?Fields=line_type_intelligence`,
          { headers: { Authorization: `Basic ${auth}` } }
        )

        if (!res.ok) {
          await supabase.from('prospects').update({ phone_type: 'error' }).eq('id', p.id)
          errors++
          continue
        }

        const data = await res.json()
        const lineType = data.line_type_intelligence?.type || 'unknown'

        await supabase.from('prospects').update({ phone_type: lineType }).eq('id', p.id)

        if (lineType === 'mobile') mobile++
        else if (lineType === 'nonFixedVoip') voip++
        else landline++

      } catch (err) {
        await supabase.from('prospects').update({ phone_type: 'error' }).eq('id', p.id)
        errors++
      }
    }

    // Check how many are still unverified
    const { count } = await supabase
      .from('prospects')
      .select('id', { count: 'exact', head: true })
      .eq('phone_type', 'unverified')

    return NextResponse.json({
      done: (count || 0) === 0,
      verified: prospects.length,
      mobile,
      landline,
      voip,
      errors,
      remaining: count || 0,
    })

  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
