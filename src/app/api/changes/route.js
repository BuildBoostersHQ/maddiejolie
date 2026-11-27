import { requireUser } from '@/lib/apiAuth'
import { NextResponse } from 'next/server'

const API = (process.env.BB_API_URL || 'https://buildboosters.com').replace(/\/+$/, '')
export const dynamic = 'force-dynamic'

async function pass(request, method) {
  const auth = await requireUser(request)
  if (auth.error) return auth.error
  const secret = (process.env.BB_INTERNAL_SECRET || '').trim()
  if (!secret) return NextResponse.json({ error: 'not_configured' }, { status: 500 })
  try {
    const url = method === 'GET' ? `${API}/api/change-requests?all=true` : `${API}/api/change-requests`
    const body = method === 'POST' ? await request.json() : undefined
    // For POST, the dashboard sends { action: 'update', id, status, status_note }
    // which maps to PATCH on the BB side
    const bbMethod = body?.action === 'update' ? 'PATCH' : method
    const bbUrl = body?.action === 'update' ? `${API}/api/change-requests?id=${body.id}` : url
    const bbBody = body?.action === 'update' ? JSON.stringify({ status: body.status, status_note: body.status_note }) : (body ? JSON.stringify(body) : undefined)
    const res = await fetch(bbUrl, {
      method: bbMethod,
      headers: { 'x-bb-secret': secret, 'Content-Type': 'application/json' },
      body: bbBody,
      cache: 'no-store',
    })
    const data = await res.json().catch(() => ({ error: 'bad_response' }))
    return NextResponse.json(data, { status: res.status })
  } catch {
    return NextResponse.json({ error: 'cannot_reach_build_boosters' }, { status: 502 })
  }
}

export const GET = (r) => pass(r, 'GET')
export const POST = (r) => pass(r, 'POST')
