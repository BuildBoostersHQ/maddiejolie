'use client'
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

// Press outreach. Every pitch is a draft until Maddie approves it, and nothing is sent from here:
// an approved pitch opens in her own email, so it goes out from her address and lands like a
// personal note. Follow-ups come due 4 and 9 days after the pitch was sent.

const DAY = 86400000
const day = (iso) => (iso ? new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '')
const daysSince = (iso) => (iso ? Math.floor((Date.now() - new Date(iso).getTime()) / DAY) : 0)
const KINDS = { journalist: 'Journalist', podcast: 'Podcast', newsletter: 'Newsletter' }
const TONE = { good: '#6aab7a', wait: '#d9a441', blue: '#4a8ff7', none: 'rgba(255,255,255,0.35)' }

// Where a contact stands, and what Maddie can do next.
function stage(c) {
  if (c.status === 'replied') return { key: 'replied', label: `Replied ${day(c.replied_at)}`, tone: TONE.good }
  if (c.status === 'passed') return { key: 'closed', label: 'Passed', tone: TONE.none }
  if (!c.approved_at) return { key: 'approve', label: 'Needs your approval', tone: TONE.wait }
  if (!c.sent_at) return { key: 'send', label: 'Approved, ready to send', tone: TONE.blue, step: 'pitch' }
  const d = daysSince(c.sent_at)
  if (!c.followup_1_sent_at && d >= 4) return { key: 'send', label: 'Follow-up 1 is due', tone: TONE.blue, step: 'followup_1' }
  if (c.followup_1_sent_at && !c.followup_2_sent_at && d >= 9) return { key: 'send', label: 'Follow-up 2 is due', tone: TONE.blue, step: 'followup_2' }
  if (c.followup_2_sent_at) return { key: 'waiting', label: `No reply after both follow-ups`, tone: TONE.none }
  return { key: 'waiting', label: `Sent ${day(c.sent_at)}, follow-up ${c.followup_1_sent_at ? 2 : 1} on day ${c.followup_1_sent_at ? 9 : 4}`, tone: TONE.none }
}

const TABS = [['approve', 'To approve'], ['send', 'Ready to send'], ['waiting', 'Waiting'], ['replied', 'Replied'], ['all', 'All']]
const inputClass = 'w-full bg-transparent border border-dash-border rounded-lg px-3 py-2 text-sm'
const btn = 'text-xs px-3 py-1.5 rounded-lg border border-dash-border text-dash-muted hover:text-dash-text'
const btnMain = 'text-xs px-3 py-1.5 rounded-lg border border-dash-text text-dash-text'

function Contact({ c, onSave, busy }) {
  const s = stage(c)
  const [open, setOpen] = useState(s.key === 'approve' || s.key === 'send')
  const [draft, setDraft] = useState(c)
  useEffect(() => { setDraft(c) }, [c])
  const set = (k) => (e) => setDraft({ ...draft, [k]: e.target.value })
  const dirty = ['pitch_subject', 'pitch_body', 'followup_1_body', 'followup_2_body', 'email', 'notes'].some((k) => (draft[k] || '') !== (c[k] || ''))
  const now = () => new Date().toISOString()

  const bodyFor = { pitch: draft.pitch_body, followup_1: draft.followup_1_body, followup_2: draft.followup_2_body }[s.step] || ''
  const subject = s.step === 'pitch' ? draft.pitch_subject : `Re: ${draft.pitch_subject || ''}`
  const mailto = `mailto:${encodeURIComponent(draft.email || '')}?subject=${encodeURIComponent(subject || '')}&body=${encodeURIComponent(bodyFor || '')}`
  const sentField = { pitch: 'sent_at', followup_1: 'followup_1_sent_at', followup_2: 'followup_2_sent_at' }[s.step]

  return (
    <div className="p-4 border-t border-dash-border first:border-t-0">
      <button className="w-full text-left" onClick={() => setOpen(!open)}>
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: `${s.tone}22`, color: s.tone }}>{s.label}</span>
          <span className="text-xs text-dash-dim">{KINDS[c.kind] || c.kind}</span>
        </div>
        <p className="text-sm font-medium">{c.name}{c.outlet && c.outlet !== c.name ? <span className="text-dash-muted font-normal">, {c.outlet}</span> : null}</p>
        {c.beat ? <p className="text-xs text-dash-dim mt-0.5">{c.beat}</p> : null}
      </button>

      {open ? (
        <div className="mt-3 grid gap-3">
          {c.recent_piece_url ? (
            <p className="text-xs text-dash-muted">Recent piece: <a className="underline" href={c.recent_piece_url} target="_blank" rel="noopener noreferrer">{c.recent_piece_title || c.recent_piece_url}</a></p>
          ) : null}
          <div className="grid gap-3 lg:grid-cols-2">
            <div>
              <label className="text-xs text-dash-muted block mb-1">Email</label>
              <input className={inputClass} value={draft.email || ''} onChange={set('email')} placeholder="Not found yet" />
              {!draft.email && c.contact_url ? <a className="text-xs underline text-dash-muted mt-1 inline-block" href={c.contact_url} target="_blank" rel="noopener noreferrer">Their contact page</a> : null}
            </div>
            <div>
              <label className="text-xs text-dash-muted block mb-1">Subject</label>
              <input className={inputClass} value={draft.pitch_subject || ''} onChange={set('pitch_subject')} />
            </div>
          </div>
          <div>
            <label className="text-xs text-dash-muted block mb-1">Pitch</label>
            <textarea className={inputClass} rows={9} value={draft.pitch_body || ''} onChange={set('pitch_body')} />
          </div>
          <div className="grid gap-3 lg:grid-cols-2">
            <div>
              <label className="text-xs text-dash-muted block mb-1">Follow-up 1, day 4</label>
              <textarea className={inputClass} rows={4} value={draft.followup_1_body || ''} onChange={set('followup_1_body')} />
            </div>
            <div>
              <label className="text-xs text-dash-muted block mb-1">Follow-up 2, day 9</label>
              <textarea className={inputClass} rows={4} value={draft.followup_2_body || ''} onChange={set('followup_2_body')} />
            </div>
          </div>
          <div>
            <label className="text-xs text-dash-muted block mb-1">Notes</label>
            <input className={inputClass} value={draft.notes || ''} onChange={set('notes')} />
          </div>

          <div className="flex flex-wrap gap-2">
            {dirty ? <button className={btnMain} disabled={busy} onClick={() => onSave(c.id, { pitch_subject: draft.pitch_subject, pitch_body: draft.pitch_body, followup_1_body: draft.followup_1_body, followup_2_body: draft.followup_2_body, email: draft.email, notes: draft.notes })}>Save edits</button> : null}
            {s.key === 'approve' && !dirty ? <button className={btnMain} disabled={busy || !draft.pitch_body} onClick={() => onSave(c.id, { approved_at: now(), status: 'approved' })}>Approve this pitch</button> : null}
            {s.key === 'send' && !dirty ? (
              <>
                <a className={btnMain} href={mailto}>{draft.email ? 'Open in my email' : 'Open in my email (add their address there)'}</a>
                <button className={btn} disabled={busy} onClick={() => onSave(c.id, { [sentField]: now(), status: s.step === 'pitch' ? 'sent' : `${s.step}_sent` })}>I sent it</button>
              </>
            ) : null}
            {c.approved_at && !c.sent_at ? <button className={btn} disabled={busy} onClick={() => onSave(c.id, { approved_at: null, status: 'drafted' })}>Take back approval</button> : null}
            {c.sent_at && c.status !== 'replied' ? <button className={btn} disabled={busy} onClick={() => onSave(c.id, { replied_at: now(), status: 'replied' })}>They replied</button> : null}
            {c.status !== 'passed' && c.status !== 'replied' ? <button className={`${btn} opacity-50`} disabled={busy} onClick={() => onSave(c.id, { status: 'passed' })}>Pass</button> : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}

const EMPTY = { name: '', outlet: '', kind: 'journalist', email: '', recent_piece_title: '', recent_piece_url: '' }

export default function PressPage() {
  const [rows, setRows] = useState(null)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('approve')
  const [busy, setBusy] = useState(false)
  const [adding, setAdding] = useState(false)
  const [fresh, setFresh] = useState(EMPTY)

  const load = useCallback(async () => {
    if (!supabase) { setError('Supabase is not configured on this site.'); return }
    const { data, error: err } = await supabase.from('press_contacts').select('*').order('created_at', { ascending: false })
    if (err) { setError(/press_contacts/.test(err.message) ? 'The press table does not exist yet. Run supabase/add-press.sql in the Supabase SQL editor.' : err.message); return }
    setError(''); setRows(data || [])
  }, [])
  useEffect(() => { load() }, [load])

  async function save(id, patch) {
    setBusy(true)
    const { error: err } = await supabase.from('press_contacts').update(patch).eq('id', id)
    if (err) setError(err.message)
    await load(); setBusy(false)
  }
  async function add(e) {
    e.preventDefault()
    setBusy(true)
    const { error: err } = await supabase.from('press_contacts').insert({ ...fresh, status: 'found' })
    if (err) setError(err.message); else { setFresh(EMPTY); setAdding(false) }
    await load(); setBusy(false)
  }

  if (error && !rows) return <div className="bg-dash-surface border border-dash-border rounded-xl p-5 text-sm text-dash-muted">{error}</div>
  if (!rows) return <p className="text-sm text-dash-dim">Loading...</p>

  const staged = rows.map((c) => ({ c, s: stage(c) }))
  const count = (k) => staged.filter((x) => x.s.key === k).length
  const shown = tab === 'all' ? staged : staged.filter((x) => x.s.key === tab)
  const stats = [['To approve', count('approve')], ['Ready to send', count('send')], ['Waiting on a reply', count('waiting')], ['Replied', count('replied')]]

  return (
    <div>
      <div className="flex items-start justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-bold font-heading mb-1">Press</h1>
          <p className="text-sm text-dash-muted">Journalists, podcasts and newsletters. Nothing goes out until you approve it and send it yourself.</p>
        </div>
        <button className={btn} onClick={() => setAdding(!adding)}>{adding ? 'Cancel' : 'Add a contact'}</button>
      </div>
      {error ? <p className="text-xs mb-3" style={{ color: '#e5687a' }}>{error}</p> : null}

      {adding ? (
        <form onSubmit={add} className="bg-dash-surface border border-dash-border rounded-xl p-4 mb-6 grid gap-3 lg:grid-cols-2">
          <input className={inputClass} required placeholder="Name" value={fresh.name} onChange={(e) => setFresh({ ...fresh, name: e.target.value })} />
          <input className={inputClass} placeholder="Outlet or show" value={fresh.outlet} onChange={(e) => setFresh({ ...fresh, outlet: e.target.value })} />
          <select className={inputClass} value={fresh.kind} onChange={(e) => setFresh({ ...fresh, kind: e.target.value })}>
            {Object.entries(KINDS).map(([k, v]) => <option key={k} value={k} style={{ color: '#000' }}>{v}</option>)}
          </select>
          <input className={inputClass} type="email" placeholder="Email" value={fresh.email} onChange={(e) => setFresh({ ...fresh, email: e.target.value })} />
          <input className={inputClass} placeholder="A recent piece of theirs" value={fresh.recent_piece_title} onChange={(e) => setFresh({ ...fresh, recent_piece_title: e.target.value })} />
          <input className={inputClass} type="url" placeholder="Link to that piece" value={fresh.recent_piece_url} onChange={(e) => setFresh({ ...fresh, recent_piece_url: e.target.value })} />
          <div><button className={btnMain} disabled={busy}>Add</button></div>
        </form>
      ) : null}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {stats.map(([label, n]) => (
          <div key={label} className="bg-dash-surface border border-dash-border rounded-xl p-4">
            <p className="text-xs text-dash-dim mb-1">{label}</p>
            <p className="text-2xl font-bold font-heading">{n}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {TABS.map(([k, label]) => (
          <button key={k} onClick={() => setTab(k)}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${tab === k ? 'border-dash-text text-dash-text' : 'border-dash-border text-dash-muted hover:text-dash-text'}`}>
            {label}{k !== 'all' ? ` (${count(k)})` : ''}
          </button>
        ))}
      </div>

      <div className="bg-dash-surface border border-dash-border rounded-xl overflow-hidden">
        {!shown.length ? <p className="p-5 text-sm text-dash-muted">Nothing here right now.</p> : null}
        {shown.map(({ c }) => <Contact key={c.id} c={c} onSave={save} busy={busy} />)}
      </div>
    </div>
  )
}
