'use client'
import { STAGES } from '@/lib/constants'
import { useProspects } from '@/lib/useProspects'

function PipelineCard({ prospect }) {
  const hasVisited = prospect.pageViews > 0
  const mins = Math.floor(prospect.timeOnPage / 60)

  return (
    <div className="bg-dash-bg border border-dash-border/50 rounded-lg p-3 hover:border-dash-border transition-smooth">
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-sm font-medium truncate">{prospect.name}</p>
        <span className="text-xs text-dash-dim">{prospect.score}</span>
      </div>
      <p className="text-xs text-dash-dim mb-2">{prospect.owner} · {prospect.trade}</p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {hasVisited && (
            <span className="text-[10px] text-pink-400 bg-pink-400/10 px-1.5 py-0.5 rounded-full">
              {prospect.pageViews}× · {mins}m
            </span>
          )}
          <span className="text-[10px] text-dash-dim">
            ⭐ {prospect.rating}
          </span>
        </div>
        <a
          href={`tel:${prospect.phone.replace(/\D/g, '')}`}
          className="text-green-400 hover:text-green-300 transition-smooth"
          title={prospect.phone}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
          </svg>
        </a>
      </div>
    </div>
  )
}

export default function PipelinePage() {
  const { prospects: allProspects, loading } = useProspects()

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-sm text-dash-dim">Loading...</p>
    </div>
  )

  const pipelineStages = STAGES.filter(s =>
    ['new', 'sms1', 'sms2', 'vm', 'sms3', 'clicked', 'responded', 'called', 'closed', 'lost'].includes(s.id)
  )

  return (
    <div className="pb-20 lg:pb-6">
      <div className="mb-4">
        <h1 className="text-xl lg:text-2xl font-bold">Pipeline</h1>
        <p className="text-sm text-dash-muted mt-1">Drag-and-drop coming soon — visual overview for now</p>
      </div>

      <div className="overflow-x-auto -mx-4 px-4 lg:mx-0 lg:px-0">
        <div className="flex gap-3 min-w-max lg:min-w-0 lg:grid lg:grid-cols-5 xl:grid-cols-5">
          {pipelineStages.map(stage => {
            const prospects = allProspects.filter(p => p.stage === stage.id)
            return (
              <div key={stage.id} className="w-56 lg:w-auto flex-shrink-0">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`${stage.class} w-2.5 h-2.5 rounded-full`} />
                  <span className="text-xs font-semibold text-dash-muted uppercase tracking-wider">{stage.label}</span>
                  <span className="text-xs text-dash-dim bg-dash-surface px-1.5 py-0.5 rounded-full border border-dash-border">
                    {prospects.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {prospects.map(p => (
                    <PipelineCard key={p.id} prospect={p} />
                  ))}
                  {prospects.length === 0 && (
                    <div className="border border-dashed border-dash-border/30 rounded-lg py-6 text-center">
                      <p className="text-xs text-dash-dim">Empty</p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
