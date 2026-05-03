'use client'
import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { CartItem } from '@/types'
import { useAuth } from './AuthContext'

interface CartContextType {
  items: CartItem[]
  loading: boolean
  addItem: (menuItemId: string, quantity?: number) => Promise<void>
  removeItem: (cartItemId: string) => Promise<void>
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  total: number
  count: number
  refresh: () => Promise<void>
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(async () => {
    if (!user) { setItems([]); return }
    setLoading(true)
    try {
      const res = await fetch('/api/cart')
      if (res.ok) {
        const data = await res.json()
        setItems(data.data)
      }
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => { refresh() }, [refresh])

  const addItem = async (menuItemId: string, quantity = 1) => {
    const res = await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ menuItemId, quantity }),
    })
    const data = await res.json()
    if (!data.success) throw new Error(data.error || 'Failed to add item')
    await refresh()
  }

  const removeItem = async (cartItemId: string) => {
    await fetch(`/api/cart?id=${cartItemId}`, { method: 'DELETE' })
    setItems(prev => prev.filter(i => i.id !== cartItemId))
  }

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    await fetch('/api/cart', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cartItemId, quantity }),
    })
    if (quantity === 0) {
      setItems(prev => prev.filter(i => i.id !== cartItemId))
    } else {
      setItems(prev => prev.map(i => i.id === cartItemId ? { ...i, quantity } : i))
    }
  }

  const clearCart = async () => {
    await fetch('/api/cart?all=true', { method: 'DELETE' })
    setItems([])
  }

  const total = items.reduce((sum, i) => sum + i.menuItem.price * i.quantity, 0)
  const count = items.reduce((sum, i) => sum + i.quantity, 0)

  return <CartContext.Provider value={{ items, loading, addItem, removeItem, updateQuantity, clearCart, total, count, refresh }}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
