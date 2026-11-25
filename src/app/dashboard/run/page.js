'use client'
import { useState } from 'react'
import { TRADES } from '@/lib/constants'

const AREAS = [
  'Miami, FL',
  'Fort Lauderdale, FL',
  'West Palm Beach, FL',
  'Boca Raton, FL',
  'Coral Gables, FL',
  'Hollywood, FL',
  'Pompano Beach, FL',
  'Delray Beach, FL',
  'Aventura, FL',
  'Doral, FL',
]

const TARGET_TRADES = [
  'handyman',
  'painter',
  'pressure washing',
  'junk removal',
  'landscaper',
  'cleaning service',
  'general contractor',
  'remodeling',
]

export default function RunPipelinePage() {
  const [area, setArea] = useState('Miami, FL')
  const [customArea, setCustomArea] = useState('')
  const [trade, setTrade] = useState('handyman')
  const [brand, setBrand] = useState('mj')
  const [limit, setLimit] = useState(500)
  const [step, setStep] = useState('idle') // idle, pulling, verifying, done
  const [log, setLog] = useState([])
  const [results, setResults] = useState(null)
  const [verifyProgress, setVerifyProgress] = useState(null)

  function addLog(msg) {
    setLog(prev => [...prev, { time: new Date().toLocaleTimeString(), msg }])
  }

  async function runPull() {
    setStep('pulling')
    setLog([])
    setResults(null)
    addLog(`Starting pull: ${trade} in ${customArea || area} (limit: ${limit})`)

    try {
      const res = await fetch('/api/pipeline/pull', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          area: customArea || area,
          trade,
          limit,
          brand,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        addLog(`Error: ${data.error}`)
        setStep('idle')
        return
      }

      setResults(data)
      addLog(`Pulled ${data.raw} raw results`)
      addLog(`After filtering: ${data.filtered} (dropped ${data.raw - data.filtered})`)
      addLog(`Duplicates skipped: ${data.duplicates}`)
      addLog(`Saved ${data.saved} new prospects`)
      if (data.mjCount != null && data.bbCount != null) {
        addLog(`Brand split: ${data.mjCount} MJ / ${data.bbCount} BB`)
      }

      if (data.saved > 0) {
        addLog('Ready to verify phone numbers')
        setStep('ready_verify')
      } else {
        addLog('No new prospects to save')
        setStep('done')
      }

    } catch (err) {
      addLog(`Error: ${err.message}`)
      setStep('idle')
    }
  }

  async function runVerify() {
    setStep('verifying')
    addLog('Starting phone verification...')

    let totalVerified = 0
    let totalMobile = 0
    let rounds = 0

    while (true) {
      rounds++
      try {
        const res = await fetch('/api/pipeline/verify', {
          method: 'POST',
        })

        const data = await res.json()

        if (!res.ok) {
          addLog(`Verify error: ${data.error}`)
          break
        }

        totalVerified += data.verified
        totalMobile += data.mobile
        setVerifyProgress({
          verified: totalVerified,
          mobile: totalMobile,
          remaining: data.remaining,
        })

        addLog(`Batch ${rounds}: ${data.mobile} mobile, ${data.landline} landline, ${data.voip} VoIP (${data.remaining} left)`)

        if (data.done) {
          addLog(`Verification complete! ${totalMobile} mobile numbers confirmed`)
          break
        }

        // Small delay between batches
        await new Promise(r => setTimeout(r, 1000))

      } catch (err) {
        addLog(`Verify error: ${err.message}`)
        break
      }

      if (rounds > 50) {
        addLog('Safety limit reached — stopping')
        break
      }
    }

    setStep('done')
  }

  return (
    <div className="pb-20 lg:pb-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl lg:text-2xl font-bold font-heading">Run pipeline</h1>
        <p className="text-sm text-dash-muted mt-1">Pull, filter, verify, and save new prospects</p>
      </div>

      {/* Config */}
      <div className="bg-dash-surface border border-dash-border rounded-xl p-5 mb-4">
        <div className="space-y-4">
          <div>
            <label className="text-xs text-dash-dim uppercase tracking-wider block mb-2">Area</label>
            <select
              value={area}
              onChange={(e) => { setArea(e.target.value); setCustomArea(''); }}
              className="w-full bg-dash-bg border border-dash-border rounded-lg px-3 py-2.5 text-sm text-dash-text focus:outline-none focus:border-violet-500/30 transition-all appearance-none"
            >
              {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
              <option value="custom">Custom area...</option>
            </select>
            {area === 'custom' && (
              <input
                type="text"
                value={customArea}
                onChange={(e) => setCustomArea(e.target.value)}
                placeholder="e.g. Atlanta, GA"
                className="w-full mt-2 bg-dash-bg border border-dash-border rounded-lg px-3 py-2.5 text-sm text-dash-text placeholder-dash-dim focus:outline-none focus:border-violet-500/30 transition-all"
              />
            )}
          </div>

          <div>
            <label className="text-xs text-dash-dim uppercase tracking-wider block mb-2">Trade</label>
            <select
              value={trade}
              onChange={(e) => setTrade(e.target.value)}
              className="w-full bg-dash-bg border border-dash-border rounded-lg px-3 py-2.5 text-sm text-dash-text focus:outline-none focus:border-violet-500/30 transition-all appearance-none"
            >
              {TARGET_TRADES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs text-dash-dim uppercase tracking-wider block mb-2">Brand</label>
            <select
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="w-full bg-dash-bg border border-dash-border rounded-lg px-3 py-2.5 text-sm text-dash-text focus:outline-none focus:border-violet-500/30 transition-all appearance-none"
            >
              <option value="split">50/50 Split (A/B Test)</option>
              <option value="mj">Maddie Jolie only</option>
              <option value="bb">Build Boosters only</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-dash-dim uppercase tracking-wider block mb-2">
              Limit <span className="normal-case text-dash-dim">({limit} prospects)</span>
            </label>
            <input
              type="range"
              min="100"
              max="1000"
              step="50"
              value={limit}
              onChange={(e) => setLimit(parseInt(e.target.value))}
              className="w-full accent-violet-500"
            />
            <div className="flex justify-between text-[10px] text-dash-dim mt-1">
              <span>100</span>
              <span>500</span>
              <span>1,000</span>
            </div>
          </div>
        </div>

        <div className="mt-5 flex gap-3">
          <button
            onClick={runPull}
            disabled={step === 'pulling' || step === 'verifying'}
            className="flex-1 py-3 rounded-xl text-sm font-medium text-white transition-all disabled:opacity-40"
            style={{
              background: 'linear-gradient(135deg, rgba(124,131,184,0.8), rgba(142,143,200,0.8))',
            }}
          >
            {step === 'pulling' ? 'Pulling...' : 'Pull prospects'}
          </button>

          {(step === 'ready_verify' || step === 'done') && (
            <button
              onClick={runVerify}
              disabled={step === 'verifying'}
              className="flex-1 py-3 rounded-xl text-sm font-medium text-white transition-all disabled:opacity-40"
              style={{
                background: 'linear-gradient(135deg, rgba(106,171,122,0.8), rgba(91,158,128,0.8))',
              }}
            >
              {step === 'verifying' ? 'Verifying...' : 'Verify phones'}
            </button>
          )}
        </div>
      </div>

      {/* Verify progress */}
      {verifyProgress && (
        <div className="bg-dash-surface border border-dash-border rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-dash-dim uppercase tracking-wider">Verification progress</span>
            <span className="text-xs text-dash-muted">{verifyProgress.remaining} remaining</span>
          </div>
          <div className="flex gap-4">
            <div>
              <p className="text-lg font-bold text-green-400 font-heading">{verifyProgress.mobile}</p>
              <p className="text-[10px] text-dash-dim">Mobile</p>
            </div>
            <div>
              <p className="text-lg font-bold text-dash-text font-heading">{verifyProgress.verified}</p>
              <p className="text-[10px] text-dash-dim">Checked</p>
            </div>
          </div>
        </div>
      )}

      {/* Results summary */}
      {results && (
        <div className="bg-dash-surface border border-dash-border rounded-xl p-4 mb-4">
          <div className="grid grid-cols-4 gap-3 text-center">
            <div>
              <p className="text-lg font-bold font-heading" style={{ color: '#7c83b8' }}>{results.raw}</p>
              <p className="text-[10px] text-dash-dim">Raw</p>
            </div>
            <div>
              <p className="text-lg font-bold font-heading" style={{ color: '#b896c7' }}>{results.filtered}</p>
              <p className="text-[10px] text-dash-dim">Filtered</p>
            </div>
            <div>
              <p className="text-lg font-bold font-heading" style={{ color: '#c89f80' }}>{results.duplicates}</p>
              <p className="text-[10px] text-dash-dim">Dupes</p>
            </div>
            <div>
              <p className="text-lg font-bold font-heading" style={{ color: '#6aab7a' }}>{results.saved}</p>
              <p className="text-[10px] text-dash-dim">Saved</p>
            </div>
          </div>
        </div>
      )}

      {/* Log */}
      {log.length > 0 && (
        <div className="bg-dash-bg border border-dash-border rounded-xl p-4 font-mono text-xs">
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {log.map((l, i) => (
              <div key={i} className="flex gap-2">
                <span className="text-dash-dim flex-shrink-0">{l.time}</span>
                <span className="text-dash-muted">{l.msg}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 'done' && (
        <div className="mt-4 text-center">
          <a
            href="/dashboard/prospects"
            className="text-sm text-violet-400/70 hover:text-violet-300/70 transition-all"
          >
            View prospects →
          </a>
        </div>
      )}
    </div>
  )
}
