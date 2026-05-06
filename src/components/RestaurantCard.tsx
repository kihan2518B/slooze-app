'use client'
import Link from 'next/link'
import { Restaurant } from '@/types'
import { MapPin, Utensils, UtensilsCrossed } from 'lucide-react'

interface RestaurantCardProps {
  restaurant: Restaurant
  idx?: number
  isEditable?: boolean
  onEdit?: (restaurant: Restaurant) => void
}

export default function RestaurantCard({ restaurant: r, idx = 0, isEditable, onEdit }: RestaurantCardProps) {
  const cardContent = (
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
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
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
      <div style={{ height: 160, background: 'var(--surface-2)', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
        {r.imageUrl ? (
          <img src={r.imageUrl} alt={r.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--border)' }}>
            <Utensils size={48} />
          </div>
        )}
        <div style={{ position: 'absolute', top: 12, right: 12 }}>
          <span className={`badge ${r.country === 'INDIA' ? 'badge-india' : 'badge-america'}`} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <MapPin size={12} /> {r.country === 'INDIA' ? 'India' : 'America'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.8125rem', color: 'var(--text-3)', marginTop: 'auto' }}>
          {r.address && <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><MapPin size={14} /> {r.address}</span>}
          {r._count && <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><UtensilsCrossed size={14} /> {r._count.menuItems} items</span>}
        </div>
        
        {isEditable && onEdit && (
          <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }} onClick={e => e.preventDefault()}>
            <button 
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit(r) }} 
              className="btn-ghost" 
              style={{ width: '100%', padding: '0.4rem', fontSize: '0.875rem' }}
            >
              Edit Restaurant
            </button>
          </div>
        )}
      </div>
    </div>
  )

  if (isEditable) {
    return <div>{cardContent}</div>
  }

  return (
    <Link href={`/restaurants/${r.id}`} style={{ textDecoration: 'none' }}>
      {cardContent}
    </Link>
  )
}
