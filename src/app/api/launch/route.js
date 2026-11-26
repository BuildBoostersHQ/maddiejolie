import { requireUser } from '@/lib/apiAuth'
import { NextResponse } from 'next/server'

// The launch list lives with the Build Boosters site (buildboosters.com/api/launch). This route passes the
// request through for a logged-in dashboard user, and keeps the shared secret on the server.
// Needs BB_INTERNAL_SECRET in Vercel, the same value as on the Build Boosters site.
const API = (process.env.BB_API_URL || 'https://buildboosters.com').replace(/\/+$/, '')
export const dynamic = 'force-dynamic'

async function pass(request, method) {
  const auth = await requireUser(request)
  if (auth.error) return auth.error
  const secret = (process.env.BB_INTERNAL_SECRET || '').trim()
  if (!secret) return NextResponse.json({ error: 'not_configured' }, { status: 500 })
  try {
    const res = await fetch(`${API}/api/launch`, {
      method,
      headers: { 'x-bb-secret': secret, 'Content-Type': 'application/json' },
      body: method === 'POST' ? JSON.stringify(await request.json()) : undefined,
      cache: 'no-store',
    })
    const data = await res.json().catch(() => ({ error: 'bad_response' }))
    return NextResponse.json(data, { status: res.status })
  } catch (err) {
    return NextResponse.json({ error: 'cannot_reach_build_boosters' }, { status: 502 })
  }
}

export const GET = (request) => pass(request, 'GET')
export const POST = (request) => pass(request, 'POST')
