'use client'
import { Restaurant } from '@/types'
import RestaurantCard from '@/components/RestaurantCard'

interface RestaurantListProps {
  restaurants: Restaurant[]
  onEdit: (restaurant: Restaurant) => void
}

export default function RestaurantList({ restaurants, onEdit }: RestaurantListProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
      {restaurants.map((r, idx) => (
        <RestaurantCard
          key={r.id}
          restaurant={r}
          idx={idx}
          isEditable={true}
          onEdit={onEdit}
        />
      ))}
    </div>
  )
}
