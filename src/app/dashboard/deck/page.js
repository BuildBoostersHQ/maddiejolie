'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { authFetch } from '@/lib/authFetch'

// Launch deck generator. Pick a client who is getting ready to launch and the deck fills itself in
// from their Build Boosters record. Goals are the sales notes on that record, edited here.
// Present it full screen on the launch call, or print it to a PDF.

const NAVY = '#0b2440', AMBER = '#f2a20c', TEXT = '#121a24', MUTED = '#5b6878', SOFT = '#f3f5f8', LINE = '#e4e9ef'
const FONTS = 'https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800&family=Plus+Jakarta+Sans:wght@400;600;800&display=swap'
const body = { fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif', color: TEXT }
const label = { fontFamily: '"Barlow Condensed", "Arial Narrow", sans-serif', fontWeight: 700, color: AMBER, fontSize: '1.5em', letterSpacing: '.04em' }
const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`
const phone = (p) => { const d = String(p || '').replace(/\D/g, '').slice(-10); return d.length === 10 ? `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}` : '' }

function Logo({ light }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '.7em' }}>
      <svg viewBox="0 0 24 24" style={{ width: '2.4em', height: '2.4em', fill: 'none', stroke: AMBER, strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' }}>
        <path d="M3 20h18" /><path d="M5 20V10l7-6 7 6v10" /><path d="M9 15l3-3 3 3" /><path d="M12 12v8" />
      </svg>
      <span style={{ borderLeft: `2px solid ${AMBER}`, paddingLeft: '.7em', fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 800, fontSize: '1.5em', color: light ? '#fff' : NAVY }}>Build Boosters</span>
    </div>
  )
}

// What is true for this client right now. Nothing is listed unless their record says it exists.
function built(c) {
  const all = !/^website/i.test(c.tier || '')
  const items = []
  const pages = [c.services.length ? plural(c.services.length, 'service page') : '', c.areas.length ? plural(c.areas.length, 'town page') : ''].filter(Boolean).join(' and ')
  if (c.site_built) items.push(['Your website', `${pages ? `Built with ${pages}` : 'Built and ready'}${c.site_domain ? `, at ${c.site_domain}` : ''}.`])
  if (all && c.business_number) items.push(['Your business number', `${phone(c.business_number)} rings your phone, and a missed call gets an automatic text back so the customer stays with you.`])
  if (c.google_approved) items.push(['Your Google profile', 'Connected, so job photos and business hours stay current without you touching it.'])
  if (all && c.reviews_connected) items.push(['Your reviews', 'Review requests go out after a finished job, and your Google reviews show on your website.'])
  if (c.photo_count > 0) items.push(['Your photos', `${plural(c.photo_count, 'job photo')} sized, labeled and placed on the site.`])
  return items
}

function next(c) {
  const all = !/^website/i.test(c.tier || '')
  const items = []
  if (all && !c.a2p_approved_at) items.push(['Texting approval', 'The phone carriers are reviewing your registration. The full website and your automatic texts switch on the day it clears.'])
  if (all) items.push(['Your customer list', 'One free text goes to your past customers to bring in repeat work, as soon as texting is approved.'])
  items.push(['Job photos', 'Text me photos from the job and they go on your website. I will ask weekly for the first month and monthly after that.'])
  items.push(['Changes', 'New hours, a new service or a photo swap is one text to me, and it is handled within 3 business days.'])
  return items.slice(0, 4)
}

function Slide({ dark, children, n }) {
  return (
    <section className="deck-slide" style={{ ...body, background: dark ? NAVY : '#fff', color: dark ? '#fff' : TEXT, aspectRatio: '16 / 9', width: '100%', position: 'relative', overflow: 'hidden', padding: '5.5% 6.5%', display: 'flex', flexDirection: 'column', fontSize: 'clamp(7px, 1.25vw, 17px)', border: dark ? 'none' : `1px solid ${LINE}` }}>
      {children}
      {!dark ? <div style={{ position: 'absolute', left: '6.5%', right: '6.5%', bottom: '4%', display: 'flex', justifyContent: 'space-between', color: MUTED, fontSize: '.8em' }}><span>Build Boosters · buildboosters.com</span><span>{n}</span></div> : null}
    </section>
  )
}

function Rows({ items }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: items.length > 2 ? '1fr 1fr' : '1fr', gap: '1.4em 3em', marginTop: '2em' }}>
      {items.map(([head, text]) => (
        <div key={head} style={{ borderLeft: `3px solid ${AMBER}`, paddingLeft: '1.1em' }}>
          <div style={{ fontWeight: 800, color: NAVY, fontSize: '1.35em' }}>{head}</div>
          <div style={{ marginTop: '.3em', fontSize: '1.1em', lineHeight: 1.5 }}>{text}</div>
        </div>
      ))}
    </div>
  )
}

function Deck({ c, goals }) {
  const name = c.business || c.first_name || 'Your business'
  const goalLines = goals.split('\n').map((s) => s.trim()).filter(Boolean)
  const done = built(c), todo = c.launch_checklist || []
  const date = new Date(c.launch_call_start || Date.now()).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  return (
    <>
      <Slide dark>
        <Logo light />
        <div style={{ marginTop: 'auto' }}>
          <div style={label}>Launch day</div>
          <h1 style={{ fontSize: '4.6em', fontWeight: 800, letterSpacing: '-.02em', lineHeight: 1.05, margin: '.15em 0 .35em' }}>{name}</h1>
          <p style={{ opacity: .88, fontSize: '1.3em' }}>{c.first_name ? `${c.first_name}, here` : 'Here'} is what you asked for, what is built, and what happens from here.</p>
        </div>
        <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', opacity: .8, fontSize: '1em' }}>
          <span>By Maddie, founder of Build Boosters · {date}</span>
          {c.logo_url ? <img src={c.logo_url} alt="" style={{ maxHeight: '5em', maxWidth: '14em', background: '#fff', padding: '.5em', borderRadius: '6px' }} /> : null}
        </div>
        <div style={{ position: 'absolute', right: '-9%', bottom: '-22%', width: '34%', aspectRatio: '1', borderRadius: '50%', border: `2px solid ${AMBER}`, opacity: .25 }} />
      </Slide>

      <Slide n={2}>
        <div style={label}>What you told me</div>
        <h2 style={{ fontSize: '2.8em', fontWeight: 800, color: NAVY, letterSpacing: '-.01em' }}>Your goals</h2>
        {goalLines.length ? (
          <ul style={{ marginTop: '1.6em', listStyle: 'none', padding: 0 }}>
            {goalLines.map((g) => (
              <li key={g} style={{ display: 'flex', gap: '.9em', fontSize: '1.5em', lineHeight: 1.45, marginBottom: '.7em' }}>
                <span style={{ flex: 'none', width: '.5em', height: '.5em', borderRadius: '50%', background: AMBER, marginTop: '.5em' }} />{g}
              </li>
            ))}
          </ul>
        ) : <p className="no-print" style={{ marginTop: '2em', color: MUTED, fontSize: '1.3em' }}>Type their goals in the box above the deck, one per line.</p>}
      </Slide>

      <Slide n={3}>
        <div style={label}>Done</div>
        <h2 style={{ fontSize: '2.8em', fontWeight: 800, color: NAVY, letterSpacing: '-.01em' }}>What is built</h2>
        {done.length ? <Rows items={done} /> : <p style={{ marginTop: '2em', color: MUTED, fontSize: '1.3em' }}>Nothing is marked as built on this client's record yet.</p>}
      </Slide>

      {todo.length ? (
        <Slide n={4}>
          <div style={label}>On this call</div>
          <h2 style={{ fontSize: '2.8em', fontWeight: 800, color: NAVY, letterSpacing: '-.01em' }}>What we finish together today</h2>
          <div style={{ background: SOFT, borderRadius: '14px', padding: '1.6em 2em', marginTop: '1.6em', columns: todo.length > 5 ? 2 : 1, columnGap: '3em' }}>
            {todo.map((t) => (
              <div key={t} style={{ display: 'flex', gap: '.8em', fontSize: '1.15em', lineHeight: 1.4, marginBottom: '.7em', breakInside: 'avoid' }}>
                <span style={{ flex: 'none', width: '1em', height: '1em', border: `1.5px solid ${MUTED}`, borderRadius: '50%', marginTop: '.2em' }} />{t}
              </div>
            ))}
          </div>
        </Slide>
      ) : null}

      <Slide n={todo.length ? 5 : 4}>
        <div style={label}>From here</div>
        <h2 style={{ fontSize: '2.8em', fontWeight: 800, color: NAVY, letterSpacing: '-.01em' }}>What happens next</h2>
        <Rows items={next(c)} />
      </Slide>
    </>
  )
}

export default function DeckPage() {
  const [clients, setClients] = useState(null)
  const [error, setError] = useState('')
  const [code, setCode] = useState('')
  const [goals, setGoals] = useState('')
  const [showAll, setShowAll] = useState(false)
  const [saved, setSaved] = useState('')
  const deckRef = useRef(null)

  const load = useCallback(async () => {
    const res = await authFetch('/api/launch')
    const json = await res.json().catch(() => ({}))
    if (!res.ok) { setError('Could not load the client list from the Launch page.'); return }
    setClients(json.clients || [])
  }, [])
  useEffect(() => { load() }, [load])

  const list = (clients || []).filter((c) => showAll || !c.a2p_approved_at)
  const c = (clients || []).find((x) => x.code === code)

  // Goals live on the client's record as sales notes, so they are there on any computer.
  useEffect(() => { if (c) { setGoals(c.goals || ''); setSaved('') } }, [code]) // eslint-disable-line react-hooks/exhaustive-deps
  async function saveGoals() {
    if (!c || goals === (c.goals || '')) return
    setSaved('Saving...')
    const res = await authFetch('/api/launch', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'sales_notes', id: c.id, text: goals }) })
    if (res.ok) { c.goals = goals; setSaved('Saved to their record') } else setSaved('Could not save. Check the connection and click out of the box again.')
  }

  if (error) return <div className="bg-dash-surface border border-dash-border rounded-xl p-5 text-sm text-dash-muted">{error}</div>
  if (!clients) return <p className="text-sm text-dash-dim">Loading...</p>

  return (
    <div>
      <link rel="stylesheet" href={FONTS} />
      <style>{`
        .deck:fullscreen { background: #000; overflow-y: auto; scroll-snap-type: y mandatory; }
        .deck:fullscreen .deck-slide { height: 100vh; width: auto; max-width: 100vw; margin: 0 auto; scroll-snap-align: start; font-size: min(1.25vw, 2.2vh) !important; border: none !important; }
        @media print {
          @page { size: 13.333in 7.5in; margin: 0; }
          header, aside, nav, .no-print { display: none !important; }
          main { padding: 0 !important; } main > div { padding: 0 !important; max-width: none !important; }
          body, html { background: #fff !important; }
          .deck { gap: 0 !important; }
          .deck-slide { width: 13.333in !important; height: 7.5in !important; font-size: 13.5pt !important; border: none !important; break-after: page; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>

      <div className="no-print">
        <h1 className="text-xl font-bold font-heading mb-1">Launch deck</h1>
        <p className="text-sm text-dash-muted mb-5">Pick a client and the deck fills itself in from their record.</p>

        <div className="bg-dash-surface border border-dash-border rounded-xl p-4 mb-5 grid gap-4 lg:grid-cols-2">
          <div>
            <label className="text-xs text-dash-muted block mb-1.5" htmlFor="deck-client">Client</label>
            <select id="deck-client" value={code} onChange={(e) => setCode(e.target.value)}
              className="w-full bg-transparent border border-dash-border rounded-lg px-3 py-2 text-sm">
              <option value="">{list.length ? 'Choose a client' : 'No clients waiting to launch'}</option>
              {list.map((x) => <option key={x.code} value={x.code} style={{ color: '#000' }}>{x.business || x.first_name || x.code.slice(0, 8)}{x.launch_call_start ? `, call ${new Date(x.launch_call_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : ''}</option>)}
            </select>
            <label className="flex items-center gap-2 text-xs text-dash-muted mt-2">
              <input type="checkbox" checked={showAll} onChange={(e) => setShowAll(e.target.checked)} /> Include clients who already launched
            </label>
            {c ? (
              <div className="flex gap-2 mt-4">
                <button onClick={() => deckRef.current?.requestFullscreen?.()} className="text-xs px-3 py-1.5 rounded-lg border border-dash-text text-dash-text">Present</button>
                <button onClick={() => window.print()} className="text-xs px-3 py-1.5 rounded-lg border border-dash-border text-dash-muted hover:text-dash-text">Save as PDF</button>
              </div>
            ) : null}
          </div>
          {c ? (
            <div>
              <label className="text-xs text-dash-muted block mb-1.5" htmlFor="deck-goals">Their goals, one per line</label>
              <textarea id="deck-goals" value={goals} onChange={(e) => setGoals(e.target.value)} onBlur={saveGoals} rows={5}
                placeholder={'Stop losing jobs to missed calls\nGet to 50 Google reviews'}
                className="w-full bg-transparent border border-dash-border rounded-lg px-3 py-2 text-sm" />
              <p className="text-xs text-dash-dim mt-1">{saved || 'Type them on the sales call. They save when you click out of the box.'}</p>
            </div>
          ) : null}
        </div>
      </div>

      {c ? <div ref={deckRef} className="deck grid gap-4" style={{ maxWidth: 1100 }}><Deck c={c} goals={goals} /></div> : null}
    </div>
  )
}
