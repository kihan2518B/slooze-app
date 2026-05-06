'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Restaurant, MenuItem } from '@/types'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import { MapPin, Utensils, UtensilsCrossed } from 'lucide-react'

type GroupedMenu = Record<string, MenuItem[]>

function formatPrice(price: number, country: string) {
  if (country === 'INDIA') return `₹${price.toLocaleString('en-IN')}`
  return `$${(price / 100).toFixed(2)}`  // cents for US
}

// Actually for simplicity, both are just numbers formatted nicely
function fmt(price: number, country: string) {
  return country === 'INDIA' ? `₹${price}` : `$${price}`
}

export default function RestaurantDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const { addItem } = useCart()
  const router = useRouter()

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [menu, setMenu] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState<string | null>(null)
  const [toast, setToast] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')

  useEffect(() => {
    Promise.all([
      fetch(`/api/restaurants/${id}`).then(r => r.json()),
      fetch(`/api/restaurants/${id}/menu`).then(r => r.json()),
    ]).then(([rData, mData]) => {
      if (rData.success) setRestaurant(rData.data)
      if (mData.success) setMenu(mData.data)
    }).finally(() => setLoading(false))
  }, [id])

  const grouped: GroupedMenu = menu.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = []
    acc[item.category].push(item)
    return acc
  }, {} as GroupedMenu)

  const categories = ['All', ...Object.keys(grouped)]
  const displayMenu = activeCategory === 'All' ? grouped : { [activeCategory]: grouped[activeCategory] || [] }

  const handleAdd = async (menuItemId: string) => {
    setAdding(menuItemId)
    try {
      await addItem(menuItemId)
      setToast('Added to cart!')
      setTimeout(() => setToast(''), 2000)
    } catch (err) {
      setToast(err instanceof Error ? err.message : 'Failed to add')
      setTimeout(() => setToast(''), 3000)
    } finally {
      setAdding(null)
    }
  }

  if (loading) {
    return (
      <div>
        <div className="skeleton" style={{ height: 240, borderRadius: 16, marginBottom: '1.5rem' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
          {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton" style={{ height: 160, borderRadius: 12 }} />)}
        </div>
      </div>
    )
  }

  if (!restaurant) return (
    <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-2)' }}>Restaurant not found</div>
  )

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: 80, right: 24, background: 'var(--text)', color: 'var(--surface)', padding: '0.75rem 1.25rem', borderRadius: 10, fontSize: '0.9rem', fontWeight: 500, zIndex: 100, animation: 'fadeIn 0.2s ease-out' }}>
          {toast}
        </div>
      )}

      {/* Back */}
      <button onClick={() => router.back()} className="btn-ghost" style={{ marginBottom: '1.25rem', fontSize: '0.875rem' }}>
        ← Back
      </button>

      {/* Hero */}
      <div style={{ borderRadius: 16, overflow: 'hidden', marginBottom: '1.75rem', background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
        {restaurant.imageUrl ? (
          <img src={restaurant.imageUrl} alt={restaurant.name} style={{ width: '100%', height: 220, objectFit: 'cover' }} />
        ) : (
          <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--border)' }}><Utensils size={64} /></div>
        )}
        <div style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h1 className="font-display" style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0 0 0.375rem' }}>{restaurant.name}</h1>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <span className={`badge ${restaurant.country === 'INDIA' ? 'badge-india' : 'badge-america'}`} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <MapPin size={12} /> {restaurant.country === 'INDIA' ? 'India' : 'America'}
                </span>
                {restaurant.cuisineType && <span style={{ fontSize: '0.875rem', color: 'var(--text-2)' }}>{restaurant.cuisineType}</span>}
                {restaurant.address && <span style={{ fontSize: '0.875rem', color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><MapPin size={14} /> {restaurant.address}</span>}
              </div>
            </div>
            <button onClick={() => router.push('/cart')} className="btn-primary">View Cart →</button>
          </div>
          {restaurant.description && (
            <p style={{ marginTop: '0.75rem', color: 'var(--text-2)', fontSize: '0.9375rem', lineHeight: 1.6, margin: '0.75rem 0 0' }}>{restaurant.description}</p>
          )}
        </div>
      </div>

      {/* Category tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: 4 }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              padding: '0.4rem 1rem',
              borderRadius: 99,
              border: `1px solid ${activeCategory === cat ? 'var(--brand)' : 'var(--border)'}`,
              background: activeCategory === cat ? 'var(--brand-light)' : 'transparent',
              color: activeCategory === cat ? 'var(--brand)' : 'var(--text-2)',
              fontWeight: 500,
              fontSize: '0.875rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Menu */}
      {Object.entries(displayMenu).map(([category, items]) => (
        <div key={category} style={{ marginBottom: '2rem' }}>
          <h2 className="font-display" style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-2)', marginBottom: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ height: 2, width: 20, background: 'var(--brand)', display: 'inline-block', borderRadius: 1 }} />
            {category}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
            {items.map(item => (
              <div
                key={item.id}
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
              >
                {item.imageUrl && (
                  <img src={item.imageUrl} alt={item.name} style={{ height: 130, objectFit: 'cover', width: '100%' }} />
                )}
                <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, margin: '0 0 0.25rem', color: 'var(--text)' }}>{item.name}</h3>
                  {item.description && (
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-3)', margin: '0 0 0.75rem', lineHeight: 1.5, flex: 1 }}>{item.description}</p>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                    <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text)', fontFamily: 'Syne, sans-serif' }}>
                      {fmt(item.price, restaurant.country)}
                    </span>
                    <button
                      onClick={() => handleAdd(item.id)}
                      disabled={adding === item.id}
                      style={{
                        background: adding === item.id ? 'var(--surface-2)' : 'var(--brand)',
                        color: adding === item.id ? 'var(--text-3)' : 'white',
                        border: 'none',
                        borderRadius: 8,
                        padding: '0.4rem 0.875rem',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        cursor: adding === item.id ? 'wait' : 'pointer',
                        transition: 'all 0.15s',
                      }}
                    >
                      {adding === item.id ? '...' : '+ Add'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
