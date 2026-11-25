// Kixie helper (server-side only).
// Docs: https://support.kixie.com/hc/en-us/articles/34368835359387-Send-SMS-API
//   POST https://apig.kixie.com/app/event?apikey=...&businessid=...
//   JSON body: { businessid, apikey, eventname: 'sms', target, email, message }
// NOTE: Kixie sends the SMS from the SMS number of the Kixie USER identified by `email`,
// not from an arbitrary from-number. So each Kixie number must belong to a Kixie user.
// Map numbers to user emails with KIXIE_FROM_EMAILS (JSON, e.g. {"+13055551234":"a@x.com"}),
// or set a single KIXIE_USER_EMAIL fallback.
// Unconfirmed: the docs show no response schema/status codes (message id field is guessed),
// and the businessid query param is shown with a colon in the article (we use "=").
// Requires Professional billing tier with API enabled by Kixie.
//
// Env: KIXIE_API_KEY, KIXIE_BUSINESS_ID, KIXIE_TEAM_SMS_ID (recommended), KIXIE_USER_EMAIL, KIXIE_FROM_EMAILS (optional),
//      KIXIE_API_URL (optional override), KIXIE_WEBHOOK_SECRET (webhook)

export const OPT_OUT_REGEX = /^\s*(stop|stopall|unsubscribe|cancel|end|quit|remove|wrong number)\b[\s.!]*$|\bwrong number\b/i

export function isOptOut(body) {
  return OPT_OUT_REGEX.test(body || '')
}

export function last10(phone) {
  return String(phone || '').replace(/\D/g, '').slice(-10)
}

function emailForNumber(fromNumber) {
  const key = last10(fromNumber)
  try {
    const map = JSON.parse(process.env.KIXIE_FROM_EMAILS || '{}')
    for (const [num, email] of Object.entries(map)) {
      if (last10(num) === key) return email
    }
  } catch {
    // invalid JSON: fall through to default
  }
  return process.env.KIXIE_USER_EMAIL || ''
}

export async function sendKixieSms({ to, body, fromNumber }) {
  const apikey = process.env.KIXIE_API_KEY
  const businessid = process.env.KIXIE_BUSINESS_ID
  if (!apikey || !businessid) {
    return { ok: false, status: 500, error: 'KIXIE_API_KEY / KIXIE_BUSINESS_ID not configured' }
  }
  // Preferred: Team SMS API (supports an explicit fromNumber when the Team SMS rule has several numbers).
  // Docs: https://developer.kixie.com/team-sms-api/  (eventname 'bizsms', id = Team SMS ID,
  // Manage > Numbers > Team SMS). Replies land in the shared Team SMS inbox.
  const teamId = process.env.KIXIE_TEAM_SMS_ID
  let payload
  if (teamId) {
    payload = {
      businessid, eventname: 'bizsms', id: Number(teamId) || teamId,
      target: last10(to), message: body, apikey,
    }
    if (fromNumber) payload.fromNumber = '1' + last10(fromNumber)
  } else {
    // Fallback: single-user Send SMS API (sends from that Kixie user's one designated number).
    const email = emailForNumber(fromNumber)
    if (!email) {
      return { ok: false, status: 500, error: `Set KIXIE_TEAM_SMS_ID (recommended) or KIXIE_USER_EMAIL / KIXIE_FROM_EMAILS` }
    }
    payload = { businessid, apikey, eventname: 'sms', target: last10(to), email, message: body }
  }
  const base = process.env.KIXIE_API_URL || 'https://apig.kixie.com/app/event'
  const url = `${base}?apikey=${encodeURIComponent(apikey)}&businessid=${encodeURIComponent(businessid)}`
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const text = await res.text()
    let data = {}
    try { data = JSON.parse(text) } catch { data = { raw: text } }
    if (!res.ok) return { ok: false, status: 502, error: `Kixie ${res.status}: ${text.slice(0, 200)}` }
    const messageId = data.messageid || data.messageId || data.id || data.data?.messageid || null
    return { ok: true, messageId, data }
  } catch (err) {
    return { ok: false, status: 502, error: `Kixie request failed: ${err.message}` }
  }
}
