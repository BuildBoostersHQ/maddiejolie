'use client'
import { useState } from 'react'
import { STAGES, getStage } from '@/lib/constants'
import { useProspects } from '@/lib/useProspects'

function ConversationItem({ prospect, isSelected, onClick }) {
  const lastMessage = prospect.messages[prospect.messages.length - 1]
  const hasInbound = prospect.messages.some(m => m.type === 'in')
  const stage = getStage(prospect.stage)

  if (prospect.messages.length === 0) return null

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-smooth border-b border-dash-border/30 ${
        isSelected ? 'bg-white/[0.06]' : 'hover:bg-white/[0.03]'
      }`}
    >
      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
        hasInbound
          ? 'bg-gradient-to-br from-violet-500/20 to-pink-500/20 text-violet-300 ring-1 ring-violet-500/30'
          : 'bg-dash-surface text-dash-dim ring-1 ring-dash-border'
      }`}>
        {prospect.owner.charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium truncate">{prospect.owner}</p>
          <span className="text-[10px] text-dash-dim flex-shrink-0 ml-2">
            {lastMessage && new Date(lastMessage.time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-xs text-dash-muted truncate flex-1">
            {lastMessage?.type === 'out' ? 'You: ' : ''}{lastMessage?.text}
          </p>
          {hasInbound && (
            <span className="w-2 h-2 rounded-full bg-violet-400 flex-shrink-0" />
          )}
        </div>
      </div>
    </div>
  )
}

function MessageThread({ prospect }) {
  const [newMessage, setNewMessage] = useState('')
  const stage = getStage(prospect.stage)

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Thread header */}
      <div className="px-4 py-3 border-b border-dash-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500/20 to-pink-500/20 border border-dash-border flex items-center justify-center text-xs font-bold text-violet-300">
            {prospect.owner.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-bold">{prospect.owner}</p>
            <p className="text-xs text-dash-dim">{prospect.name} · {prospect.trade}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`${stage.class} text-[10px] font-semibold px-2 py-0.5 rounded-full text-white`}>
            {stage.label}
          </span>
          <a
            href={`tel:${prospect.phone.replace(/\D/g, '')}`}
            className="w-8 h-8 rounded-full bg-green-500/10 hover:bg-green-500/20 text-green-400 flex items-center justify-center transition-smooth"
            title={`Call ${prospect.phone}`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
            </svg>
          </a>
          <a
            href={prospect.demoUrl}
            target="_blank"
            rel="noopener"
            className="text-xs text-pink-400 hover:text-pink-300 transition-smooth"
          >
            Demo →
          </a>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {prospect.messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.type === 'out' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 ${
              msg.type === 'out'
                ? 'bg-gradient-to-br from-violet-500/20 to-violet-500/10 text-violet-100 rounded-br-md border border-violet-500/10'
                : 'bg-white/[0.08] text-dash-text rounded-bl-md border border-dash-border/50'
            }`}>
              <p className="text-sm leading-relaxed">{msg.text}</p>
              <p className="text-[10px] text-dash-dim mt-1.5">
                {new Date(msg.time).toLocaleString('en-US', {
                  month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Compose */}
      <div className="px-4 py-3 border-t border-dash-border">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-dash-bg border border-dash-border rounded-xl px-4 py-2.5 text-sm text-dash-text placeholder-dash-dim focus:outline-none focus:border-violet-500/50 transition-smooth"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newMessage.trim()) {
                // Will send via Kixie API when connected
                setNewMessage('')
              }
            }}
          />
          <button className="bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-400 hover:to-pink-400 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-smooth">
            Send
          </button>
        </div>
        <p className="text-[10px] text-dash-dim mt-1.5 px-1">Sends via Kixie API · Not yet connected</p>
      </div>
    </div>
  )
}

export default function MessagesPage() {
  const { prospects, loading } = useProspects()
  const [selected, setSelected] = useState(null)

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-sm text-dash-dim">Loading...</p>
    </div>
  )

  const withMessages = prospects
    .filter(p => p.messages.length > 0)
    .sort((a, b) => {
      const aHasIn = a.messages.some(m => m.type === 'in') ? 1 : 0
      const bHasIn = b.messages.some(m => m.type === 'in') ? 1 : 0
      if (aHasIn !== bHasIn) return bHasIn - aHasIn
      const aLast = new Date(a.messages[a.messages.length - 1].time)
      const bLast = new Date(b.messages[b.messages.length - 1].time)
      return bLast - aLast
    })

  return (
    <div className="pb-20 lg:pb-0">
      <div className="mb-4 lg:hidden">
        <h1 className="text-xl font-bold">Messages</h1>
        <p className="text-sm text-dash-muted mt-1">{withMessages.length} conversations</p>
      </div>

      <div className="flex gap-0 lg:gap-0 bg-dash-surface border border-dash-border rounded-xl overflow-hidden" style={{ height: 'calc(100vh - 8rem)' }}>
        {/* Conversation list */}
        <div className={`${selected ? 'hidden lg:block' : 'w-full'} lg:w-80 border-r border-dash-border overflow-y-auto flex-shrink-0`}>
          <div className="hidden lg:block px-4 py-3 border-b border-dash-border">
            <h2 className="text-sm font-semibold">Messages</h2>
            <p className="text-xs text-dash-dim">{withMessages.length} conversations</p>
          </div>
          {withMessages.map(p => (
            <ConversationItem
              key={p.id}
              prospect={p}
              isSelected={selected?.id === p.id}
              onClick={() => setSelected(p)}
            />
          ))}
        </div>

        {/* Thread view */}
        <div className={`${selected ? 'w-full' : 'hidden lg:flex'} flex-1`}>
          {selected ? (
            <div className="w-full">
              <button
                onClick={() => setSelected(null)}
                className="lg:hidden px-4 py-2 text-xs text-violet-400 hover:text-violet-300"
              >
                ← Back to conversations
              </button>
              <MessageThread prospect={selected} />
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-sm text-dash-dim">Select a conversation</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
