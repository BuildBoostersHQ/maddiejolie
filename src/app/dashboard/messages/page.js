'use client'
import { useState } from 'react'
import { authFetch } from '@/lib/authFetch'
import { STAGES, getStage, SEQUENCE_STEPS, getSequenceStep, BRANDS } from '@/lib/constants'
import BrandPill from '@/components/BrandPill'
import { useProspects } from '@/lib/useProspects'

// 60+ seconds on page = "engaged" / looked for a while
const ENGAGED_THRESHOLD = 60

function getAvatarStyle(prospect) {
  const hasInbound = prospect.messages?.some(m => m.type === 'in')
  const isEngaged = prospect.timeOnPage >= ENGAGED_THRESHOLD

  if (hasInbound && isEngaged) {
    // Responded + engaged — warm gradient (yellow → pink → white)
    return {
      background: 'linear-gradient(135deg, #fde68a, #f9a8d4, #fce7f3, #ffffff)',
      border: '1px solid rgba(253,230,138,0.3)',
      color: '#92400e',
    }
  }
  if (hasInbound) {
    // Responded but didn't spend long — slightly cooler gradient
    return {
      background: 'linear-gradient(135deg, #fbcfe8, #f9a8d4, #e9d5ff, #f3e8ff)',
      border: '1px solid rgba(249,168,212,0.3)',
      color: '#831843',
    }
  }
  if (isEngaged) {
    // Looked for a while but hasn't responded — subtle warm tint
    return {
      background: 'linear-gradient(135deg, rgba(253,230,138,0.15), rgba(249,168,212,0.1))',
      border: '1px solid rgba(253,230,138,0.1)',
      color: 'rgba(253,230,138,0.7)',
    }
  }
  // No response, didn't engage — very muted
  return {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.04)',
    color: 'rgba(255,255,255,0.15)',
  }
}

function ConversationItem({ prospect, isSelected, onClick }) {
  const lastMessage = prospect.messages[prospect.messages.length - 1]
  const hasInbound = prospect.messages.some(m => m.type === 'in')
  const stage = getStage(prospect.stage)
  const avatarStyle = getAvatarStyle(prospect)

  if (prospect.messages.length === 0) return null

  // Build gradient glow colors based on engagement
  const glowColors = hasInbound && isEngaged
    ? 'rgba(253,230,138,0.12), rgba(249,168,212,0.08), transparent'
    : hasInbound
    ? 'rgba(249,168,212,0.1), rgba(167,139,250,0.06), transparent'
    : isEngaged
    ? 'rgba(253,230,138,0.06), transparent, transparent'
    : 'transparent, transparent, transparent'

  return (
    <div
      onClick={onClick}
      className="cursor-pointer transition-smooth"
      style={{
        padding: '10px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.03)',
        opacity: hasInbound ? 1 : 0.5,
        position: 'relative',
        overflow: 'hidden',
        background: isSelected ? 'rgba(255,255,255,0.04)' : 'transparent',
      }}
      onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.02)' }}
      onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = 'transparent' }}
    >
      {/* Glassmorphism glow behind avatar + fading into name */}
      {(hasInbound || isEngaged) && (
        <div style={{
          position: 'absolute',
          left: '8px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '180px',
          height: '44px',
          borderRadius: '24px',
          background: `linear-gradient(90deg, ${glowColors})`,
          backdropFilter: 'blur(12px)',
          pointerEvents: 'none',
          zIndex: 0,
        }} />
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'relative', zIndex: 1 }}>
        <div
          className="flex-shrink-0"
          style={{ ...avatarStyle, width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600 }}
        >
          {prospect.owner.charAt(0)}{prospect.owner.split(' ')[1]?.charAt(0) || ''}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <p className="truncate" style={{ fontSize: '13px', fontWeight: 500, color: hasInbound ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.3)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="truncate">{prospect.owner}</span>
              <BrandPill brand={prospect.brand} />
              {prospect.fromNumber && <span style={{ fontSize: '9px', fontWeight: 400, color: 'rgba(255,255,255,0.2)' }}>{prospect.fromNumber}</span>}
            </p>
            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.15)', flexShrink: 0, marginLeft: '8px' }}>
              {lastMessage && new Date(lastMessage.time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <p className="truncate" style={{ fontSize: '11px', color: hasInbound ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.12)', flex: 1, margin: 0 }}>
              {lastMessage?.type === 'out' ? 'You: ' : ''}{lastMessage?.text}
            </p>
            {hasInbound && (
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'linear-gradient(135deg, #fde68a, #f9a8d4)', flexShrink: 0 }} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function ProspectInfoPanel({ prospect }) {
  const stage = getStage(prospect.stage)
  const mins = Math.floor(prospect.timeOnPage / 60)
  const secs = prospect.timeOnPage % 60

  return (
    <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '11px' }}>
        <div>
          <p style={{ color: 'rgba(255,255,255,0.15)', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '3px' }}>Phone</p>
          <a href={`tel:${prospect.phone.replace(/\D/g, '')}`} style={{ color: 'rgba(139,92,246,0.6)', textDecoration: 'none' }}>
            {prospect.phone}
          </a>
        </div>
        <div>
          <p style={{ color: 'rgba(255,255,255,0.15)', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '3px' }}>Trade</p>
          <p style={{ color: 'rgba(255,255,255,0.5)', margin: 0 }}>{prospect.trade}</p>
        </div>
        <div>
          <p style={{ color: 'rgba(255,255,255,0.15)', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '3px' }}>Rating</p>
          <p style={{ color: 'rgba(255,255,255,0.5)', margin: 0 }}>{prospect.rating} ({prospect.reviews} reviews)</p>
        </div>
        <div>
          <p style={{ color: 'rgba(255,255,255,0.15)', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '3px' }}>Score</p>
          <p style={{ color: prospect.score >= 80 ? 'rgba(74,222,128,0.6)' : prospect.score >= 60 ? 'rgba(251,191,36,0.6)' : 'rgba(255,255,255,0.4)', margin: 0, fontWeight: 600 }}>{prospect.score}</p>
        </div>
        <div>
          <p style={{ color: 'rgba(255,255,255,0.15)', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '3px' }}>Page views</p>
          <p style={{ color: 'rgba(255,255,255,0.5)', margin: 0 }}>
            {prospect.pageViews > 0 ? `${prospect.pageViews}x · ${mins}m ${secs}s` : 'No visits'}
          </p>
        </div>
        <div>
          <p style={{ color: 'rgba(255,255,255,0.15)', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '3px' }}>City</p>
          <p style={{ color: 'rgba(255,255,255,0.5)', margin: 0 }}>{prospect.city}, {prospect.state}</p>
        </div>
      </div>
      <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
        <a href={prospect.demoUrl} target="_blank" rel="noopener" style={{ fontSize: '10px', color: 'rgba(232,121,153,0.5)', textDecoration: 'none' }}>
          View demo page
        </a>
        {prospect.googlePlaceUrl && (
          <a href={prospect.googlePlaceUrl} target="_blank" rel="noopener" style={{ fontSize: '10px', color: 'rgba(139,92,246,0.5)', textDecoration: 'none' }}>
            Google listing
          </a>
        )}
      </div>
    </div>
  )
}

function MessageThread({ prospect }) {
  const [newMessage, setNewMessage] = useState('')
  const [localMessages, setLocalMessages] = useState([])
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState('')
  const stage = getStage(prospect.stage)
  const avatarStyle = getAvatarStyle(prospect)
  const allMessages = [...prospect.messages, ...localMessages]

  async function handleSend() {
    const body = newMessage.trim()
    if (!body || sending) return
    setSending(true)
    setSendError('')
    const optimistic = { type: 'out', text: body, time: new Date().toISOString(), step: 'reply', brand: prospect.brand, fromNumber: prospect.fromNumber }
    setLocalMessages(prev => [...prev, optimistic])
    setNewMessage('')
    try {
      const res = await authFetch('/api/kixie/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prospect_id: prospect.id, body, sequence_step: 'reply' }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || `Send failed (${res.status})`)
      }
    } catch (err) {
      setLocalMessages(prev => prev.filter(m => m !== optimistic))
      setNewMessage(body)
      setSendError(err.message)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Thread header */}
      <div style={{ padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{ ...avatarStyle, width: '34px', height: '34px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 600 }}
          >
            {prospect.owner.charAt(0)}{prospect.owner.split(' ')[1]?.charAt(0) || ''}
          </div>
          <div>
            <p style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.8)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              {prospect.owner}
              <BrandPill brand={prospect.brand} />
              {prospect.fromNumber && <span style={{ fontSize: '10px', fontWeight: 400, color: 'rgba(255,255,255,0.25)' }}>from {prospect.fromNumber}</span>}
            </p>
            <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)', margin: '1px 0 0' }}>{prospect.name} · {prospect.trade}</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className={stage.class} style={{ fontSize: '9px', fontWeight: 500, padding: '3px 10px', borderRadius: '20px' }}>
            {stage.label}
          </span>
          <a
            href={`tel:${prospect.phone.replace(/\D/g, '')}`}
            style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(74,222,128,0.5)', textDecoration: 'none' }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
            </svg>
          </a>
        </div>
      </div>

      {/* Prospect info */}
      <ProspectInfoPanel prospect={prospect} />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {allMessages.map((msg, i) => (
          <div key={i} className={`flex ${msg.type === 'out' ? 'justify-end' : 'justify-start'}`}>
            <div style={{
              maxWidth: '80%',
              borderRadius: '16px',
              padding: '8px 14px',
              ...(msg.type === 'out'
                ? { background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.06)', color: 'rgba(255,255,255,0.65)', borderBottomRightRadius: '4px' }
                : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.75)', borderBottomLeftRadius: '4px' }
              ),
            }}>
              <p style={{ fontSize: '13px', lineHeight: 1.5, margin: 0 }}>{msg.text}</p>
              <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.15)', marginTop: '4px' }}>
                {new Date(msg.time).toLocaleString('en-US', {
                  month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
                })}
              </p>
              {msg.step && (() => {
                const st = getSequenceStep(msg.step)
                return (
                  <span style={{ display: 'inline-block', marginTop: '4px', fontSize: '8px', padding: '1px 7px', borderRadius: '20px', background: st.color, color: 'rgba(255,255,255,0.85)' }}>
                    {st.label}
                  </span>
                )
              })()}
            </div>
          </div>
        ))}
      </div>

      {/* Compose */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            style={{ flex: 1, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '10px 14px', fontSize: '13px', color: 'rgba(255,255,255,0.8)', outline: 'none' }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend()
            }}
          />
          <button onClick={handleSend} disabled={sending || !newMessage.trim()} style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.3), rgba(236,72,153,0.2))', border: '1px solid rgba(139,92,246,0.15)', color: 'rgba(255,255,255,0.7)', fontSize: '12px', fontWeight: 500, padding: '10px 20px', borderRadius: '12px', cursor: 'pointer', opacity: sending || !newMessage.trim() ? 0.5 : 1 }}>
            {sending ? 'Sending...' : 'Send'}
          </button>
        </div>
        {sendError && <p style={{ fontSize: '10px', color: 'rgba(248,113,113,0.8)', marginTop: '6px', paddingLeft: '4px' }}>{sendError}</p>}
        <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.1)', marginTop: '6px', paddingLeft: '4px' }}>Sends via Kixie API{prospect.fromNumber ? ` · from ${prospect.fromNumber}` : ''}</p>
      </div>
    </div>
  )
}

function ClickedList({ prospects }) {
  const clicked = prospects
    .filter(p => p.pageViews > 0)
    .sort((a, b) => b.timeOnPage - a.timeOnPage)

  if (clicked.length === 0) return null

  return (
    <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', padding: '12px 0' }}>
      <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '1px', padding: '0 16px', marginBottom: '8px' }}>
        Clicked demo · by time on page
      </p>
      {clicked.map(p => {
        const mins = Math.floor(p.timeOnPage / 60)
        const secs = p.timeOnPage % 60
        const isWarm = p.timeOnPage >= ENGAGED_THRESHOLD

        return (
          <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 16px' }}>
            <div style={{
              width: '6px', height: '6px', borderRadius: '50%', flexShrink: 0,
              background: isWarm
                ? 'linear-gradient(135deg, #fde68a, #f9a8d4)'
                : 'rgba(255,255,255,0.1)',
            }} />
            <span style={{ fontSize: '11px', color: isWarm ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.2)', flex: 1 }}>
              {p.name}
            </span>
            <span style={{ fontSize: '10px', color: isWarm ? 'rgba(253,230,138,0.5)' : 'rgba(255,255,255,0.12)', fontFamily: 'Figtree' }}>
              {mins}m {secs}s
            </span>
          </div>
        )
      })}
    </div>
  )
}

function chipStyle(active, color) {
  return {
    fontSize: '9px',
    padding: '3px 9px',
    borderRadius: '20px',
    cursor: 'pointer',
    border: active ? '1px solid rgba(255,255,255,0.25)' : '1px solid transparent',
    background: active ? (color || 'rgba(139,92,246,0.2)') : 'rgba(255,255,255,0.03)',
    color: active ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)',
  }
}

export default function MessagesPage() {
  const { prospects, loading } = useProspects()
  const [selected, setSelected] = useState(null)
  const [hideNonResponders, setHideNonResponders] = useState(false)
  const [brandFilter, setBrandFilter] = useState('all')
  const [stepFilter, setStepFilter] = useState('all')

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-sm" style={{ color: 'rgba(255,255,255,0.15)' }}>Loading...</p>
    </div>
  )

  let withMessages = prospects
    .filter(p => p.messages.length > 0)
    .sort((a, b) => {
      const aHasIn = a.messages.some(m => m.type === 'in') ? 1 : 0
      const bHasIn = b.messages.some(m => m.type === 'in') ? 1 : 0
      if (aHasIn !== bHasIn) return bHasIn - aHasIn
      const aLast = new Date(a.messages[a.messages.length - 1].time)
      const bLast = new Date(b.messages[b.messages.length - 1].time)
      return bLast - aLast
    })

  if (hideNonResponders) {
    withMessages = withMessages.filter(p => p.messages.some(m => m.type === 'in'))
  }

  if (brandFilter !== 'all') {
    withMessages = withMessages.filter(p => p.brand === brandFilter)
  }
  if (stepFilter !== 'all') {
    withMessages = withMessages.filter(p => p.messages.some(m => m.step === stepFilter))
  }

  const responderCount = prospects.filter(p => p.messages.some(m => m.type === 'in')).length

  return (
    <div className="pb-20 lg:pb-0">
      <div className="mb-4 lg:hidden">
        <h1 className="text-xl font-bold font-heading">Messages</h1>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.25)' }}>{withMessages.length} conversations</p>
      </div>

      <div className="flex gap-0 rounded-xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '14px', height: 'calc(100vh - 8rem)' }}>
        {/* Conversation list */}
        <div className={`${selected ? 'hidden lg:block' : 'w-full'} lg:w-80 overflow-y-auto flex-shrink-0`} style={{ borderRight: '1px solid rgba(255,255,255,0.03)' }}>
          <div className="hidden lg:block" style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '13px', fontWeight: 600, fontFamily: 'Figtree', color: 'rgba(255,255,255,0.6)', margin: 0 }}>Messages</h2>
                <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.15)', margin: '2px 0 0' }}>{responderCount} responded · {withMessages.length} total</p>
              </div>
              <button
                onClick={() => setHideNonResponders(!hideNonResponders)}
                style={{
                  fontSize: '9px',
                  padding: '3px 10px',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  border: 'none',
                  background: hideNonResponders ? 'rgba(139,92,246,0.1)' : 'rgba(255,255,255,0.03)',
                  color: hideNonResponders ? 'rgba(139,92,246,0.6)' : 'rgba(255,255,255,0.2)',
                }}
              >
                {hideNonResponders ? 'Show all' : 'Responded only'}
              </button>
            </div>
          </div>
          {/* Filter chips */}
          <div style={{ padding: '8px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '6px' }}>
              {[{ id: 'all', label: 'All brands' }, ...BRANDS].map(b => (
                <button key={b.id} onClick={() => setBrandFilter(b.id)} style={chipStyle(brandFilter === b.id)}>{b.label}</button>
              ))}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              <button onClick={() => setStepFilter('all')} style={chipStyle(stepFilter === 'all')}>All steps</button>
              {SEQUENCE_STEPS.map(s => (
                <button key={s.id} onClick={() => setStepFilter(s.id)} style={chipStyle(stepFilter === s.id, s.color)}>{s.label}</button>
              ))}
            </div>
          </div>
          {withMessages.map(p => (
            <ConversationItem
              key={p.id}
              prospect={p}
              isSelected={selected?.id === p.id}
              onClick={() => setSelected(p)}
            />
          ))}

          {/* Clicked demo list */}
          <ClickedList prospects={prospects} />
        </div>

        {/* Thread view */}
        <div className={`${selected ? 'w-full' : 'hidden lg:flex'} flex-1`}>
          {selected ? (
            <div className="w-full">
              <button
                onClick={() => setSelected(null)}
                className="lg:hidden"
                style={{ padding: '8px 16px', fontSize: '11px', color: 'rgba(139,92,246,0.5)', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Back
              </button>
              <MessageThread prospect={selected} />
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.1)' }}>Select a conversation</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
