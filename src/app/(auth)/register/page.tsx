'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

export default function RegisterPage() {
  const { refresh } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [form, setForm] = useState({
    restaurantName: '',
    country: 'INDIA',
    adminName: '',
    email: '',
    password: '',
    restaurantDescription: '',
    cuisineType: '',
    address: '',
  })

  const set = (k: string, v: string) => setForm(prev => ({ ...prev, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      let body: FormData | string
      let headers: Record<string, string> = {}

      if (imageFile) {
        const fd = new FormData()
        Object.entries(form).forEach(([k, v]) => fd.append(k, v))
        fd.append('restaurantImage', imageFile)
        body = fd
      } else {
        body = JSON.stringify(form)
        headers['Content-Type'] = 'application/json'
      }

      const res = await fetch('/api/auth/register', { method: 'POST', headers, body })
      const data = await res.json()
      if (!data.success) throw new Error(data.error || 'Registration failed')
      await refresh()
      router.push('/restaurants')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      <div style={{ width: '100%', maxWidth: 520 }} className="animate-fade-in">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: 56, height: 56, background: 'var(--brand)', borderRadius: 14, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 11l19-9-9 19-2-8-8-2z"/>
            </svg>
          </div>
          <h1 className="font-display" style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>Register your restaurant</h1>
          <p style={{ color: 'var(--text-2)', marginTop: '0.25rem' }}>Set up your team&apos;s food ordering workspace</p>
        </div>

        <div className="card" style={{ padding: '2rem' }}>
          {error && (
            <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: 8, padding: '0.75rem', marginBottom: '1.25rem', color: '#991B1B', fontSize: '0.875rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ background: 'var(--brand-light)', border: '1px solid #FECACA', borderRadius: 8, padding: '0.875rem 1rem', marginBottom: '0.25rem' }}>
              <p style={{ fontSize: '0.8125rem', color: 'var(--brand-dark)', fontWeight: 500, margin: 0 }}>Restaurant details</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-2)', marginBottom: '0.4rem' }}>Restaurant name *</label>
                <input className="input-field" value={form.restaurantName} onChange={e => set('restaurantName', e.target.value)} placeholder="e.g. Spice Garden" required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-2)', marginBottom: '0.4rem' }}>Country *</label>
                <select className="input-field" value={form.country} onChange={e => set('country', e.target.value)}>
                  <option value="INDIA">India</option>
                  <option value="AMERICA">America</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-2)', marginBottom: '0.4rem' }}>Cuisine type</label>
                <input className="input-field" value={form.cuisineType} onChange={e => set('cuisineType', e.target.value)} placeholder="e.g. North Indian" />
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-2)', marginBottom: '0.4rem' }}>Address</label>
                <input className="input-field" value={form.address} onChange={e => set('address', e.target.value)} placeholder="Street address" />
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-2)', marginBottom: '0.4rem' }}>Description</label>
                <textarea className="input-field" value={form.restaurantDescription} onChange={e => set('restaurantDescription', e.target.value)} placeholder="Brief description..." rows={2} style={{ resize: 'none' }} />
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-2)', marginBottom: '0.4rem' }}>Restaurant image <span style={{ color: 'var(--text-3)', fontWeight: 400 }}>(optional)</span></label>
                <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)} className="input-field" style={{ paddingTop: '0.4rem' }} />
              </div>
            </div>

            <div style={{ background: 'var(--brand-light)', border: '1px solid #FECACA', borderRadius: 8, padding: '0.875rem 1rem', marginTop: '0.25rem' }}>
              <p style={{ fontSize: '0.8125rem', color: 'var(--brand-dark)', fontWeight: 500, margin: 0 }}>Admin account</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-2)', marginBottom: '0.4rem' }}>Your name *</label>
                <input className="input-field" value={form.adminName} onChange={e => set('adminName', e.target.value)} placeholder="Full name" required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-2)', marginBottom: '0.4rem' }}>Email *</label>
                <input type="email" className="input-field" value={form.email} onChange={e => set('email', e.target.value)} placeholder="admin@company.com" required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-2)', marginBottom: '0.4rem' }}>Password *</label>
                <input type="password" className="input-field" value={form.password} onChange={e => set('password', e.target.value)} placeholder="Min 6 characters" minLength={6} required />
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}>
              {loading ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Creating account...</> : 'Create restaurant & account'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-2)' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: 'var(--brand)', fontWeight: 500, textDecoration: 'none' }}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}
