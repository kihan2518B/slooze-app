'use client'
import { useState, useEffect } from 'react'
import { Restaurant, MenuItem } from '@/types'

interface MenuItemFormProps {
  restaurants: Restaurant[]
  initialData?: MenuItem | null
  onSuccess?: () => void
  onCancel?: () => void
  selectedRestaurantId?: string
  onRestaurantChange?: (id: string) => void
}

export default function MenuItemForm({ restaurants, initialData, onSuccess, onCancel, selectedRestaurantId, onRestaurantChange }: MenuItemFormProps) {
  const isEdit = !!initialData
  const [selectedRestaurant, setSelectedRestaurant] = useState(selectedRestaurantId || restaurants[0]?.id || '')
  const [form, setForm] = useState({ 
    name: initialData?.name || '', 
    description: initialData?.description || '', 
    price: initialData?.price?.toString() || '', 
    category: initialData?.category || '' 
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [saving, setSaving] = useState(false)

  // Sync form when initialData changes
  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name,
        description: initialData.description || '',
        price: initialData.price.toString(),
        category: initialData.category,
      })
      setSelectedRestaurant(initialData.restaurantId)
      if (onRestaurantChange) onRestaurantChange(initialData.restaurantId)
    } else {
      setForm({ name: '', description: '', price: '', category: '' })
    }
  }, [initialData, onRestaurantChange])

  // Sync selectedRestaurant with prop
  useEffect(() => {
    if (selectedRestaurantId !== undefined && selectedRestaurantId !== selectedRestaurant) {
      setSelectedRestaurant(selectedRestaurantId)
    }
  }, [selectedRestaurantId])

  const handleRestaurantChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value
    setSelectedRestaurant(val)
    if (onRestaurantChange) onRestaurantChange(val)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRestaurant) return
    setError(''); setSuccess(''); setSaving(true)
    
    try {
      const formData = new FormData()
      Object.entries(form).forEach(([k, v]) => formData.append(k, v))
      if (imageFile) formData.append('image', imageFile)

      const url = `/api/restaurants/${selectedRestaurant}/menu`
      const method = isEdit ? 'PUT' : 'POST'
      if (isEdit) {
        formData.append('id', initialData!.id)
      }

      const res = await fetch(url, {
        method,
        body: formData,
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      
      if (onSuccess) onSuccess()
      setSuccess(`Menu item "${data.data.name}" ${isEdit ? 'updated' : 'added'} successfully!`)
      if (!isEdit) {
        setForm({ name: '', description: '', price: '', category: '' })
        setImageFile(null)
      }
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${isEdit ? 'update' : 'add'} menu item`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="card" style={{ position: 'sticky', top: 80 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h2 className="font-display" style={{ fontSize: '1.125rem', fontWeight: 600, margin: 0 }}>
          {isEdit ? 'Edit Menu Item' : 'Add Menu Item'}
        </h2>
        {isEdit && onCancel && (
          <button type="button" onClick={onCancel} className="btn-ghost" style={{ padding: '0.25rem 0.5rem', border: 'none' }}>✕</button>
        )}
      </div>

      {success && <div style={{ background: '#D1FAE5', border: '1px solid #6EE7B7', borderRadius: 8, padding: '0.625rem', marginBottom: '1rem', color: '#065F46', fontSize: '0.875rem' }}>{success}</div>}
      {error && <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: 8, padding: '0.625rem', marginBottom: '1rem', color: '#991B1B', fontSize: '0.875rem' }}>{error}</div>}
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--text-2)', marginBottom: '0.3rem', fontWeight: 500 }}>Restaurant</label>
          <select className="input-field" value={selectedRestaurant} onChange={handleRestaurantChange} required disabled={isEdit}>
            <option value="">— Select Restaurant —</option>
            {restaurants.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--text-2)', marginBottom: '0.3rem', fontWeight: 500 }}>Name</label>
          <input className="input-field" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required placeholder="Item name (e.g. Margherita Pizza)" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--text-2)', marginBottom: '0.3rem', fontWeight: 500 }}>Price</label>
            <input type="number" step="0.01" className="input-field" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} required placeholder="0.00" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--text-2)', marginBottom: '0.3rem', fontWeight: 500 }}>Category</label>
            <input className="input-field" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} required placeholder="e.g. Main Course, Desserts" />
          </div>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--text-2)', marginBottom: '0.3rem', fontWeight: 500 }}>Description</label>
          <textarea className="input-field" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2} placeholder="Optional description..." />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--text-2)', marginBottom: '0.3rem', fontWeight: 500 }}>Image {isEdit && <span style={{fontWeight: 400}}>(leave empty to keep current)</span>}</label>
          <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)} style={{ fontSize: '0.875rem' }} />
        </div>
        
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
          {isEdit && onCancel && (
            <button type="button" onClick={onCancel} className="btn-ghost" style={{ flex: 1 }}>Cancel</button>
          )}
          <button type="submit" className="btn-primary" disabled={saving || !selectedRestaurant} style={{ flex: 1, justifyContent: 'center' }}>
            {saving ? <><span className="spinner" style={{ width: 16, height: 16 }} /> {isEdit ? 'Updating...' : 'Adding...'}</> : (isEdit ? 'Update Item' : '+ Add Menu Item')}
          </button>
        </div>
      </form>
    </div>
  )
}
