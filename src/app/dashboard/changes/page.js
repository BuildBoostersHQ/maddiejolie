'use client'
import { useState, useEffect, useCallback } from 'react'
import { authFetch } from '@/lib/authFetch'

const day = (iso) => (iso ? new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '')
const STATUSES = ['sent', 'working', 'done', 'closed']
const LABELS = { sent: 'Sent', working: 'Being worked on', done: 'Done', closed: 'Closed' }
const TONES = { sent: '#4a8ff7', working: '#d9a441', done: '#6aab7a', closed: 'rgba(255,255,255,0.35)' }

export default function ChangesPage() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('open') // open, all, done
  const [busy, setBusy] = useState('')

  const load = useCallback(async () => {
    // The change requests API lives on the Build Boosters site, proxied through /api/changes here
    const res = await authFetch('/api/changes')
    const json = await res.json().catch(() => ({}))
    if (!res.ok) { setError(json.error || 'Could not load change requests.'); return }
    setError(''); setData(json)
  }, [])
  useEffect(() => { load() }, [load])

  async function updateStatus(id, status, note) {
    setBusy(id)
    await authFetch('/api/changes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update', id, status, status_note: note || '' }),
    })
    await load()
    setBusy('')
  }

  if (error) return <div className="bg-dash-surface border border-dash-border rounded-xl p-5 text-sm text-dash-muted">{error}</div>
  if (!data) return <p className="text-sm text-dash-dim">Loading...</p>

  const requests = data.requests || []
  const filtered = filter === 'open' ? requests.filter(r => r.status === 'sent' || r.status === 'working')
    : filter === 'done' ? requests.filter(r => r.status === 'done' || r.status === 'closed')
    : requests

  const openCount = requests.filter(r => r.status === 'sent' || r.status === 'working').length
  const stats = [
    ['Open', openCount],
    ['Being worked on', requests.filter(r => r.status === 'working').length],
    ['Done this month', requests.filter(r => r.status === 'done' && new Date(r.updated_at) > new Date(Date.now() - 30 * 86400000)).length],
    ['Total', requests.length],
  ]

  return (
    <div>
      <h1 className="text-xl font-bold font-heading mb-1">Change Requests</h1>
      <p className="text-sm text-dash-muted mb-6">Every change request from every client, newest first.</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {stats.map(([label, n]) => (
          <div key={label} className="bg-dash-surface border border-dash-border rounded-xl p-4">
            <p className="text-[10px] text-dash-dim uppercase tracking-wider mb-1">{label}</p>
            <p className="text-2xl font-bold font-heading">{n}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mb-4">
        {['open', 'all', 'done'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${filter === f ? 'border-dash-text text-dash-text' : 'border-dash-border text-dash-muted hover:text-dash-text'}`}>
            {f === 'open' ? `Open (${openCount})` : f === 'all' ? 'All' : 'Done'}
          </button>
        ))}
      </div>

      <div className="bg-dash-surface border border-dash-border rounded-xl overflow-hidden">
        {!filtered.length ? <p className="p-5 text-sm text-dash-muted">No requests match this filter.</p> : null}
        {filtered.map(r => (
          <div key={r.id} className="p-4 border-t border-dash-border first:border-t-0">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: `${TONES[r.status]}22`, color: TONES[r.status] }}>
                    {LABELS[r.status]}
                  </span>
                  <span className="text-xs text-dash-muted">{r.category}</span>
                  <span className="text-xs text-dash-dim">{day(r.created_at)}</span>
                </div>
                <p className="text-sm">{r.body}</p>
                {r.business ? <p className="text-xs text-dash-muted mt-1">{r.business}</p> : null}
                {r.location ? <p className="text-xs text-dash-dim mt-0.5">Where: {r.location}</p> : null}
                {r.photo_count > 0 ? <p className="text-xs text-dash-dim mt-0.5">{r.photo_count} photo{r.photo_count === 1 ? '' : 's'} attached</p> : null}
                {r.status_note ? <p className="text-xs mt-1" style={{ color: TONES.done }}>Note: {r.status_note}</p> : null}
              </div>
              <div className="flex gap-2 flex-none">
                {r.status === 'sent' ? (
                  <button onClick={() => updateStatus(r.id, 'working')} disabled={busy === r.id}
                    className="text-xs px-3 py-1.5 rounded-lg border border-dash-border text-dash-muted hover:text-dash-text">
                    {busy === r.id ? '...' : 'Start working'}
                  </button>
                ) : null}
                {r.status === 'working' ? (
                  <button onClick={() => { const note = prompt('What did you do?'); if (note !== null) updateStatus(r.id, 'done', note); }} disabled={busy === r.id}
                    className="text-xs px-3 py-1.5 rounded-lg border border-dash-border text-dash-muted hover:text-dash-text">
                    {busy === r.id ? '...' : 'Mark done'}
                  </button>
                ) : null}
                {(r.status === 'sent' || r.status === 'working') ? (
                  <button onClick={() => { if (confirm('Close this request?')) updateStatus(r.id, 'closed', 'Closed without action'); }} disabled={busy === r.id}
                    className="text-xs px-3 py-1.5 rounded-lg border border-dash-border text-dash-muted hover:text-dash-text opacity-50">
                    Close
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
