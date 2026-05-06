'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Restaurant } from '@/types'
import { useAuth } from '@/contexts/AuthContext'
import { MapPin, Utensils } from 'lucide-react'
import RestaurantCard from '@/components/RestaurantCard'

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
            <MapPin size={24} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 8 }} />
            {user?.country === 'INDIA' ? 'India' : user?.country === 'AMERICA' ? 'America' : 'All'} Restaurants
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
          <div style={{ color: 'var(--border)', display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}><Utensils size={48} /></div>
          <p style={{ fontSize: '1.0625rem' }}>{search ? 'No restaurants match your search' : 'No restaurants available'}</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
          {filtered.map((r, idx) => (
            <RestaurantCard key={r.id} restaurant={r} idx={idx} />
          ))}
        </div>
      )}
    </div>
  )
}
