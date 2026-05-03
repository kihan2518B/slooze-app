'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Restaurant } from '@/types'
import { useAuth } from '@/contexts/AuthContext'

const CUISINE_EMOJIS: Record<string, string> = {
  'North Indian': '🍛', 'Street Food': '🥘', 'American': '🍔', 'Fine Dining': '🍽️',
  'Italian': '🍝', 'Chinese': '🥡', 'Mexican': '🌮', 'Japanese': '🍜',
}

export default function RestaurantsPage() {
  const { user } = useAuth()
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/restaurants')
      .then(r => r.json())
      .then(d => { if (d.success) setRestaurants(d.data) })
      .finally(() => setLoading(false))
  }, [])

  const filtered = restaurants.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.cuisineType?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div>
        <div style={{ marginBottom: '2rem' }}>
          <div className="skeleton" style={{ height: 40, width: 280, marginBottom: '0.5rem' }} />
          <div className="skeleton" style={{ height: 20, width: 200 }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
          {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 240, borderRadius: 16 }} />)}
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="font-display" style={{ fontSize: '1.875rem', fontWeight: 700, margin: '0 0 0.25rem' }}>
            {user?.country === 'INDIA' ? '🇮🇳' : user?.country === 'AMERICA' ? '🇺🇸' : '🌍'} Restaurants
          </h1>
          <p style={{ color: 'var(--text-2)', margin: 0, fontSize: '0.9375rem' }}>
            {user?.role === 'ADMIN' ? 'All restaurants across countries' : `Showing restaurants in ${user?.country === 'INDIA' ? 'India' : 'America'}`}
          </p>
        </div>
        <input
          className="input-field"
          placeholder="Search restaurants..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: 240 }}
        />
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-2)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🍽️</div>
          <p style={{ fontSize: '1.0625rem' }}>{search ? 'No restaurants match your search' : 'No restaurants available'}</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
          {filtered.map((r, idx) => (
            <Link
              key={r.id}
              href={`/restaurants/${r.id}`}
              style={{ textDecoration: 'none' }}
            >
              <div
                className="animate-fade-in"
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 16,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  animationDelay: `${idx * 0.05}s`,
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget
                  el.style.transform = 'translateY(-3px)'
                  el.style.boxShadow = '0 12px 32px rgba(0,0,0,0.08)'
                  el.style.borderColor = 'var(--brand)'
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget
                  el.style.transform = ''
                  el.style.boxShadow = ''
                  el.style.borderColor = 'var(--border)'
                }}
              >
                {/* Image */}
                <div style={{ height: 160, background: 'var(--surface-2)', position: 'relative', overflow: 'hidden' }}>
                  {r.imageUrl ? (
                    <img src={r.imageUrl} alt={r.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3.5rem' }}>
                      {CUISINE_EMOJIS[r.cuisineType || ''] || '🍽️'}
                    </div>
                  )}
                  <div style={{ position: 'absolute', top: 12, right: 12 }}>
                    <span className={`badge ${r.country === 'INDIA' ? 'badge-india' : 'badge-america'}`}>
                      {r.country === 'INDIA' ? '🇮🇳 India' : '🇺🇸 America'}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <h3 className="font-display" style={{ fontSize: '1.0625rem', fontWeight: 700, margin: 0, color: 'var(--text)' }}>{r.name}</h3>
                    {r.cuisineType && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-3)', flexShrink: 0 }}>{r.cuisineType}</span>
                    )}
                  </div>
                  {r.description && (
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-2)', margin: '0 0 0.75rem', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {r.description}
                    </p>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.8125rem', color: 'var(--text-3)' }}>
                    {r.address && <span>📍 {r.address}</span>}
                    {r._count && <span>🍴 {r._count.menuItems} items</span>}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
