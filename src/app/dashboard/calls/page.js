'use client'
import { useState, useEffect } from 'react'
import { CALL_OUTCOMES } from '@/lib/constants'
import { useProspects } from '@/lib/useProspects'

function CallStats({ calls, prospects }) {
  const total = calls.length
  const today = calls.filter(c => {
    const d = new Date(c.called_at)
    const now = new Date()
    return d.toDateString() === now.toDateString()
  }).length

  // Conversion from pipeline
  const totalProspects = prospects.length
  const clicked = prospects.filter(p => ['clicked', 'engaged', 'responded', 'closed'].includes(p.stage)).length
  const engaged = prospects.filter(p => ['engaged', 'responded', 'closed'].includes(p.stage)).length
  const responded = prospects.filter(p => ['responded', 'closed'].includes(p.stage)).length

  const clickPct = totalProspects > 0 ? Math.round((clicked / totalProspects) * 100) : 0
  const engagedPct = totalProspects > 0 ? Math.round((engaged / totalProspects) * 100) : 0
  const respondedPct = totalProspects > 0 ? Math.round((responded / totalProspects) * 100) : 0

  // Call outcomes
  const talked = calls.filter(c => ['talked', 'booked', 'closed'].includes(c.outcome)).length
  const booked = calls.filter(c => ['booked', 'closed'].includes(c.outcome)).length
  const closed = calls.filter(c => c.outcome === 'closed').length
  const connectRate = total > 0 ? Math.round((talked / total) * 100) : 0
  const closeRate = talked > 0 ? Math.round((closed / talked) * 100) : 0

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      <div className="bg-dash-surface border border-dash-border rounded-xl p-4">
        <p className="text-[10px] text-dash-dim uppercase tracking-wider mb-1">Calls today</p>
        <p className="text-2xl font-bold font-heading">{today}</p>
        <p className="text-xs text-dash-muted mt-1">{total} all time</p>
      </div>
      <div className="bg-dash-surface border border-dash-border rounded-xl p-4">
        <p className="text-[10px] text-dash-dim uppercase tracking-wider mb-1">Connect rate</p>
        <p className="text-2xl font-bold font-heading">{connectRate}%</p>
        <p className="text-xs text-dash-muted mt-1">{talked} conversations</p>
      </div>
      <div className="bg-dash-surface border border-dash-border rounded-xl p-4">
        <p className="text-[10px] text-dash-dim uppercase tracking-wider mb-1">Pipeline rates</p>
        <div className="flex gap-2 mt-1">
          <span className="text-xs"><span className="text-pink-400/70">{clickPct}%</span> clicked</span>
          <span className="text-xs"><span className="text-violet-400/70">{engagedPct}%</span> engaged</span>
          <span className="text-xs"><span className="text-amber-400/70">{respondedPct}%</span> replied</span>
        </div>
      </div>
      <div className="bg-dash-surface border border-dash-border rounded-xl p-4">
        <p className="text-[10px] text-dash-dim uppercase tracking-wider mb-1">Close rate</p>
        <p className="text-2xl font-bold font-heading" style={{ color: '#6aab7a' }}>{closeRate}%</p>
        <p className="text-xs text-dash-muted mt-1">{closed} closed / {talked} talked</p>
      </div>
    </div>
  )
}

export default function CallsPage() {
  const { prospects } = useProspects()
  const [calls, setCalls] = useState([])
  const [loading, setLoading] = useState(true)
  const [showLog, setShowLog] = useState(false)
  const [selectedProspect, setSelectedProspect] = useState('')
  const [selectedOutcome, setSelectedOutcome] = useState('')
  const [callNotes, setCallNotes] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchCalls()
  }, [])

  async function fetchCalls() {
    try {
      const res = await fetch('/api/calls')
      const data = await res.json()
      if (data.calls) setCalls(data.calls)
    } catch (err) {}
    setLoading(false)
  }

  async function logCall() {
    if (!selectedProspect || !selectedOutcome) return
    setSaving(true)

    try {
      await fetch('/api/calls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prospect_id: parseInt(selectedProspect),
          outcome: selectedOutcome,
          notes: callNotes,
        }),
      })
      setSelectedProspect('')
      setSelectedOutcome('')
      setCallNotes('')
      await fetchCalls()
    } catch (err) {}
    setSaving(false)
  }

  // Warm prospects to call (clicked/engaged, sorted by score)
  const callList = prospects
    .filter(p => ['clicked', 'engaged', 'responded'].includes(p.stage))
    .sort((a, b) => b.score - a.score)

  return (
    <div className="pb-20 lg:pb-6">
      <div className="mb-6">
        <h1 className="text-xl lg:text-2xl font-bold font-heading">Calls</h1>
        <p className="text-sm text-dash-muted mt-1">Log calls and track conversion</p>
      </div>

      {!loading && <CallStats calls={calls} prospects={prospects} />}

      {/* Quick log */}
      <div className="bg-dash-surface border border-dash-border rounded-xl p-4 lg:p-5 mb-6">
        <h2 className="text-sm font-semibold font-heading mb-3">Log a call</h2>
        <div className="flex flex-wrap gap-3">
          <select
            value={selectedProspect}
            onChange={(e) => setSelectedProspect(e.target.value)}
            className="flex-1 min-w-[200px] bg-dash-bg border border-dash-border rounded-lg px-3 py-2.5 text-sm text-dash-text focus:outline-none focus:border-violet-500/30 transition-all appearance-none"
          >
            <option value="">Select prospect...</option>
            {prospects.map(p => (
              <option key={p.id} value={p.id}>{p.name} — {p.owner}</option>
            ))}
          </select>
          <select
            value={selectedOutcome}
            onChange={(e) => setSelectedOutcome(e.target.value)}
            className="bg-dash-bg border border-dash-border rounded-lg px-3 py-2.5 text-sm text-dash-text focus:outline-none focus:border-violet-500/30 transition-all appearance-none"
          >
            <option value="">Outcome...</option>
            {CALL_OUTCOMES.map(o => (
              <option key={o.id} value={o.id}>{o.label}</option>
            ))}
          </select>
          <input
            type="text"
            value={callNotes}
            onChange={(e) => setCallNotes(e.target.value)}
            placeholder="Notes (optional)"
            className="flex-1 min-w-[150px] bg-dash-bg border border-dash-border rounded-lg px-3 py-2.5 text-sm text-dash-text placeholder-dash-dim focus:outline-none focus:border-violet-500/30 transition-all"
          />
          <button
            onClick={logCall}
            disabled={!selectedProspect || !selectedOutcome || saving}
            className="px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-all disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, #7c83b8, #8e8fc8)' }}
          >
            {saving ? 'Saving...' : 'Log'}
          </button>
        </div>
      </div>

      {/* Call list — warm prospects to call */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-dash-surface border border-dash-border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-dash-border">
            <h2 className="text-sm font-semibold font-heading">Warm prospects to call</h2>
            <p className="text-xs text-dash-dim mt-0.5">Clicked or engaged, sorted by score</p>
          </div>
          <div className="divide-y divide-dash-border/30">
            {callList.length === 0 && (
              <p className="py-8 text-center text-sm text-dash-dim">No warm prospects yet</p>
            )}
            {callList.map(p => (
              <div key={p.id} className="flex items-center justify-between px-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{p.name}</p>
                  <p className="text-xs text-dash-dim">{p.owner} · {p.trade} · {p.pageViews}x visited</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-dash-dim">{p.score}</span>
                  <a
                    href={`tel:${p.phone.replace(/\D/g, '')}`}
                    className="w-8 h-8 rounded-full bg-green-500/10 hover:bg-green-500/20 text-green-400/70 flex items-center justify-center transition-smooth"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                    </svg>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent call log */}
        <div className="bg-dash-surface border border-dash-border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-dash-border">
            <h2 className="text-sm font-semibold font-heading">Recent calls</h2>
          </div>
          <div className="divide-y divide-dash-border/30">
            {calls.length === 0 && (
              <p className="py-8 text-center text-sm text-dash-dim">No calls logged yet</p>
            )}
            {calls.slice(0, 20).map(c => {
              const outcome = CALL_OUTCOMES.find(o => o.id === c.outcome)
              const outcomeColor = {
                no_answer: '#5a5a5e',
                voicemail: '#7c83b8',
                talked: '#c89f80',
                booked: '#b896c7',
                closed: '#6aab7a',
                not_interested: '#cc9299',
              }[c.outcome] || '#5a5a5e'

              return (
                <div key={c.id} className="px-4 py-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium">{c.prospects?.name || 'Unknown'}</p>
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-white"
                      style={{ background: outcomeColor }}
                    >
                      {outcome?.label || c.outcome}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-dash-dim">{c.prospects?.owner_name}</p>
                    <p className="text-[10px] text-dash-dim">
                      {new Date(c.called_at).toLocaleString('en-US', {
                        month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
                      })}
                    </p>
                  </div>
                  {c.notes && <p className="text-xs text-dash-muted mt-1">{c.notes}</p>}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
