'use client'
import { useState } from 'react'
import { Restaurant } from '@/types'
import { COUNTRIES } from '@/data'

interface RestaurantFormProps {
  initialData?: Restaurant
  onSuccess: (restaurant: Restaurant, isEdit: boolean) => void
  onCancel: () => void
}

export default function RestaurantForm({ initialData, onSuccess, onCancel }: RestaurantFormProps) {
  const isEdit = !!initialData
  const [form, setForm] = useState({
    name: initialData?.name || '',
    country: initialData?.country || 'INDIA',
    description: initialData?.description || '',
    cuisineType: initialData?.cuisineType || '',
    address: initialData?.address || ''
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const formData = new FormData()
      Object.entries(form).forEach(([k, v]) => formData.append(k, v))
      if (imageFile) formData.append('image', imageFile)

      const url = isEdit ? `/api/restaurants/${initialData.id}` : '/api/restaurants'
      const method = isEdit ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        body: formData,
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      
      onSuccess(data.data, isEdit)
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${isEdit ? 'update' : 'create'} restaurant`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
      <div className="card" style={{ width: '100%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 className="font-display" style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>
            {isEdit ? 'Edit Restaurant' : 'Add Restaurant'}
          </h2>
          <button onClick={onCancel} className="btn-ghost" style={{ padding: '0.25rem 0.5rem', border: 'none' }}>✕</button>
        </div>
        
        {error && <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: 8, padding: '0.625rem', marginBottom: '1rem', color: '#991B1B', fontSize: '0.875rem' }}>{error}</div>}
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--text-2)', marginBottom: '0.3rem', fontWeight: 500 }}>Name</label>
            <input className="input-field" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required placeholder="Restaurant Name" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--text-2)', marginBottom: '0.3rem', fontWeight: 500 }}>Country</label>
            <select className="input-field" value={form.country} onChange={e => setForm(p => ({ ...p, country: e.target.value as any }))}>
              {COUNTRIES.map(c => <option key={c.value} value={c.value}>{c.icon} {c.label}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--text-2)', marginBottom: '0.3rem', fontWeight: 500 }}>Description</label>
            <textarea className="input-field" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2} placeholder="Brief description" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--text-2)', marginBottom: '0.3rem', fontWeight: 500 }}>Cuisine Type</label>
            <input className="input-field" value={form.cuisineType} onChange={e => setForm(p => ({ ...p, cuisineType: e.target.value }))} placeholder="e.g. Italian, Indian, Fast Food" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--text-2)', marginBottom: '0.3rem', fontWeight: 500 }}>Address</label>
            <input className="input-field" value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} placeholder="Full physical address" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--text-2)', marginBottom: '0.3rem', fontWeight: 500 }}>Image {isEdit && <span style={{fontWeight: 400}}>(leave empty to keep current)</span>}</label>
            <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)} style={{ fontSize: '0.875rem' }} />
          </div>
          <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.75rem' }}>
            <button type="button" onClick={onCancel} className="btn-ghost" style={{ flex: 1 }}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving} style={{ flex: 1, justifyContent: 'center' }}>
              {saving ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Saving...</> : (isEdit ? 'Update' : 'Save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
