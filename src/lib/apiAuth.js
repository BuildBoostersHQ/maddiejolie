// Server-side guard: API routes require a logged-in Supabase user (Bearer access token).
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export async function requireUser(request) {
  const header = request.headers.get('authorization') || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  const unauthorized = () => ({ error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) })
  if (!token || !SUPABASE_URL || !SUPABASE_KEY) return unauthorized()
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
  const { data, error } = await supabase.auth.getUser(token)
  if (error || !data?.user) return unauthorized()
  return { user: data.user }
}
