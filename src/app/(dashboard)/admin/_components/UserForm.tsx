'use client'
import { useState } from 'react'
import { Restaurant, User } from '@/types'
import { COUNTRIES } from '@/data'

interface UserFormProps {
  currentUser: User
  restaurants: Restaurant[]
  onSuccess: (user: any) => void
}

export default function UserForm({ currentUser, restaurants, onSuccess }: UserFormProps) {
  const [newUser, setNewUser] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    role: 'MEMBER', 
    country: (currentUser?.country || 'INDIA') as 'INDIA' | 'AMERICA', 
    restaurantId: '' 
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(''); setSuccess(''); setSaving(true)
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      setSuccess(`User ${data.data.name} created!`)
      setNewUser({ name: '', email: '', password: '', role: 'MEMBER', country: (currentUser?.country || 'INDIA') as 'INDIA' | 'AMERICA', restaurantId: '' })
      onSuccess(data.data)
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="card" style={{ position: 'sticky', top: 80 }}>
      <h2 className="font-display" style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.25rem' }}>Add User</h2>
      {success && <div style={{ background: '#D1FAE5', border: '1px solid #6EE7B7', borderRadius: 8, padding: '0.625rem', marginBottom: '1rem', color: '#065F46', fontSize: '0.875rem' }}>{success}</div>}
      {error && <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: 8, padding: '0.625rem', marginBottom: '1rem', color: '#991B1B', fontSize: '0.875rem' }}>{error}</div>}
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--text-2)', marginBottom: '0.3rem', fontWeight: 500 }}>Full name</label>
          <input className="input-field" value={newUser.name} onChange={e => setNewUser(p => ({ ...p, name: e.target.value }))} required placeholder="John Doe" />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--text-2)', marginBottom: '0.3rem', fontWeight: 500 }}>Email</label>
          <input type="email" className="input-field" value={newUser.email} onChange={e => setNewUser(p => ({ ...p, email: e.target.value }))} required placeholder="john@company.com" />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--text-2)', marginBottom: '0.3rem', fontWeight: 500 }}>Password</label>
          <input type="password" className="input-field" value={newUser.password} onChange={e => setNewUser(p => ({ ...p, password: e.target.value }))} required minLength={6} placeholder="Min 6 chars" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--text-2)', marginBottom: '0.3rem', fontWeight: 500 }}>Role</label>
            <select className="input-field" value={newUser.role} onChange={e => setNewUser(p => ({ ...p, role: e.target.value }))}>
              {currentUser?.role === 'ADMIN' && <option value="MANAGER">Manager</option>}
              <option value="MEMBER">Member</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--text-2)', marginBottom: '0.3rem', fontWeight: 500 }}>Country</label>
            <select className="input-field" value={newUser.country} onChange={e => setNewUser(p => ({ ...p, country: e.target.value as 'INDIA' | 'AMERICA' }))} disabled={currentUser?.role === 'MANAGER'}>
              {COUNTRIES.map(c => <option key={c.value} value={c.value}>{c.icon} {c.label}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--text-2)', marginBottom: '0.3rem', fontWeight: 500 }}>Assign to restaurant</label>
          <select className="input-field" value={newUser.restaurantId} onChange={e => setNewUser(p => ({ ...p, restaurantId: e.target.value }))}>
            <option value="">— None —</option>
            {restaurants.map(r => <option key={r.id} value={r.id}>{r.name} ({r.country})</option>)}
          </select>
        </div>
        <button type="submit" className="btn-primary" disabled={saving} style={{ width: '100%', justifyContent: 'center' }}>
          {saving ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Creating...</> : '+ Create User'}
        </button>
      </form>
    </div>
  )
}
