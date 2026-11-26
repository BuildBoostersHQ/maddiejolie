'use client'
import { useState, useEffect, useCallback } from 'react'
import { authFetch } from '@/lib/authFetch'

const day = (iso) => (iso ? new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '')
const daysSince = (iso) => (iso ? Math.floor((Date.now() - new Date(iso).getTime()) / 86400000) : 0)

const ERRORS = {
  not_configured: 'BB_INTERNAL_SECRET is missing in Vercel, on this site or on the Build Boosters site.',
  unauthorized: 'The secret on this site does not match the one on the Build Boosters site.',
  cannot_reach_build_boosters: 'Could not reach buildboosters.com.',
  server_error: 'The Build Boosters site hit an error. If the reason is table_missing or table_out_of_date, rerun supabase/client_onboarding.sql.',
}

function a2p(c) {
  if (c.a2p_approved_at) return { label: `Approved ${day(c.a2p_approved_at)}`, tone: 'good' }
  if (/rejected/.test(c.a2p_status)) return { label: `${c.a2p_status.split('_')[0]} rejected`, tone: 'bad' }
  if (c.a2p_status === 'brand_approved') return { label: 'Brand approved, campaign pending', tone: 'wait' }
  if (c.a2p_status) return { label: c.a2p_status.replace(/_/g, ' '), tone: 'wait' }
  return { label: 'No word yet', tone: 'none' }
}
const TONE = { good: '#6aab7a', bad: '#e5687a', wait: '#d9a441', none: 'rgba(255,255,255,0.35)' }

function Dot({ on, label }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-dash-muted mr-3">
      <span className="w-2 h-2 rounded-full" style={{ background: on ? TONE.good : 'rgba(255,255,255,0.15)' }} />
      {label}
    </span>
  )
}

export default function LaunchPage() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState('')

  const load = useCallback(async () => {
    const res = await authFetch('/api/launch')
    const json = await res.json().catch(() => ({}))
    if (!res.ok) { setError(`${ERRORS[json.error] || 'Could not load the launch list.'}${json.reason ? ` (${json.reason})` : ''}`); return }
    setError(''); setData(json)
  }, [])
  useEffect(() => { load() }, [load])

  async function act(body, key) {
    setBusy(key)
    await authFetch('/api/launch', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    await load(); setBusy('')
  }

  if (error) return <div className="bg-dash-surface border border-dash-border rounded-xl p-5 text-sm text-dash-muted">{error}</div>
  if (!data) return <p className="text-sm text-dash-dim">Loading...</p>

  const clients = data.clients || []
  const events = data.events || []
  const byId = Object.fromEntries(clients.map((c) => [c.id, c]))
  const look = events.filter((e) => e.needs_look)
  const waiting = clients.filter((c) => !c.a2p_approved_at)
  const live = clients.filter((c) => c.a2p_approved_at)
  const stats = [
    ['Clients', clients.length, `${live.length} with the full site live`],
    ['Waiting on A2P', waiting.length, `${waiting.filter((c) => /rejected/.test(c.a2p_status)).length} rejected`],
    ['Form not done', clients.filter((c) => !c.form_done).length, 'still filling in the setup page'],
    ['Emails to look at', look.length, 'could not be read or matched'],
  ]

  return (
    <div>
      <h1 className="text-xl font-bold font-heading mb-1">Launch</h1>
      <p className="text-sm text-dash-muted mb-6">Every client from setup form to full site. A2P status comes from HighLevel&apos;s emails, checked twice a day.</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {stats.map(([label, n, sub]) => (
          <div key={label} className="bg-dash-surface border border-dash-border rounded-xl p-4">
            <p className="text-[10px] text-dash-dim uppercase tracking-wider mb-1">{label}</p>
            <p className="text-2xl font-bold font-heading">{n}</p>
            <p className="text-xs text-dash-muted mt-1">{sub}</p>
          </div>
        ))}
      </div>

      {look.length ? (
        <div className="bg-dash-surface border border-dash-border rounded-xl p-4 mb-6">
          <p className="text-[10px] text-dash-dim uppercase tracking-wider mb-3">Needs a look</p>
          {look.map((e) => (
            <div key={e.id} className="flex flex-wrap items-center justify-between gap-2 py-2 border-t border-dash-border first:border-t-0">
              <div className="min-w-0">
                <p className="text-sm truncate">{e.subject || '(no subject)'}</p>
                <p className="text-xs text-dash-muted">
                  {day(e.sent_at || e.received_at)} · {byId[e.client_id] ? byId[e.client_id].business : 'no client matched'} · {e.registration_type} {e.status}
                  {e.reason ? ` · ${e.reason}` : ''}
                </p>
              </div>
              <button onClick={() => act({ action: 'dismiss', event: e.id }, e.id)} disabled={busy === e.id} className="text-xs px-3 py-1.5 rounded-lg border border-dash-border text-dash-muted hover:text-dash-text">
                {busy === e.id ? 'Clearing...' : 'Dealt with it'}
              </button>
            </div>
          ))}
        </div>
      ) : null}

      <div className="bg-dash-surface border border-dash-border rounded-xl overflow-hidden">
        {clients.length === 0 ? <p className="p-5 text-sm text-dash-muted">No clients yet. They show up here as soon as their setup link exists.</p> : null}
        {clients.map((c) => {
          const s = a2p(c)
          const missing = [!c.has_location_id && 'sub-account id', !c.has_deploy_hook && 'deploy hook'].filter(Boolean)
          return (
            <div key={c.id} className="p-4 border-t border-dash-border first:border-t-0">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{c.business || c.first_name || 'Unnamed client'}</p>
                  <p className="text-xs text-dash-muted">
                    {[c.first_name, c.trade, c.tier].filter(Boolean).join(' · ')} · day {daysSince(c.created_at)}
                    {c.launch_call_start ? ` · launch call ${day(c.launch_call_start)}` : ''}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold" style={{ color: TONE[s.tone] }}>{s.label}</p>
                  <p className="text-xs text-dash-muted">{c.a2p_approved_at ? (c.site_rebuild_requested_at ? 'Site rebuilt as full' : 'Approved, no rebuild sent') : 'Site is thin'}</p>
                </div>
              </div>
              <div className="mt-3">
                <Dot on={c.form_done} label="Form" />
                <Dot on={c.google_approved} label={c.google_approved ? 'Google access' : c.google_requested ? 'Google requested' : 'Google'} />
                <Dot on={c.photo_count > 0} label={`${c.photo_count} photos`} />
                <Dot on={c.sms_consent} label="Text consent" />
                <Dot on={!!c.a2p_approved_at} label="A2P" />
              </div>
              {c.a2p_reason ? <p className="text-xs mt-2" style={{ color: TONE.bad }}>Rejected: {c.a2p_reason}</p> : null}
              <div className="flex flex-wrap items-center gap-3 mt-3">
                <a className="text-xs text-dash-muted underline" href={`https://buildboosters.com/start/${c.code}`} target="_blank" rel="noreferrer">Setup page</a>
                {missing.length ? <span className="text-xs" style={{ color: TONE.wait }}>Missing {missing.join(' and ')}, so approval cannot flip this site on its own</span> : null}
                {!c.a2p_approved_at ? (
                  <button onClick={() => { if (window.confirm(`Mark ${c.business || 'this client'} as A2P approved? This switches their site to full and deletes their EIN.`)) act({ action: 'approve', id: c.id }, c.id) }} disabled={busy === c.id} className="text-xs px-3 py-1.5 rounded-lg border border-dash-border text-dash-muted hover:text-dash-text ml-auto">
                    {busy === c.id ? 'Saving...' : 'Mark approved'}
                  </button>
                ) : null}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
