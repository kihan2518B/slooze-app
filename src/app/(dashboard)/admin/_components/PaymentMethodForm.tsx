'use client'
import { useState } from 'react'
import { Restaurant } from '@/types'

const PRESET_DETAILS: Record<string, string> = {
  CARD: JSON.stringify({ label: 'Credit/Debit Card', acceptedNetworks: ['VISA', 'MASTERCARD'], currency: 'INR' }, null, 2),
  QR: JSON.stringify({ label: 'QR Payment', qrImageUrl: null, currency: 'INR' }, null, 2),
  UPI: JSON.stringify({ upiId: 'restaurant@upi', currency: 'INR' }, null, 2),
  BANK_TRANSFER: JSON.stringify({ accountNumber: '1234567890', ifsc: 'BANK0001234', bankName: 'State Bank', currency: 'INR' }, null, 2),
  WALLET: JSON.stringify({ label: 'Digital Wallets', providers: ['GOOGLE_PAY', 'APPLE_PAY'], currency: 'INR' }, null, 2),
}

interface PaymentMethodFormProps {
  restaurants: Restaurant[]
  onSuccess: (restaurantId: string, paymentMethod: any) => void
}

export default function PaymentMethodForm({ restaurants, onSuccess }: PaymentMethodFormProps) {
  const [selectedRestaurant, setSelectedRestaurant] = useState(restaurants[0]?.id || '')
  const [newMethod, setNewMethod] = useState({ type: 'CARD', details: PRESET_DETAILS['CARD'] })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [saving, setSaving] = useState(false)

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRestaurant) return
    setError(''); setSuccess(''); setSaving(true)
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
      
      onSuccess(selectedRestaurant, data.data)
      setSuccess('Payment method added!')
      setNewMethod({ type: 'CARD', details: PRESET_DETAILS['CARD'] })
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="card" style={{ position: 'sticky', top: 80 }}>
      <h2 className="font-display" style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.25rem' }}>Add Payment Method</h2>
      {success && <div style={{ background: '#D1FAE5', border: '1px solid #6EE7B7', borderRadius: 8, padding: '0.625rem', marginBottom: '1rem', color: '#065F46', fontSize: '0.875rem' }}>{success}</div>}
      {error && <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: 8, padding: '0.625rem', marginBottom: '1rem', color: '#991B1B', fontSize: '0.875rem' }}>{error}</div>}
      
      <form onSubmit={handleAddPayment} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--text-2)', marginBottom: '0.3rem', fontWeight: 500 }}>Restaurant</label>
          <select className="input-field" value={selectedRestaurant} onChange={e => setSelectedRestaurant(e.target.value)} required>
            <option value="">— Select Restaurant —</option>
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
        <button type="submit" className="btn-primary" disabled={saving || !selectedRestaurant} style={{ width: '100%', justifyContent: 'center' }}>
          {saving ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Adding...</> : '+ Add Method'}
        </button>
      </form>
    </div>
  )
}
