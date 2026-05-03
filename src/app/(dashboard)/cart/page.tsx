'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import { PaymentMethod } from '@/types'

function fmt(price: number, country: string) {
  return country === 'INDIA' ? `₹${price}` : `$${price}`
}

const PAYMENT_ICONS: Record<string, string> = {
  CARD: '💳', QR: '📱', UPI: '⚡', BANK_TRANSFER: '🏦', WALLET: '👛',
}

function PaymentGateway({ method, total, country, onSuccess }: { method: PaymentMethod, total: number, country: string, onSuccess: (ref: string) => void }) {
  const [step, setStep] = useState<'form' | 'processing' | 'done'>('form')
  const [cardNum, setCardNum] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')
  const [name, setName] = useState('')
  const [upiId, setUpiId] = useState('')

  const formatCard = (v: string) => v.replace(/\D/g,'').slice(0,16).replace(/(.{4})/g,'$1 ').trim()
  const formatExpiry = (v: string) => { const d = v.replace(/\D/g,'').slice(0,4); return d.length > 2 ? d.slice(0,2)+'/'+d.slice(2) : d }

  const handlePay = () => {
    setStep('processing')
    setTimeout(() => {
      const ref = `PAY-${Date.now()}-${Math.random().toString(36).slice(2,8).toUpperCase()}`
      setStep('done')
      setTimeout(() => onSuccess(ref), 1200)
    }, 2000)
  }

  if (step === 'processing') return (
    <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
      <div className="spinner" style={{ margin: '0 auto 1rem', width: 36, height: 36, borderWidth: 3 }} />
      <p style={{ color: 'var(--text-2)', fontWeight: 500 }}>Processing payment...</p>
      <p style={{ color: 'var(--text-3)', fontSize: '0.875rem', marginTop: '0.25rem' }}>Please don&apos;t close this window</p>
    </div>
  )

  if (step === 'done') return (
    <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
      <div style={{ width: 56, height: 56, background: '#D1FAE5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontSize: '1.75rem' }}>✓</div>
      <p style={{ color: 'var(--success)', fontWeight: 600, fontSize: '1.125rem' }}>Payment successful!</p>
    </div>
  )

  const details = method.details as Record<string, unknown>

  return (
    <div>
      <div style={{ background: 'var(--brand)', color: 'white', borderRadius: '12px 12px 0 0', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p style={{ margin: 0, opacity: 0.8, fontSize: '0.8125rem' }}>Total payable</p>
          <p style={{ margin: 0, fontWeight: 700, fontSize: '1.375rem', fontFamily: 'Syne, sans-serif' }}>{fmt(total, country)}</p>
        </div>
        <span style={{ fontSize: '2rem' }}>{PAYMENT_ICONS[method.type]}</span>
      </div>
      <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {method.type === 'CARD' && (
          <>
            <p style={{ margin: '0 0 0.5rem', fontSize: '0.8125rem', color: 'var(--text-2)', fontWeight: 500 }}>Accepted: {(details.acceptedNetworks as string[])?.join(' · ')}</p>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--text-2)', marginBottom: '0.3rem' }}>Card number</label>
              <input className="input-field" placeholder="1234 5678 9012 3456" value={cardNum} onChange={e => setCardNum(formatCard(e.target.value))} maxLength={19} style={{ fontFamily: 'monospace', letterSpacing: 2 }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--text-2)', marginBottom: '0.3rem' }}>Expiry</label>
                <input className="input-field" placeholder="MM/YY" value={expiry} onChange={e => setExpiry(formatExpiry(e.target.value))} maxLength={5} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--text-2)', marginBottom: '0.3rem' }}>CVV</label>
                <input className="input-field" placeholder="•••" type="password" value={cvv} onChange={e => setCvv(e.target.value.slice(0,4))} maxLength={4} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--text-2)', marginBottom: '0.3rem' }}>Name</label>
                <input className="input-field" placeholder="On card" value={name} onChange={e => setName(e.target.value)} />
              </div>
            </div>
          </>
        )}
        {method.type === 'UPI' && (
          <>
            <div style={{ textAlign: 'center', padding: '1rem', background: 'var(--surface-2)', borderRadius: 10 }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>⚡</div>
              <p style={{ fontWeight: 600, color: 'var(--text)', margin: '0 0 0.25rem' }}>UPI ID</p>
              <code style={{ fontSize: '1rem', color: 'var(--brand)' }}>{details.upiId as string}</code>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--text-2)', marginBottom: '0.3rem' }}>Your UPI ID</label>
              <input className="input-field" placeholder="yourname@upi" value={upiId} onChange={e => setUpiId(e.target.value)} />
            </div>
          </>
        )}
        {method.type === 'QR' && (
          <div style={{ textAlign: 'center', padding: '1rem' }}>
            <div style={{ width: 160, height: 160, margin: '0 auto 1rem', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem' }}>📱</div>
            <p style={{ color: 'var(--text-2)', fontSize: '0.875rem' }}>Scan QR code to pay</p>
          </div>
        )}
        {method.type === 'WALLET' && (
          <div style={{ padding: '0.5rem' }}>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-2)', marginBottom: '1rem' }}>Available wallets:</p>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {((details.providers as string[]) || []).map(p => (
                <button key={p} style={{ padding: '0.5rem 1.25rem', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface-2)', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text)' }}>
                  {p === 'APPLE_PAY' ? '🍎 Apple Pay' : '🟢 Google Pay'}
                </button>
              ))}
            </div>
          </div>
        )}
        <button className="btn-primary" onClick={handlePay} style={{ width: '100%', justifyContent: 'center', marginTop: '0.25rem' }}>
          Pay {fmt(total, country)} →
        </button>
      </div>
    </div>
  )
}

export default function CartPage() {
  const { user } = useAuth()
  const { items, total, removeItem, updateQuantity, clearCart } = useCart()
  const router = useRouter()
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [selectedMethod, setSelectedMethod] = useState<string>('')
  const [showGateway, setShowGateway] = useState(false)
  const [placing, setPlacing] = useState(false)
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')

  const restaurantId = items[0]?.menuItem.restaurantId
  const country = items[0]?.menuItem.restaurant?.country || user?.country || 'INDIA'

  const canPlace = user?.role === 'ADMIN' || user?.role === 'MANAGER'

  useEffect(() => {
    if (restaurantId) {
      fetch(`/api/restaurants/${restaurantId}/payment-methods`)
        .then(r => r.json())
        .then(d => {
          if (d.success) {
            setPaymentMethods(d.data)
            if (d.data.length > 0) setSelectedMethod(d.data[0].id)
          }
        })
    }
  }, [restaurantId])

  const handlePaymentSuccess = async (ref: string) => {
    setPlacing(true)
    setError('')
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restaurantId, paymentMethodId: selectedMethod, notes }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      router.push('/orders')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Order failed')
    } finally {
      setPlacing(false)
      setShowGateway(false)
    }
  }

  const fmt2 = (price: number) => fmt(price, country)

  if (items.length === 0) return (
    <div style={{ textAlign: 'center', padding: '5rem 2rem', color: 'var(--text-2)' }}>
      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🛒</div>
      <h2 className="font-display" style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Your cart is empty</h2>
      <p style={{ marginBottom: '1.5rem' }}>Add some delicious food items!</p>
      <button onClick={() => router.push('/restaurants')} className="btn-primary">Browse Restaurants</button>
    </div>
  )

  const activeMethod = paymentMethods.find(m => m.id === selectedMethod)

  return (
    <div>
      <h1 className="font-display" style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '1.75rem' }}>Your Cart</h1>

      {/* Payment gateway overlay */}
      {showGateway && activeMethod && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: 'var(--surface)', borderRadius: 16, width: '100%', maxWidth: 440, overflow: 'hidden', animation: 'fadeIn 0.2s ease-out' }}>
            <PaymentGateway method={activeMethod} total={total} country={country} onSuccess={handlePaymentSuccess} />
            <div style={{ padding: '0 1.5rem 1.5rem' }}>
              <button onClick={() => setShowGateway(false)} className="btn-ghost" style={{ width: '100%', textAlign: 'center' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', alignItems: 'start' }}>
        {/* Cart items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {items.map(item => (
            <div key={item.id} className="card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {item.menuItem.imageUrl ? (
                <img src={item.menuItem.imageUrl} alt={item.menuItem.name} style={{ width: 64, height: 64, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
              ) : (
                <div style={{ width: 64, height: 64, borderRadius: 8, background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>🍴</div>
              )}
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '0.9375rem', marginBottom: '0.2rem' }}>{item.menuItem.name}</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-3)' }}>{item.menuItem.restaurant?.name}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button onClick={() => updateQuantity(item.id, item.quantity - 1)} style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid var(--border)', background: 'var(--surface-2)', cursor: 'pointer', fontWeight: 700, color: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                <span style={{ width: 24, textAlign: 'center', fontWeight: 600 }}>{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, item.quantity + 1)} style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid var(--border)', background: 'var(--surface-2)', cursor: 'pointer', fontWeight: 700, color: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.9375rem', minWidth: 64, textAlign: 'right' }}>{fmt2(item.menuItem.price * item.quantity)}</div>
              <button onClick={() => removeItem(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', fontSize: '1.1rem', padding: 4 }}>✕</button>
            </div>
          ))}

          <button onClick={() => clearCart()} className="btn-ghost" style={{ alignSelf: 'flex-start', fontSize: '0.875rem' }}>
            Clear cart
          </button>
        </div>

        {/* Order summary */}
        <div className="card" style={{ position: 'sticky', top: 80 }}>
          <h2 className="font-display" style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.25rem' }}>Order Summary</h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
            {items.map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--text-2)' }}>
                <span>{item.menuItem.name} × {item.quantity}</span>
                <span>{fmt2(item.menuItem.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.0625rem' }}>
              <span>Total</span>
              <span style={{ color: 'var(--brand)' }}>{fmt2(total)}</span>
            </div>
          </div>

          {!canPlace ? (
            <div style={{ background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: 8, padding: '0.875rem', fontSize: '0.8125rem', color: '#92400E' }}>
              ⚠️ Only Managers & Admins can checkout. Contact your manager to place this order.
            </div>
          ) : (
            <>
              {/* Notes */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--text-2)', marginBottom: '0.3rem', fontWeight: 500 }}>Notes (optional)</label>
                <textarea className="input-field" value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Any special requests..." style={{ resize: 'none' }} />
              </div>

              {/* Payment method selection */}
              {paymentMethods.length > 0 && (
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--text-2)', marginBottom: '0.5rem', fontWeight: 500 }}>Payment method</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {paymentMethods.map(m => (
                      <label key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.625rem', border: `1px solid ${selectedMethod === m.id ? 'var(--brand)' : 'var(--border)'}`, borderRadius: 8, cursor: 'pointer', background: selectedMethod === m.id ? 'var(--brand-light)' : 'transparent', transition: 'all 0.15s' }}>
                        <input type="radio" name="payment" value={m.id} checked={selectedMethod === m.id} onChange={() => setSelectedMethod(m.id)} style={{ accentColor: 'var(--brand)' }} />
                        <span style={{ fontSize: '1.1rem' }}>{PAYMENT_ICONS[m.type]}</span>
                        <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{m.type.replace('_', ' ')}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {error && (
                <div style={{ background: '#FEE2E2', borderRadius: 8, padding: '0.75rem', marginBottom: '0.75rem', fontSize: '0.8125rem', color: '#991B1B' }}>{error}</div>
              )}

              <button
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => setShowGateway(true)}
                disabled={placing || !selectedMethod}
              >
                {placing ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Processing...</> : 'Proceed to Pay →'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
