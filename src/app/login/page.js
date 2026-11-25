'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogin(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!supabase) {
      setError('Supabase not configured')
      setLoading(false)
      return
    }

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#0c0c0c] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#e8e8e8]" style={{ fontFamily: 'Figtree, sans-serif' }}>
            <span style={{
              background: 'linear-gradient(to right, rgba(167,139,250,0.7), rgba(251,113,133,0.7))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              pipeline
            </span>
          </h1>
          <p className="text-sm text-[#5a5a5a] mt-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Build Boosters Dashboard
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="w-full bg-[#151515] border border-[#222] rounded-xl px-4 py-3 text-sm text-[#e8e8e8] placeholder-[#5a5a5a] focus:outline-none focus:border-[rgba(167,139,250,0.4)] transition-all"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            />
          </div>
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="w-full bg-[#151515] border border-[#222] rounded-xl px-4 py-3 text-sm text-[#e8e8e8] placeholder-[#5a5a5a] focus:outline-none focus:border-[rgba(167,139,250,0.4)] transition-all"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            />
          </div>

          {error && (
            <p className="text-xs text-red-400 px-1">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-sm font-medium text-white transition-all disabled:opacity-50"
            style={{
              fontFamily: 'Poppins, sans-serif',
              background: 'linear-gradient(135deg, rgba(167,139,250,0.6), rgba(251,113,133,0.6))',
            }}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="text-center text-[10px] text-[#5a5a5a] mt-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
          Authorized access only
        </p>
      </div>
    </div>
  )
}
