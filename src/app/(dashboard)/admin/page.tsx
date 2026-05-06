'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Restaurant, PaymentMethod, MenuItem } from '@/types'
import RestaurantList from './_components/RestaurantList'
import RestaurantForm from './_components/RestaurantForm'
import UserForm from './_components/UserForm'
import PaymentMethodForm from './_components/PaymentMethodForm'
import MenuItemForm from './_components/MenuItemForm'
import { MapPin, Utensils, CreditCard, QrCode, Zap, Landmark, Wallet } from 'lucide-react'

type User = { id: string; name: string; email: string; role: string; country: string; restaurantId: string | null; restaurant?: { id: string; name: string } }

const PAYMENT_ICONS: Record<string, React.ReactNode> = { 
  CARD: <CreditCard size={18} />, 
  QR: <QrCode size={18} />, 
  UPI: <Zap size={18} />, 
  BANK_TRANSFER: <Landmark size={18} />, 
  WALLET: <Wallet size={18} /> 
}

export default function AdminPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [tab, setTab] = useState<'users' | 'restaurants' | 'payments' | 'menu'>('users')
  const [users, setUsers] = useState<User[]>([])
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [payMethods, setPayMethods] = useState<Record<string, PaymentMethod[]>>({})
  const [editingPaymentMethod, setEditingPaymentMethod] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  // Restaurant form state
  const [showRestForm, setShowRestForm] = useState(false)
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | undefined>(undefined)

  // Menu items state
  const [selectedMenuRestaurant, setSelectedMenuRestaurant] = useState('')
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loadingMenu, setLoadingMenu] = useState(false)
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null)

  useEffect(() => {
    if (selectedMenuRestaurant) {
      setLoadingMenu(true)
      fetch(`/api/restaurants/${selectedMenuRestaurant}/menu`)
        .then(res => res.json())
        .then(data => {
          if (data.success) setMenuItems(data.data)
        })
        .finally(() => setLoadingMenu(false))
    } else {
      setMenuItems([])
    }
  }, [selectedMenuRestaurant])

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
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
        // Fetch payment methods for all restaurants
        Promise.all(rData.data.map((r: Restaurant) =>
          fetch(`/api/restaurants/${r.id}/payment-methods`).then(res => res.json()).then(d => [r.id, d.data || []])
        )).then(entries => setPayMethods(Object.fromEntries(entries)))
      }
    }).finally(() => setLoading(false))
  }, [user, router])

  const handleTogglePayment = async (restId: string, methodId: string, isActive: boolean) => {
    try {
      const res = await fetch(`/api/restaurants/${restId}/payment-methods`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ methodId, isActive: !isActive }),
      })
      const data = await res.json()
      if (data.success) {
        setPayMethods(prev => ({
          ...prev,
          [restId]: prev[restId].map(m => m.id === methodId ? { ...m, isActive: !isActive } : m),
        }))
      }
    } catch (e) { console.error(e) }
  }

  const handleDeletePayment = async (restId: string, methodId: string) => {
    if (!confirm('Are you sure you want to delete this payment method?')) return
    try {
      const res = await fetch(`/api/restaurants/${restId}/payment-methods?id=${methodId}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (data.success) {
        setPayMethods(prev => ({
          ...prev,
          [restId]: prev[restId].filter(m => m.id !== methodId),
        }))
        if (editingPaymentMethod?.id === methodId) {
          setEditingPaymentMethod(null)
        }
      }
    } catch (e) { console.error(e) }
  }

  if (loading) return <div style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>

  const TABS = [
    { key: 'users', label: 'Users' },
    { key: 'restaurants', label: 'Restaurants' },
    ...(user?.role === 'ADMIN' ? [
      { key: 'menu', label: 'Menu Items' },
      { key: 'payments', label: 'Payment Methods' }
    ] : []),
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
                    <span className={`badge ${u.country === 'INDIA' ? 'badge-india' : 'badge-america'}`} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><MapPin size={12} /> {u.country}</span>
                  </div>
                  {u.restaurant && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-3)', whiteSpace: 'nowrap' }}>{u.restaurant.name}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <UserForm 
            currentUser={user!} 
            restaurants={restaurants} 
            onSuccess={(u) => setUsers(prev => [u, ...prev])}
          />
        </div>
      )}

      {/* Restaurants tab */}
      {tab === 'restaurants' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 className="font-display" style={{ fontSize: '1.125rem', fontWeight: 600, margin: 0 }}>Your Restaurants</h2>
            {user?.role === 'ADMIN' && (
              <button onClick={() => { setEditingRestaurant(undefined); setShowRestForm(true) }} className="btn-primary" style={{ padding: '0.4rem 0.875rem', fontSize: '0.875rem' }}>
                + Add Restaurant
              </button>
            )}
          </div>
          <RestaurantList 
            restaurants={restaurants} 
            onEdit={(r) => {
              setEditingRestaurant(r)
              setShowRestForm(true)
            }}
          />
        </div>
      )}

      {/* Menu Items tab – ADMIN only */}
      {tab === 'menu' && user?.role === 'ADMIN' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '1.5rem', alignItems: 'start' }}>
          <div>
            <h2 className="font-display" style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.25rem' }}>Menu Items Overview</h2>
            {!selectedMenuRestaurant ? (
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '2rem', textAlign: 'center', color: 'var(--text-2)' }}>
                <div style={{ marginBottom: '1rem', color: 'var(--border)', display: 'flex', justifyContent: 'center' }}><Utensils size={40} /></div>
                <p>Select a restaurant on the right to manage menu items.</p>
              </div>
            ) : loadingMenu ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
            ) : menuItems.length === 0 ? (
              <p style={{ color: 'var(--text-3)', fontStyle: 'italic' }}>No menu items found.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {menuItems.map(item => (
                  <div key={item.id} className="card" style={{ padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ width: 60, height: 60, background: 'var(--surface-2)', borderRadius: 8, overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {item.imageUrl ? <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Utensils size={24} color="var(--text-3)" />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                        <h3 className="font-display" style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>{item.name}</h3>
                        <span style={{ fontWeight: 700, color: 'var(--text)' }}>${item.price}</span>
                      </div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-3)', marginBottom: '0.25rem' }}>{item.category}</div>
                      {item.description && <p style={{ fontSize: '0.8125rem', color: 'var(--text-2)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.description}</p>}
                    </div>
                    <button onClick={() => setEditingMenuItem(item)} className="btn-ghost" style={{ padding: '0.4rem 0.875rem', fontSize: '0.8125rem', border: '1px solid var(--border)' }}>
                      Edit
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <MenuItemForm 
            restaurants={restaurants} 
            selectedRestaurantId={selectedMenuRestaurant}
            onRestaurantChange={setSelectedMenuRestaurant}
            initialData={editingMenuItem}
            onCancel={() => setEditingMenuItem(null)}
            onSuccess={() => {
              setEditingMenuItem(null)
              // Refresh menu items
              setLoadingMenu(true)
              fetch(`/api/restaurants/${selectedMenuRestaurant}/menu`)
                .then(res => res.json())
                .then(data => {
                  if (data.success) setMenuItems(data.data)
                })
                .finally(() => setLoadingMenu(false))
            }} 
          />
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
                      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{PAYMENT_ICONS[m.type]}</span>
                      <div style={{ flex: 1 }}>
                        <span style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{m.type.replace('_', ' ')}</span>
                      </div>
                      <span className={`badge ${m.isActive ? 'badge-placed' : 'badge-cancelled'}`}>{m.isActive ? 'Active' : 'Disabled'}</span>
                      <div style={{ display: 'flex', gap: '0.375rem' }}>
                        <button
                          onClick={() => setEditingPaymentMethod(m)}
                          style={{ background: 'var(--surface-2)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 6, padding: '0.3rem 0.6rem', fontSize: '0.8125rem', fontWeight: 500, cursor: 'pointer' }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleTogglePayment(r.id, m.id, m.isActive)}
                          style={{ background: m.isActive ? '#FEE2E2' : '#D1FAE5', color: m.isActive ? '#991B1B' : '#065F46', border: 'none', borderRadius: 6, padding: '0.3rem 0.6rem', fontSize: '0.8125rem', fontWeight: 500, cursor: 'pointer' }}
                        >
                          {m.isActive ? 'Disable' : 'Enable'}
                        </button>
                        <button
                          onClick={() => handleDeletePayment(r.id, m.id)}
                          style={{ background: '#FEE2E2', color: '#991B1B', border: 'none', borderRadius: 6, padding: '0.3rem 0.6rem', fontSize: '0.8125rem', fontWeight: 500, cursor: 'pointer' }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <PaymentMethodForm 
            restaurants={restaurants} 
            initialData={editingPaymentMethod}
            onCancel={() => setEditingPaymentMethod(null)}
            onSuccess={(restId, pm, isEdit) => {
              setPayMethods(prev => {
                const list = prev[restId] || []
                if (isEdit) {
                  return { ...prev, [restId]: list.map(m => m.id === pm.id ? pm : m) }
                }
                return { ...prev, [restId]: [...list, pm] }
              })
              setEditingPaymentMethod(null)
            }} 
          />
        </div>
      )}
      {/* Add/Edit Restaurant Dialog */}
      {showRestForm && (
        <RestaurantForm 
          initialData={editingRestaurant}
          onSuccess={(restaurant, isEdit) => {
            if (isEdit) {
              setRestaurants(prev => prev.map(r => r.id === restaurant.id ? { ...r, ...restaurant } : r))
            } else {
              setRestaurants(prev => [restaurant, ...prev])
            }
            setShowRestForm(false)
          }}
          onCancel={() => setShowRestForm(false)}
        />
      )}
    </div>
  )
}
