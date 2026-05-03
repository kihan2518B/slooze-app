'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

export default function LoginPage() {
  const { login } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const DEMO_USERS = [
    { label: 'Nick Fury (Admin)', email: 'nick.fury@shield.com' },
    { label: 'Capt. Marvel (Mgr-India)', email: 'captain.marvel@shield.com' },
    { label: 'Capt. America (Mgr-US)', email: 'captain.america@shield.com' },
    { label: 'Thanos (Member-India)', email: 'thanos@shield.com' },
    { label: 'Thor (Member-India)', email: 'thor@shield.com' },
    { label: 'Travis (Member-US)', email: 'travis@shield.com' },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      router.push('/restaurants')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ width: '100%', maxWidth: 420 }} className="animate-fade-in">
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ width: 56, height: 56, background: 'var(--brand)', borderRadius: 14, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 11l19-9-9 19-2-8-8-2z"/>
            </svg>
          </div>
          <h1 className="font-display" style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text)', margin: 0 }}>Slooze</h1>
          <p style={{ color: 'var(--text-2)', marginTop: '0.25rem', fontSize: '0.9375rem' }}>Sign in to your account</p>
        </div>

        <div className="card" style={{ padding: '2rem' }}>
          {error && (
            <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: 8, padding: '0.75rem 1rem', marginBottom: '1.25rem', color: '#991B1B', fontSize: '0.875rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-2)', marginBottom: '0.4rem' }}>Email</label>
              <input
                type="email"
                className="input-field"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-2)', marginBottom: '0.4rem' }}>Password</label>
              <input
                type="password"
                className="input-field"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}>
              {loading ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Signing in...</> : 'Sign in'}
            </button>
          </form>

          {/* Demo quick-fill */}
          <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-3)', marginBottom: '0.75rem', textAlign: 'center' }}>Demo accounts (password: <code style={{ background: 'var(--surface-2)', padding: '1px 6px', borderRadius: 4, fontSize: '0.8125rem' }}>password123</code>)</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              {DEMO_USERS.map(u => (
                <button
                  key={u.email}
                  onClick={() => { setEmail(u.email); setPassword('password123') }}
                  style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.5rem 0.625rem', fontSize: '0.75rem', color: 'var(--text-2)', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--brand)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                >
                  {u.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-2)' }}>
          New restaurant?{' '}
          <Link href="/register" style={{ color: 'var(--brand)', fontWeight: 500, textDecoration: 'none' }}>Register here</Link>
        </p>
      </div>
    </div>
  )
}
