'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: '◎' },
  { href: '/dashboard/prospects', label: 'Prospects', icon: '◉' },
  { href: '/dashboard/pipeline', label: 'Pipeline', icon: '▦' },
  { href: '/dashboard/messages', label: 'Messages', icon: '◈' },
  { href: '/dashboard/run', label: 'Run', icon: '▶' },
]

export default function DashboardLayout({ children }) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileNav, setMobileNav] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)
  const [user, setUser] = useState(null)

  useEffect(() => {
    if (!supabase) {
      setAuthChecked(true)
      return
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/login')
      } else {
        setUser(session.user)
        setAuthChecked(true)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        router.push('/login')
      } else {
        setUser(session.user)
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  async function handleSignOut() {
    if (supabase) {
      await supabase.auth.signOut()
      router.push('/login')
    }
  }

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-dash-bg flex items-center justify-center">
        <p className="text-sm text-dash-dim">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dash-bg text-dash-text">
      {/* Top bar */}
      <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-dash-bg/80 backdrop-blur-xl border-b border-dash-border flex items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileNav(!mobileNav)}
            className="lg:hidden text-dash-muted hover:text-dash-text transition-smooth"
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          </button>
          <Link href="/dashboard" className="text-lg font-bold tracking-tight font-heading">
            <span className="bg-gradient-to-r from-violet-300/80 to-rose-300/80 bg-clip-text text-transparent">
              pipeline
            </span>
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs text-dash-dim bg-dash-surface px-3 py-1.5 rounded-full border border-dash-border">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Live
          </div>
          <button
            onClick={handleSignOut}
            className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-xs font-bold text-white hover:opacity-80 transition-smooth"
            title="Sign out"
          >
            M
          </button>
        </div>
      </header>

      {/* Sidebar — desktop */}
      <aside className="hidden lg:flex fixed left-0 top-14 bottom-0 w-56 flex-col border-r border-dash-border bg-dash-bg/50 backdrop-blur-xl z-40">
        <nav className="flex-1 py-4 px-3 space-y-1">
          {navItems.map(item => {
            const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-smooth ${
                  active
                    ? 'bg-white/[0.08] text-dash-text'
                    : 'text-dash-muted hover:text-dash-text hover:bg-white/[0.04]'
                }`}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="px-4 py-3 border-t border-dash-border">
          <p className="text-xs text-dash-dim">Build Boosters Pipeline</p>
          <p className="text-xs text-dash-dim mt-0.5">v1.0 — UI Preview</p>
        </div>
      </aside>

      {/* Mobile nav overlay */}
      {mobileNav && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileNav(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-dash-bg border-r border-dash-border p-4 pt-16 space-y-1">
            {navItems.map(item => {
              const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileNav(false)}
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-smooth ${
                    active
                      ? 'bg-white/[0.08] text-dash-text'
                      : 'text-dash-muted hover:text-dash-text hover:bg-white/[0.04]'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  {item.label}
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="pt-14 lg:pl-56">
        <div className="p-4 lg:p-6 max-w-7xl">
          {children}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-dash-bg/80 backdrop-blur-xl border-t border-dash-border flex items-center justify-around z-40">
        {navItems.map(item => {
          const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 text-xs transition-smooth ${
                active ? 'text-dash-text' : 'text-dash-dim'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
