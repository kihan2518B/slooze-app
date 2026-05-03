'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Restaurant, PaymentMethod } from '@/types'

type User = { id: string; name: string; email: string; role: string; country: string; restaurantId: string | null; restaurant?: { id: string; name: string } }

const PAYMENT_ICONS: Record<string, string> = { CARD: '💳', QR: '📱', UPI: '⚡', BANK_TRANSFER: '🏦', WALLET: '👛' }

export default function AdminPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [tab, setTab] = useState<'users' | 'restaurants' | 'payments'>('users')
  const [users, setUsers] = useState<User[]>([])
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [payMethods, setPayMethods] = useState<Record<string, PaymentMethod[]>>({})
  const [loading, setLoading] = useState(true)

  // New user form
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'MEMBER', country: (user?.country || 'INDIA') as 'INDIA' | 'AMERICA', restaurantId: '' })
  const [userError, setUserError] = useState('')
  const [userSuccess, setUserSuccess] = useState('')
  const [savingUser, setSavingUser] = useState(false)

  // New payment method form
  const [selectedRestaurant, setSelectedRestaurant] = useState('')
  const [newMethod, setNewMethod] = useState({ type: 'CARD', details: '{}' })
  const [payError, setPayError] = useState('')
  const [paySuccess, setPaySuccess] = useState('')
  const [savingPay, setSavingPay] = useState(false)

  useEffect(() => {
    if (!user || (user.role !== 'ADMIN' && user.role !== 'MANAGER')) {
      router.push('/restaurants')
      return
    }
    Promise.all([
      fetch('/api/users').then(r => r.json()),
      fetch('/api/restaurants').then(r => r.json()),
    ]).then(([uData, rData]) => {
      if (uData.success) setUsers(uData.data)
      if (rData.success) {
        setRestaurants(rData.data)
        if (rData.data.length > 0) setSelectedRestaurant(rData.data[0].id)
        // Fetch payment methods for all restaurants
        Promise.all(rData.data.map((r: Restaurant) =>
          fetch(`/api/restaurants/${r.id}/payment-methods`).then(res => res.json()).then(d => [r.id, d.data || []])
        )).then(entries => setPayMethods(Object.fromEntries(entries)))
      }
    }).finally(() => setLoading(false))
  }, [user, router])

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setUserError(''); setUserSuccess(''); setSavingUser(true)
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      setUsers(prev => [data.data, ...prev])
      setUserSuccess(`User ${data.data.name} created!`)
      setNewUser({ name: '', email: '', password: '', role: 'MEMBER', country: (user?.country || 'INDIA') as 'INDIA' | 'AMERICA', restaurantId: '' })
    } catch (err) {
      setUserError(err instanceof Error ? err.message : 'Failed')
    } finally {
      setSavingUser(false)
    }
  }

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    setPayError(''); setPaySuccess(''); setSavingPay(true)
    try {
      let details: Record<string, unknown>
      try { details = JSON.parse(newMethod.details) } catch { throw new Error('Invalid JSON in details field') }
      const res = await fetch(`/api/restaurants/${selectedRestaurant}/payment-methods`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: newMethod.type, details }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      setPayMethods(prev => ({ ...prev, [selectedRestaurant]: [...(prev[selectedRestaurant] || []), data.data] }))
      setPaySuccess('Payment method added!')
      setNewMethod({ type: 'CARD', details: '{}' })
    } catch (err) {
      setPayError(err instanceof Error ? err.message : 'Failed')
    } finally {
      setSavingPay(false)
    }
  }

  const handleTogglePayment = async (restaurantId: string, methodId: string, isActive: boolean) => {
    const res = await fetch(`/api/restaurants/${restaurantId}/payment-methods`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ methodId, isActive: !isActive }),
    })
    const data = await res.json()
    if (data.success) {
      setPayMethods(prev => ({
        ...prev,
        [restaurantId]: prev[restaurantId].map(m => m.id === methodId ? { ...m, isActive: !isActive } : m),
      }))
    }
  }

  const PRESET_DETAILS: Record<string, string> = {
    CARD: JSON.stringify({ label: 'Credit/Debit Card', acceptedNetworks: ['VISA', 'MASTERCARD'], currency: 'INR' }, null, 2),
    QR: JSON.stringify({ label: 'QR Payment', qrImageUrl: null, currency: 'INR' }, null, 2),
    UPI: JSON.stringify({ upiId: 'restaurant@upi', currency: 'INR' }, null, 2),
    BANK_TRANSFER: JSON.stringify({ accountNumber: '1234567890', ifsc: 'BANK0001234', bankName: 'State Bank', currency: 'INR' }, null, 2),
    WALLET: JSON.stringify({ label: 'Digital Wallets', providers: ['GOOGLE_PAY', 'APPLE_PAY'], currency: 'INR' }, null, 2),
  }

  if (loading) return <div style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>

  const TABS = [
    { key: 'users', label: 'Users' },
    { key: 'restaurants', label: 'Restaurants' },
    ...(user?.role === 'ADMIN' ? [{ key: 'payments', label: 'Payment Methods' }] : []),
  ]

  return (
    <div>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 className="font-display" style={{ fontSize: '1.875rem', fontWeight: 700, margin: '0 0 0.25rem' }}>Admin Panel</h1>
        <p style={{ color: 'var(--text-2)', margin: 0 }}>
          {user?.role === 'ADMIN' ? 'Full administrative access' : `Manager access – ${user?.country === 'INDIA' ? 'India' : 'America'}`}
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.75rem', borderBottom: '1px solid var(--border)', paddingBottom: '0' }}>
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as typeof tab)}
            style={{
              padding: '0.625rem 1.25rem',
              border: 'none',
              background: 'none',
              fontWeight: 600,
              fontSize: '0.9375rem',
              cursor: 'pointer',
              color: tab === t.key ? 'var(--brand)' : 'var(--text-2)',
              borderBottom: `2px solid ${tab === t.key ? 'var(--brand)' : 'transparent'}`,
              marginBottom: -1,
              transition: 'all 0.15s',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Users tab */}
      {tab === 'users' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '1.5rem', alignItems: 'start' }}>
          <div>
            <h2 className="font-display" style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>All Users</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {users.map(u => (
                <div key={u.id} className="card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--brand-light)', border: '1px solid var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9375rem', fontWeight: 700, color: 'var(--brand)', flexShrink: 0 }}>
                    {u.name[0]}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text)' }}>{u.name}</div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-3)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.email}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    <span className={`badge badge-${u.role.toLowerCase()}`}>{u.role}</span>
                    <span className={`badge ${u.country === 'INDIA' ? 'badge-india' : 'badge-america'}`}>{u.country === 'INDIA' ? '🇮🇳' : '🇺🇸'} {u.country}</span>
                  </div>
                  {u.restaurant && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-3)', whiteSpace: 'nowrap' }}>{u.restaurant.name}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ position: 'sticky', top: 80 }}>
            <h2 className="font-display" style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.25rem' }}>Add User</h2>
            {userSuccess && <div style={{ background: '#D1FAE5', border: '1px solid #6EE7B7', borderRadius: 8, padding: '0.625rem', marginBottom: '1rem', color: '#065F46', fontSize: '0.875rem' }}>{userSuccess}</div>}
            {userError && <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: 8, padding: '0.625rem', marginBottom: '1rem', color: '#991B1B', fontSize: '0.875rem' }}>{userError}</div>}
            <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
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
                    {user?.role === 'ADMIN' && <option value="MANAGER">Manager</option>}
                    <option value="MEMBER">Member</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--text-2)', marginBottom: '0.3rem', fontWeight: 500 }}>Country</label>
                  <select className="input-field" value={newUser.country} onChange={e => setNewUser(p => ({ ...p, country: e.target.value as 'INDIA' | 'AMERICA' }))} disabled={user?.role === 'MANAGER'}>
                    <option value="INDIA">India</option>
                    <option value="AMERICA">America</option>
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
              <button type="submit" className="btn-primary" disabled={savingUser} style={{ width: '100%', justifyContent: 'center' }}>
                {savingUser ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Creating...</> : '+ Create User'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Restaurants tab */}
      {tab === 'restaurants' && (
        <div>
          <h2 className="font-display" style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Your Restaurants</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {restaurants.map(r => (
              <div key={r.id} className="card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <h3 className="font-display" style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>{r.name}</h3>
                  <span className={`badge ${r.country === 'INDIA' ? 'badge-india' : 'badge-america'}`}>{r.country === 'INDIA' ? '🇮🇳' : '🇺🇸'}</span>
                </div>
                {r.description && <p style={{ fontSize: '0.8125rem', color: 'var(--text-2)', marginBottom: '0.75rem', lineHeight: 1.5 }}>{r.description}</p>}
                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8125rem', color: 'var(--text-3)' }}>
                  {r.cuisineType && <span>🍴 {r.cuisineType}</span>}
                  {r._count && <span>📋 {r._count.menuItems} items</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment methods tab – ADMIN only */}
      {tab === 'payments' && user?.role === 'ADMIN' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '1.5rem', alignItems: 'start' }}>
          <div>
            <h2 className="font-display" style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.25rem' }}>Payment Methods by Restaurant</h2>
            {restaurants.map(r => (
              <div key={r.id} style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-2)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ height: 2, width: 16, background: 'var(--brand)', display: 'inline-block', borderRadius: 1 }} />
                  {r.name} <span style={{ fontSize: '0.75rem', color: 'var(--text-3)', fontWeight: 400 }}>({r.country})</span>
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {(payMethods[r.id] || []).length === 0 ? (
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-3)', fontStyle: 'italic' }}>No payment methods configured</p>
                  ) : (payMethods[r.id] || []).map(m => (
                    <div key={m.id} className="card" style={{ padding: '0.875rem 1.125rem', display: 'flex', alignItems: 'center', gap: '0.875rem', opacity: m.isActive ? 1 : 0.5 }}>
                      <span style={{ fontSize: '1.25rem' }}>{PAYMENT_ICONS[m.type]}</span>
                      <div style={{ flex: 1 }}>
                        <span style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{m.type.replace('_', ' ')}</span>
                      </div>
                      <span className={`badge ${m.isActive ? 'badge-placed' : 'badge-cancelled'}`}>{m.isActive ? 'Active' : 'Disabled'}</span>
                      <button
                        onClick={() => handleTogglePayment(r.id, m.id, m.isActive)}
                        style={{ background: m.isActive ? '#FEE2E2' : '#D1FAE5', color: m.isActive ? '#991B1B' : '#065F46', border: 'none', borderRadius: 6, padding: '0.3rem 0.75rem', fontSize: '0.8125rem', fontWeight: 500, cursor: 'pointer' }}
                      >
                        {m.isActive ? 'Disable' : 'Enable'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="card" style={{ position: 'sticky', top: 80 }}>
            <h2 className="font-display" style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.25rem' }}>Add Payment Method</h2>
            {paySuccess && <div style={{ background: '#D1FAE5', border: '1px solid #6EE7B7', borderRadius: 8, padding: '0.625rem', marginBottom: '1rem', color: '#065F46', fontSize: '0.875rem' }}>{paySuccess}</div>}
            {payError && <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: 8, padding: '0.625rem', marginBottom: '1rem', color: '#991B1B', fontSize: '0.875rem' }}>{payError}</div>}
            <form onSubmit={handleAddPayment} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--text-2)', marginBottom: '0.3rem', fontWeight: 500 }}>Restaurant</label>
                <select className="input-field" value={selectedRestaurant} onChange={e => setSelectedRestaurant(e.target.value)}>
                  {restaurants.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--text-2)', marginBottom: '0.3rem', fontWeight: 500 }}>Type</label>
                <select className="input-field" value={newMethod.type}
                  onChange={e => setNewMethod(p => ({ ...p, type: e.target.value, details: PRESET_DETAILS[e.target.value] || '{}' }))}>
                  <option value="CARD">💳 Card</option>
                  <option value="QR">📱 QR Code</option>
                  <option value="UPI">⚡ UPI</option>
                  <option value="BANK_TRANSFER">🏦 Bank Transfer</option>
                  <option value="WALLET">👛 Wallet</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--text-2)', marginBottom: '0.3rem', fontWeight: 500 }}>Details (JSON)</label>
                <textarea
                  className="input-field"
                  value={newMethod.details}
                  onChange={e => setNewMethod(p => ({ ...p, details: e.target.value }))}
                  rows={6}
                  style={{ fontFamily: 'monospace', fontSize: '0.8125rem', resize: 'vertical' }}
                />
              </div>
              <button type="submit" className="btn-primary" disabled={savingPay} style={{ width: '100%', justifyContent: 'center' }}>
                {savingPay ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Adding...</> : '+ Add Method'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
