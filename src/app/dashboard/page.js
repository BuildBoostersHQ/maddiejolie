'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { STAGES, getStage } from '@/lib/constants'
import { useProspects } from '@/lib/useProspects'

function useStripeMRR() {
  const [data, setData] = useState({
    mrr: 0, clients: 0, mrrGrowth: 0, clientGrowth: 0,
    paymentsThisMonth: 0, paymentsLastMonth: 0, paymentsGrowth: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/stripe/mrr')
      .then(r => r.json())
      .then(d => { if (!d.error) setData(d) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return { ...data, loading }
}

function StatCard({ label, value, sub, gradient }) {
  return (
    <div className="bg-dash-surface border border-dash-border rounded-xl p-4 lg:p-5">
      <p className="text-xs text-dash-dim uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-2xl lg:text-3xl font-bold font-heading ${gradient ? 'bg-gradient-to-r bg-clip-text text-transparent' : ''}`}
         style={gradient ? { backgroundImage: gradient } : {}}>
        {value}
      </p>
      {sub && <p className="text-xs text-dash-muted mt-1">{sub}</p>}
    </div>
  )
}

function HotLeadRow({ prospect }) {
  const mins = Math.floor(prospect.timeOnPage / 60)
  const secs = prospect.timeOnPage % 60
  const stage = getStage(prospect.stage)

  return (
    <div className="flex items-center justify-between py-3 border-b border-dash-border/50 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{prospect.name}</p>
        <p className="text-xs text-dash-dim">{prospect.owner} · {prospect.city}</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-xs text-dash-muted">{mins}m {secs}s on page</p>
          <p className="text-xs text-dash-dim">{prospect.pageViews} visits</p>
        </div>
        <span className={`${stage.class} text-[11px] font-semibold px-2.5 py-1 rounded-full text-white whitespace-nowrap`}>
          {stage.label}
        </span>
        <a
          href={`tel:${prospect.phone.replace(/\D/g, '')}`}
          className="w-8 h-8 rounded-full bg-green-500/10 hover:bg-green-500/20 text-green-400 flex items-center justify-center transition-smooth text-sm"
          title={`Call ${prospect.phone}`}
        >
          ☎
        </a>
      </div>
    </div>
  )
}

export default function DashboardOverview() {
  const { prospects, loading, isLive } = useProspects()
  const stripe = useStripeMRR()

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-sm text-dash-dim">Loading...</p>
    </div>
  )

  const total = prospects.length
  const clicked = prospects.filter(p => p.pageViews > 0).length
  const responded = prospects.filter(p => ['responded', 'called', 'closed'].includes(p.stage)).length
  const closed = prospects.filter(p => p.stage === 'closed').length

  const hotLeads = [...prospects]
    .filter(p => p.pageViews > 0 && !['closed', 'lost'].includes(p.stage))
    .sort((a, b) => b.timeOnPage - a.timeOnPage)

  const stageCounts = STAGES.map(s => ({
    ...s,
    count: prospects.filter(p => p.stage === s.id).length,
  })).filter(s => s.count > 0)

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      {/* Header */}
      <div>
        <h1 className="text-xl lg:text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-dash-muted mt-1">
          Your prospecting pipeline at a glance
          {isLive && <span className="ml-2 text-xs text-green-400/70">· live data</span>}
          {!isLive && <span className="ml-2 text-xs text-dash-dim">· demo data</span>}
        </p>
      </div>

      {/* Revenue row */}
      <div className="grid grid-cols-3 gap-3 lg:gap-4">
        <div className="bg-dash-surface border border-dash-border rounded-xl p-4 lg:p-5">
          <p className="text-xs text-dash-dim uppercase tracking-wider mb-1">MRR</p>
          <p className="text-2xl lg:text-3xl font-bold font-heading bg-gradient-to-r bg-clip-text text-transparent"
             style={{ backgroundImage: 'linear-gradient(to right, #6aab7a, #5b9e80)' }}>
            {stripe.loading ? '...' : `$${stripe.mrr.toLocaleString()}`}
          </p>
          {!stripe.loading && (
            <p className={`text-xs mt-1 ${stripe.mrrGrowth >= 0 ? 'text-green-400/70' : 'text-red-400/70'}`}>
              {stripe.mrrGrowth >= 0 ? '+' : ''}{stripe.mrrGrowth}%
            </p>
          )}
        </div>
        <div className="bg-dash-surface border border-dash-border rounded-xl p-4 lg:p-5">
          <p className="text-xs text-dash-dim uppercase tracking-wider mb-1">Clients</p>
          <p className="text-2xl lg:text-3xl font-bold font-heading bg-gradient-to-r bg-clip-text text-transparent"
             style={{ backgroundImage: 'linear-gradient(to right, #b896c7, #c494a8)' }}>
            {stripe.loading ? '...' : stripe.clients}
          </p>
          {!stripe.loading && (
            <p className={`text-xs mt-1 ${stripe.clientGrowth >= 0 ? 'text-green-400/70' : 'text-red-400/70'}`}>
              {stripe.clientGrowth >= 0 ? '+' : ''}{stripe.clientGrowth}%
            </p>
          )}
        </div>
        <div className="bg-dash-surface border border-dash-border rounded-xl p-4 lg:p-5">
          <p className="text-xs text-dash-dim uppercase tracking-wider mb-1">Payments this month</p>
          <p className="text-2xl lg:text-3xl font-bold font-heading bg-gradient-to-r bg-clip-text text-transparent"
             style={{ backgroundImage: 'linear-gradient(to right, #c89f80, #c4a76a)' }}>
            {stripe.loading ? '...' : `$${stripe.paymentsThisMonth.toLocaleString()}`}
          </p>
          {!stripe.loading && (
            <p className={`text-xs mt-1 ${stripe.paymentsGrowth >= 0 ? 'text-green-400/70' : 'text-red-400/70'}`}>
              {stripe.paymentsGrowth >= 0 ? '+' : ''}{stripe.paymentsGrowth}% vs last month
            </p>
          )}
        </div>
      </div>

      {/* Pipeline stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <StatCard
          label="Total Prospects"
          value={total}
          sub="All time"
          gradient="linear-gradient(to right, #7c83b8, #8e8fc8)"
        />
        <StatCard
          label="Clicked Demo"
          value={clicked}
          sub={`${total > 0 ? Math.round((clicked / total) * 100) : 0}% click rate`}
          gradient="linear-gradient(to right, #b896c7, #c494a8)"
        />
        <StatCard
          label="Responded"
          value={responded}
          sub={`${total > 0 ? Math.round((responded / total) * 100) : 0}% response rate`}
          gradient="linear-gradient(to right, #c89f80, #c4a76a)"
        />
        <StatCard
          label="Closed"
          value={closed}
          sub="From pipeline"
          gradient="linear-gradient(to right, #6aab7a, #5b9e80)"
        />
      </div>

      {/* Two-column layout */}
      <div className="grid lg:grid-cols-5 gap-4 lg:gap-6">
        {/* Hot leads */}
        <div className="lg:col-span-3 bg-dash-surface border border-dash-border rounded-xl">
          <div className="flex items-center justify-between px-4 lg:px-5 py-3 border-b border-dash-border">
            <div className="flex items-center gap-2">
              <span className="text-orange-400">🔥</span>
              <h2 className="text-sm font-semibold">Hot Leads</h2>
              <span className="text-xs text-dash-dim">sorted by time on page</span>
            </div>
            <Link href="/dashboard/prospects" className="text-xs text-violet-400 hover:text-violet-300 transition-smooth">
              View all →
            </Link>
          </div>
          <div className="px-4 lg:px-5">
            {hotLeads.length === 0 ? (
              <p className="py-8 text-center text-sm text-dash-dim">No page visits yet</p>
            ) : (
              hotLeads.map(p => <HotLeadRow key={p.id} prospect={p} />)
            )}
          </div>
        </div>

        {/* Pipeline breakdown */}
        <div className="lg:col-span-2 bg-dash-surface border border-dash-border rounded-xl">
          <div className="px-4 lg:px-5 py-3 border-b border-dash-border">
            <h2 className="text-sm font-semibold">Pipeline Breakdown</h2>
          </div>
          <div className="p-4 lg:p-5 space-y-2.5">
            {stageCounts.map(s => (
              <div key={s.id} className="flex items-center gap-3">
                <span className={`${s.class} w-2.5 h-2.5 rounded-full flex-shrink-0`} />
                <span className="text-sm text-dash-muted flex-1">{s.label}</span>
                <span className="text-sm font-semibold">{s.count}</span>
                <div className="w-16 h-1.5 rounded-full bg-dash-border overflow-hidden">
                  <div
                    className={`h-full rounded-full ${s.class}`}
                    style={{ width: `${(s.count / total) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent messages */}
      <div className="bg-dash-surface border border-dash-border rounded-xl">
        <div className="flex items-center justify-between px-4 lg:px-5 py-3 border-b border-dash-border">
          <h2 className="text-sm font-semibold">Recent Conversations</h2>
          <Link href="/dashboard/messages" className="text-xs text-violet-400 hover:text-violet-300 transition-smooth">
            View all →
          </Link>
        </div>
        <div className="divide-y divide-dash-border/50">
          {prospects.filter(p => p.messages.some(m => m.type === 'in')).map(p => {
            const lastIn = [...p.messages].reverse().find(m => m.type === 'in')
            return (
              <Link key={p.id} href="/dashboard/messages" className="flex items-center gap-3 px-4 lg:px-5 py-3 hover:bg-white/[0.02] transition-smooth">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500/20 to-pink-500/20 border border-dash-border flex items-center justify-center text-xs font-bold text-violet-300 flex-shrink-0">
                  {p.owner.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{p.owner} <span className="text-dash-dim font-normal">· {p.name}</span></p>
                  <p className="text-xs text-dash-muted truncate">{lastIn?.text}</p>
                </div>
                <span className="w-2 h-2 rounded-full bg-violet-400 flex-shrink-0" />
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
