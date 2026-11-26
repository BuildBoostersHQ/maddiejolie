import { NextResponse } from 'next/server'

// Server-side visit log for prospect demo pages.
//
// Runs on Vercel before the page is served, so ad blockers and privacy
// browsers can't stop it (unlike the Umami browser script). Each real visit
// to /demo/{slug} is written to the existing `page_visits` table, linked to
// the prospect whose `demo_slug` matches.

export const config = {
  matcher: '/demo/:path*',
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Link-preview fetchers, security scanners, crawlers and scripts. These load
// a link without a human opening it and would show up as fake "visits".
const NOT_A_PERSON =
  /bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp|telegram|slack|discord|skype|embedly|pinterest|headless|lighthouse|pagespeed|curl|wget|python|node-fetch|axios|go-http|java\/|okhttp|monitor|uptime|scanner|proofpoint|mimecast|barracuda|symantec|zscaler/i

export function middleware(request, event) {
  try {
    const { pathname } = request.nextUrl

    // Only the page itself: /demo/{slug}, /demo/{slug}/ or /demo/{slug}/index.html.
    // Skips images and other files under the same folder.
    const match = pathname.match(/^\/demo\/([a-z0-9-]+)(?:\/|\/index\.html)?$/)

    if (match && request.method === 'GET' && SUPABASE_URL && SUPABASE_KEY) {
      const ua = request.headers.get('user-agent') || ''
      const purpose = `${request.headers.get('sec-purpose') || ''} ${request.headers.get('purpose') || ''}`
      const isPrefetch = /prefetch|prerender/i.test(purpose)

      if (ua && !NOT_A_PERSON.test(ua) && !isPrefetch) {
        // waitUntil: the log write finishes after the page is already sent,
        // so it can never slow down or break the demo page.
        event.waitUntil(logVisit(match[1], request, ua))
      }
    }
  } catch (err) {
    // Never let logging break a page a prospect is trying to open.
  }

  return NextResponse.next()
}

async function logVisit(slug, request, ua) {
  try {
    const headers = {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
    }

    const lookup = await fetch(
      `${SUPABASE_URL}/rest/v1/prospects?demo_slug=eq.${encodeURIComponent(slug)}&select=id&limit=1`,
      { headers }
    )
    if (!lookup.ok) return
    const rows = await lookup.json()
    if (!rows.length) return

    const city = request.headers.get('x-vercel-ip-city')

    await fetch(`${SUPABASE_URL}/rest/v1/page_visits`, {
      method: 'POST',
      headers: { ...headers, Prefer: 'return=minimal' },
      body: JSON.stringify({
        prospect_id: rows[0].id,
        referrer: request.headers.get('referer') || null,
        device: /Mobi|Android|iPhone|iPad/i.test(ua) ? 'mobile' : 'desktop',
        city: city ? decodeURIComponent(city) : null,
        country: request.headers.get('x-vercel-ip-country') || null,
      }),
    })
  } catch (err) {
    // Logging is best-effort.
  }
}
