'use client'
import { useState, useEffect, useCallback } from 'react'
import { authFetch } from '@/lib/authFetch'

const STAGE_LABELS = {
  paid: 'Paid',
  form_sent: 'Form sent',
  form_done: 'Form done',
  building: 'Building',
  site_live: 'Site live',
  a2p_pending: 'A2P pending',
  a2p_approved: 'A2P approved',
  launched: 'Launched',
  unknown: 'Unknown',
}

const STAGE_COLORS = {
  paid: 'rgba(217,164,65,0.25)',
  form_sent: 'rgba(217,164,65,0.25)',
  form_done: 'rgba(106,171,122,0.25)',
  building: 'rgba(139,92,246,0.25)',
  site_live: 'rgba(106,171,122,0.25)',
  a2p_pending: 'rgba(217,164,65,0.25)',
  a2p_approved: 'rgba(106,171,122,0.25)',
  launched: 'rgba(106,171,122,0.4)',
  unknown: 'rgba(255,255,255,0.08)',
}

const PRIORITY_COLORS = {
  high: '#e5687a',
  medium: '#d9a441',
  low: 'rgba(255,255,255,0.25)',
}

const DONE_KEY = 'bb_tasks_done'

function getDone() {
  try { return JSON.parse(localStorage.getItem(DONE_KEY) || '{}') } catch { return {} }
}

function setDone(id) {
  const d = getDone()
  d[id] = new Date().toISOString()
  try { localStorage.setItem(DONE_KEY, JSON.stringify(d)) } catch {}
}

function unsetDone(id) {
  const d = getDone()
  delete d[id]
  try { localStorage.setItem(DONE_KEY, JSON.stringify(d)) } catch {}
}

function TaskRow({ task, done, onToggle }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div
      className="group"
      style={{
        padding: '10px 14px',
        borderRadius: 8,
        background: done ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.04)',
        opacity: done ? 0.45 : 1,
        marginBottom: 6,
        transition: 'opacity 0.2s',
      }}
    >
      <div className="flex items-center gap-3">
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: done ? 'rgba(255,255,255,0.15)' : PRIORITY_COLORS[task.priority],
            flexShrink: 0,
          }}
        />
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex-1 text-left text-sm font-medium"
          style={{ color: done ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.85)', textDecoration: done ? 'line-through' : 'none' }}
        >
          {task.title}
        </button>
        <button
          onClick={onToggle}
          className="text-xs px-2.5 py-1 rounded-md transition-all"
          style={{
            background: done ? 'rgba(106,171,122,0.15)' : 'rgba(255,255,255,0.06)',
            color: done ? '#6aab7a' : 'rgba(255,255,255,0.5)',
            border: `1px solid ${done ? 'rgba(106,171,122,0.2)' : 'rgba(255,255,255,0.08)'}`,
          }}
        >
          {done ? 'Undo' : 'Done'}
        </button>
      </div>
      {expanded && !done && (
        <div
          className="mt-2 ml-5 text-xs leading-relaxed"
          style={{ color: 'rgba(255,255,255,0.55)' }}
        >
          {task.instructions}
        </div>
      )}
    </div>
  )
}

function ClientCard({ client, doneMap, onToggle, showCompleted }) {
  const visibleTasks = showCompleted
    ? client.tasks
    : client.tasks.filter(t => !doneMap[t.id])

  if (visibleTasks.length === 0 && !showCompleted) return null

  const openCount = client.tasks.filter(t => !doneMap[t.id]).length
  const allDone = openCount === 0

  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 12,
        padding: '16px 18px',
        backdropFilter: 'blur(12px)',
        opacity: allDone ? 0.6 : 1,
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.9)' }}>
            {client.business_name}
          </span>
          <span
            className="text-xs px-2 py-0.5 rounded-full"
            style={{
              background: STAGE_COLORS[client.stage] || STAGE_COLORS.unknown,
              color: 'rgba(255,255,255,0.75)',
            }}
          >
            {STAGE_LABELS[client.stage] || client.stage}
          </span>
          {client.tier && client.tier !== 'unknown' && (
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
              {client.tier.replace(/_/g, ' ')}
            </span>
          )}
        </div>
        <span className="text-xs" style={{ color: openCount > 0 ? '#d9a441' : '#6aab7a' }}>
          {openCount > 0 ? `${openCount} remaining` : 'All done'}
        </span>
      </div>

      <div>
        {visibleTasks.map(task => (
          <TaskRow
            key={task.id}
            task={task}
            done={!!doneMap[task.id]}
            onToggle={() => onToggle(task.id)}
          />
        ))}
      </div>
    </div>
  )
}

export default function TasksPage() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [doneMap, setDoneMap] = useState({})
  const [showCompleted, setShowCompleted] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setDoneMap(getDone())
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await authFetch('/api/tasks')
      const json = await res.json().catch(() => ({}))
      if (json.error) {
        setError(json.error)
      } else {
        setData(json)
        setError('')
      }
    } catch {
      setError('Could not load tasks')
    }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  function toggleTask(id) {
    const d = getDone()
    if (d[id]) {
      unsetDone(id)
      setDoneMap(prev => { const n = { ...prev }; delete n[id]; return n })
    } else {
      setDone(id)
      setDoneMap(prev => ({ ...prev, [id]: new Date().toISOString() }))
    }
  }

  if (loading && !data) {
    return (
      <div>
        <h1 className="text-xl font-bold font-heading mb-1" style={{ color: 'rgba(255,255,255,0.7)' }}>Tasks</h1>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>Loading...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <h1 className="text-xl font-bold font-heading mb-1" style={{ color: 'rgba(255,255,255,0.7)' }}>Tasks</h1>
        <p className="text-sm" style={{ color: '#e5687a' }}>{error}</p>
        <button onClick={load} className="mt-3 text-xs px-3 py-1.5 rounded-md" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}>
          Retry
        </button>
      </div>
    )
  }

  const clients = data?.clients || []
  const totalOpen = clients.reduce((n, c) => n + c.tasks.filter(t => !doneMap[t.id]).length, 0)
  const totalHigh = clients.reduce((n, c) => n + c.tasks.filter(t => t.priority === 'high' && !doneMap[t.id]).length, 0)
  const doneCount = Object.keys(doneMap).length

  // Sort: clients with open tasks first, then by high priority count
  const sorted = [...clients].sort((a, b) => {
    const aOpen = a.tasks.filter(t => !doneMap[t.id]).length
    const bOpen = b.tasks.filter(t => !doneMap[t.id]).length
    if (aOpen === 0 && bOpen > 0) return 1
    if (bOpen === 0 && aOpen > 0) return -1
    const aHigh = a.tasks.filter(t => t.priority === 'high' && !doneMap[t.id]).length
    const bHigh = b.tasks.filter(t => t.priority === 'high' && !doneMap[t.id]).length
    return bHigh - aHigh || bOpen - aOpen
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold font-heading" style={{ color: 'rgba(255,255,255,0.7)' }}>Tasks</h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
            {clients.length} client{clients.length === 1 ? '' : 's'}
            {totalOpen > 0 ? (
              <>
                <span style={{ margin: '0 6px' }}>/</span>
                <span style={{ color: totalHigh > 0 ? '#e5687a' : '#d9a441' }}>
                  {totalOpen} task{totalOpen === 1 ? '' : 's'} remaining
                </span>
                {totalHigh > 0 && (
                  <span style={{ color: '#e5687a' }}> ({totalHigh} urgent)</span>
                )}
              </>
            ) : (
              <span style={{ color: '#6aab7a', marginLeft: 8 }}>All caught up</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {doneCount > 0 && (
            <button
              onClick={() => setShowCompleted(!showCompleted)}
              className="text-xs px-3 py-1.5 rounded-md transition-all"
              style={{
                background: showCompleted ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.06)',
                color: showCompleted ? 'rgba(139,92,246,0.8)' : 'rgba(255,255,255,0.4)',
                border: `1px solid ${showCompleted ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.08)'}`,
              }}
            >
              {showCompleted ? 'Hide completed' : `Show ${doneCount} completed`}
            </button>
          )}
          <button
            onClick={load}
            className="text-xs px-3 py-1.5 rounded-md"
            style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {sorted.map(client => (
          <ClientCard
            key={client.code}
            client={client}
            doneMap={doneMap}
            onToggle={toggleTask}
            showCompleted={showCompleted}
          />
        ))}
      </div>

      {clients.length === 0 && (
        <div
          className="text-center py-16"
          style={{ color: 'rgba(255,255,255,0.3)' }}
        >
          <p className="text-sm">No clients yet. Tasks will appear here after the first Stripe payment.</p>
        </div>
      )}
    </div>
  )
}
