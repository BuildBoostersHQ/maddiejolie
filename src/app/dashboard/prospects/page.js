'use client'
import { useState } from 'react'
import { STAGES, TRADES, BRAND_LINKS, getStage } from '@/lib/constants'
import { useProspects } from '@/lib/useProspects'

function ProspectRow({ prospect, onSelect, isSelected }) {
  const stage = getStage(prospect.stage)
  const mins = Math.floor(prospect.timeOnPage / 60)
  const hasVisited = prospect.pageViews > 0

  return (
    <div
      onClick={() => onSelect(prospect)}
      className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-smooth border-b border-dash-border/30 ${
        isSelected ? 'bg-white/[0.06]' : 'hover:bg-white/[0.03]'
      }`}
    >
      {/* Score indicator */}
      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
        prospect.score >= 90 ? 'bg-green-500/15 text-green-400 ring-1 ring-green-500/30' :
        prospect.score >= 70 ? 'bg-orange-500/15 text-orange-400 ring-1 ring-orange-500/30' :
        'bg-dash-surface text-dash-dim ring-1 ring-dash-border'
      }`}>
        {prospect.score}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium truncate">{prospect.name}</p>
          {hasVisited && (
            <span className="text-[10px] text-pink-400 bg-pink-400/10 px-1.5 py-0.5 rounded-full">
              {prospect.pageViews}× viewed
            </span>
          )}
        </div>
        <p className="text-xs text-dash-dim truncate">
          {prospect.owner} · {prospect.trade} · {prospect.city}, {prospect.state}
        </p>
      </div>

      {/* Stage badge */}
      <span className={`${stage.class} text-[11px] font-semibold px-2.5 py-1 rounded-full text-white whitespace-nowrap hidden sm:inline-flex`}>
        {stage.label}
      </span>

      {/* Call button */}
      <a
        href={`tel:${prospect.phone.replace(/\D/g, '')}`}
        onClick={(e) => e.stopPropagation()}
        className="w-9 h-9 rounded-full bg-green-500/10 hover:bg-green-500/20 text-green-400 flex items-center justify-center transition-smooth flex-shrink-0"
        title={`Call ${prospect.phone}`}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
        </svg>
      </a>
    </div>
  )
}

function ProspectDetail({ prospect, onClose }) {
  const [newMessage, setNewMessage] = useState('')
  const stage = getStage(prospect.stage)
  const mins = Math.floor(prospect.timeOnPage / 60)
  const secs = prospect.timeOnPage % 60

  return (
    <div className="bg-dash-surface border border-dash-border rounded-xl overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-dash-border flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold">{prospect.name}</h3>
          <p className="text-xs text-dash-dim">{prospect.owner}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`${stage.class} text-[11px] font-semibold px-2.5 py-1 rounded-full text-white`}>
            {stage.label}
          </span>
          <button onClick={onClose} className="lg:hidden text-dash-muted hover:text-dash-text p-1">✕</button>
        </div>
      </div>

      {/* Quick info */}
      <div className="px-4 py-3 border-b border-dash-border/50 grid grid-cols-3 gap-3">
        <div>
          <p className="text-[10px] text-dash-dim uppercase tracking-wider">Phone</p>
          <a href={`tel:${prospect.phone.replace(/\D/g, '')}`} className="text-sm text-violet-400 hover:text-violet-300 font-medium">
            {prospect.phone}
          </a>
        </div>
        <div>
          <p className="text-[10px] text-dash-dim uppercase tracking-wider">Trade</p>
          <p className="text-sm">{prospect.trade}</p>
        </div>
        <div>
          <p className="text-[10px] text-dash-dim uppercase tracking-wider">Brand</p>
          <p className="text-sm">{prospect.brand === 'bb' ? '🟠 Build Boosters' : '🟣 Maddie Jolie'}</p>
        </div>
        <div>
          <p className="text-[10px] text-dash-dim uppercase tracking-wider">Rating</p>
          <p className="text-sm">⭐ {prospect.rating} ({prospect.reviews} reviews)</p>
        </div>
        <div>
          <p className="text-[10px] text-dash-dim uppercase tracking-wider">Page Views</p>
          <p className="text-sm">
            {prospect.pageViews > 0
              ? `${prospect.pageViews}× · ${mins}m ${secs}s`
              : 'No visits yet'
            }
          </p>
        </div>
        {prospect.from_number && (
          <div>
            <p className="text-[10px] text-dash-dim uppercase tracking-wider">From #</p>
            <p className="text-sm text-dash-muted">{prospect.from_number}</p>
          </div>
        )}
      </div>

      {/* Demo link */}
      <div className="px-4 py-2 border-b border-dash-border/50">
        <a
          href={prospect.demoUrl}
          target="_blank"
          rel="noopener"
          className="text-xs text-pink-400 hover:text-pink-300 transition-smooth"
        >
          View demo page →
        </a>
      </div>

      {/* Quick send — links configured in /src/lib/constants.js BRAND_LINKS */}
      <div className="px-4 py-2.5 border-b border-dash-border/50 flex gap-2">
        {[
          { label: '📅 Calendar', key: 'calendar', msg: "Here's a link to book a quick call", color: 'sky' },
          { label: '💰 Pricing', key: 'pricing', msg: "Here's our pricing info", color: 'green' },
          { label: '🎬 VSL', key: 'vsl', msg: 'Check out this quick video about how we help contractors like you', color: 'pink' },
        ].map(btn => {
          const brand = prospect.brand || 'mj'
          const url = BRAND_LINKS[brand]?.[btn.key]
          return (
            <button
              key={btn.key}
              onClick={() => {
                if (!url) {
                  alert(`No ${btn.key} link set yet — add it in src/lib/constants.js under BRAND_LINKS`)
                  return
                }
                setNewMessage(`Hey ${prospect.owner?.split(' ')[0] || 'there'}! ${btn.msg}: ${url}`)
              }}
              className={`flex-1 py-2 rounded-lg text-[11px] font-medium transition-smooth bg-${btn.color}-500/10 hover:bg-${btn.color}-500/15 text-${btn.color}-400 border border-${btn.color}-500/10 ${!url ? 'opacity-40' : ''}`}
            >
              {btn.label}
            </button>
          )
        })}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5">
        {prospect.messages.length === 0 ? (
          <p className="text-xs text-dash-dim text-center py-8">No messages yet</p>
        ) : (
          prospect.messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.type === 'out' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                msg.type === 'out'
                  ? 'bg-violet-500/15 text-violet-100 rounded-br-md'
                  : 'bg-white/[0.08] text-dash-text rounded-bl-md'
              }`}>
                <p>{msg.text}</p>
                <p className="text-[10px] text-dash-dim mt-1">
                  {new Date(msg.time).toLocaleString('en-US', {
                    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Send message */}
      <div className="px-3 py-3 border-t border-dash-border">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-dash-bg border border-dash-border rounded-xl px-3 py-2 text-sm text-dash-text placeholder-dash-dim focus:outline-none focus:border-violet-500/50 transition-smooth"
          />
          <button className="bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-400 hover:to-pink-400 text-white text-sm font-medium px-4 py-2 rounded-xl transition-smooth">
            Send
          </button>
        </div>
        <p className="text-[10px] text-dash-dim mt-1.5 px-1">Sends via Kixie API · Not yet connected</p>
      </div>
    </div>
  )
}

export default function ProspectsPage() {
  const { prospects, loading } = useProspects()
  const [selected, setSelected] = useState(null)
  const [stageFilter, setStageFilter] = useState('all')
  const [tradeFilter, setTradeFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('score')

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-sm text-dash-dim">Loading...</p>
    </div>
  )

  let filtered = [...prospects]

  if (stageFilter !== 'all') filtered = filtered.filter(p => p.stage === stageFilter)
  if (tradeFilter !== 'all') filtered = filtered.filter(p => p.trade === tradeFilter)
  if (search) {
    const q = search.toLowerCase()
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.owner.toLowerCase().includes(q) ||
      p.city.toLowerCase().includes(q)
    )
  }

  filtered.sort((a, b) => {
    if (sortBy === 'score') return b.score - a.score
    if (sortBy === 'views') return b.pageViews - a.pageViews
    if (sortBy === 'time') return b.timeOnPage - a.timeOnPage
    if (sortBy === 'rating') return b.rating - a.rating
    return 0
  })

  return (
    <div className="pb-20 lg:pb-6">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-xl lg:text-2xl font-bold">Prospects</h1>
        <p className="text-sm text-dash-muted mt-1">{filtered.length} prospects · {prospects.filter(p => p.pageViews > 0).length} have visited their demo</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, owner, city..."
          className="bg-dash-surface border border-dash-border rounded-lg px-3 py-2 text-sm text-dash-text placeholder-dash-dim focus:outline-none focus:border-violet-500/50 transition-smooth w-full sm:w-auto sm:flex-1 sm:max-w-xs"
        />
        <select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value)}
          className="bg-dash-surface border border-dash-border rounded-lg px-3 py-2 text-sm text-dash-text focus:outline-none focus:border-violet-500/50 transition-smooth appearance-none"
        >
          <option value="all">All stages</option>
          {STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
        <select
          value={tradeFilter}
          onChange={(e) => setTradeFilter(e.target.value)}
          className="bg-dash-surface border border-dash-border rounded-lg px-3 py-2 text-sm text-dash-text focus:outline-none focus:border-violet-500/50 transition-smooth appearance-none"
        >
          <option value="all">All trades</option>
          {TRADES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="bg-dash-surface border border-dash-border rounded-lg px-3 py-2 text-sm text-dash-text focus:outline-none focus:border-violet-500/50 transition-smooth appearance-none"
        >
          <option value="score">Sort: Score</option>
          <option value="views">Sort: Page Views</option>
          <option value="time">Sort: Time on Page</option>
          <option value="rating">Sort: Rating</option>
        </select>
      </div>

      {/* List + Detail split */}
      <div className="flex gap-4">
        {/* Prospect list */}
        <div className={`${selected ? 'hidden lg:block lg:w-2/5' : 'w-full'} bg-dash-surface border border-dash-border rounded-xl overflow-hidden`}>
          {filtered.map(p => (
            <ProspectRow
              key={p.id}
              prospect={p}
              onSelect={setSelected}
              isSelected={selected?.id === p.id}
            />
          ))}
          {filtered.length === 0 && (
            <p className="py-12 text-center text-sm text-dash-dim">No prospects match your filters</p>
          )}
        </div>

        {/* Detail panel */}
        {selected && (
          <div className={`${selected ? 'w-full lg:w-3/5' : 'hidden'}`}>
            <ProspectDetail
              prospect={selected}
              onClose={() => setSelected(null)}
            />
          </div>
        )}
      </div>
    </div>
  )
}
