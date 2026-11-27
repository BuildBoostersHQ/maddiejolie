import { requireUser } from '@/lib/apiAuth'
import { NextResponse } from 'next/server'

const API = (process.env.BB_API_URL || 'https://buildboosters.com').replace(/\/+$/, '')
export const dynamic = 'force-dynamic'

export async function GET(request) {
  const auth = await requireUser(request)
  if (auth.error) return auth.error
  const secret = (process.env.BB_INTERNAL_SECRET || '').trim()
  if (!secret) return NextResponse.json({ error: 'not_configured' }, { status: 500 })
  try {
    const res = await fetch(`${API}/api/tasks`, {
      headers: { 'x-bb-secret': secret },
      cache: 'no-store',
    })
    const data = await res.json().catch(() => ({ error: 'bad_response' }))
    return NextResponse.json(data, { status: res.status })
  } catch {
    return NextResponse.json({ error: 'cannot_reach_build_boosters' }, { status: 502 })
  }
}
