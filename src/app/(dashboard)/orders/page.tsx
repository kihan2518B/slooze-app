'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Order } from '@/types'
import { CreditCard, QrCode, Zap, Landmark, Wallet, Utensils, ClipboardList, CheckCircle } from 'lucide-react'

function fmt(price: number, country: string) {
  return country === 'INDIA' ? `₹${price}` : `$${price}`
}

const STATUS_STYLES: Record<string, string> = {
  PLACED: 'badge-placed', PENDING: 'badge-pending',
  CANCELLED: 'badge-cancelled', DELIVERED: 'badge-placed',
}

const PAYMENT_ICONS: Record<string, React.ReactNode> = {
  CARD: <CreditCard size={20} />, 
  QR: <QrCode size={20} />, 
  UPI: <Zap size={20} />, 
  BANK_TRANSFER: <Landmark size={20} />, 
  WALLET: <Wallet size={20} />
}

export default function OrdersPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState<string | null>(null)
  const [confirming, setConfirming] = useState<string | null>(null)
  const [filter, setFilter] = useState('ALL')
  const [expanded, setExpanded] = useState<string | null>(null)

  const canCancel = user?.role === 'ADMIN' || user?.role === 'MANAGER'

  const fetchOrders = () => {
    fetch('/api/orders')
      .then(r => r.json())
      .then(d => { if (d.success) setOrders(d.data) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchOrders() }, [])

  const handleCancel = async (orderId: string) => {
    if (!confirm('Cancel this order?')) return
    setCancelling(orderId)
    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'CANCELLED', paymentStatus: 'REFUNDED' } : o))
      }
    } finally {
      setCancelling(null)
    }
  }

  const handleConfirm = async (orderId: string) => {
    if (!confirm('Confirm and place this order?')) return
    setConfirming(orderId)
    try {
      const res = await fetch(`/api/orders/${orderId}`, { 
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'PLACED' })
      })
      const data = await res.json()
      if (data.success) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'PLACED' } : o))
      }
    } finally {
      setConfirming(null)
    }
  }

  const filtered = filter === 'ALL' ? orders : orders.filter(o => o.status === filter)

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div className="skeleton" style={{ height: 40, width: 240, marginBottom: '0.5rem' }} />
      {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 12 }} />)}
    </div>
  )

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="font-display" style={{ fontSize: '1.875rem', fontWeight: 700, margin: '0 0 0.25rem' }}>Orders</h1>
          <p style={{ color: 'var(--text-2)', margin: 0 }}>
            {user?.role === 'MEMBER' ? 'Your order history' : 'All orders in your region'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.375rem' }}>
          {['ALL', 'PLACED', 'PENDING', 'CANCELLED', 'DELIVERED'].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              style={{
                padding: '0.35rem 0.875rem',
                borderRadius: 99,
                border: `1px solid ${filter === s ? 'var(--brand)' : 'var(--border)'}`,
                background: filter === s ? 'var(--brand-light)' : 'transparent',
                color: filter === s ? 'var(--brand)' : 'var(--text-2)',
                fontSize: '0.8125rem',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-2)' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', color: 'var(--border)' }}><ClipboardList size={48} /></div>
          <p style={{ fontSize: '1.0625rem' }}>No orders found</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {filtered.map(order => (
            <div
              key={order.id}
              className="card animate-fade-in"
              style={{ padding: '1.25rem', cursor: 'pointer', transition: 'border-color 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--text-3)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
            >
              <div
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}
                onClick={() => setExpanded(expanded === order.id ? null : order.id)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--surface-2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)', flexShrink: 0 }}>
                    {order.paymentMethod ? PAYMENT_ICONS[order.paymentMethod.type] : <Utensils size={20} />}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text)', marginBottom: '0.2rem' }}>
                      {order.restaurant.name}
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-3)' }}>
                      {order.items.length} item{order.items.length !== 1 ? 's' : ''} · {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {user?.role !== 'MEMBER' && order.user && (
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-3)' }}>by {order.user.name}</span>
                  )}
                  {order.confirmedBy && (
                    <span style={{ fontSize: '0.8125rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><CheckCircle size={14} /> Confirmed by {order.confirmedBy.name}</span>
                  )}
                  <span className={`badge ${STATUS_STYLES[order.status] || 'badge-pending'}`}>{order.status}</span>
                  <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text)', fontFamily: 'Syne, sans-serif' }}>
                    {fmt(order.totalAmount, order.country)}
                  </span>
                  <span style={{ color: 'var(--text-3)', fontSize: '0.875rem', transition: 'transform 0.2s', display: 'inline-block', transform: expanded === order.id ? 'rotate(180deg)' : 'none' }}>▾</span>
                </div>
              </div>

              {expanded === order.id && (
                <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)', animation: 'fadeIn 0.2s ease-out' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div>
                      <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-2)', marginBottom: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Items ordered</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {order.items.map(item => (
                          <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                            <span style={{ color: 'var(--text)' }}>{item.menuItem.name} × {item.quantity}</span>
                            <span style={{ color: 'var(--text-2)', fontWeight: 500 }}>{fmt(item.price * item.quantity, order.country)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-2)', marginBottom: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Payment</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', fontSize: '0.875rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <span style={{ color: 'var(--text-3)' }}>Method:</span>
                          <span style={{ color: 'var(--text)' }}>{order.paymentMethod?.type.replace('_', ' ') || 'N/A'}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <span style={{ color: 'var(--text-3)' }}>Status:</span>
                          <span style={{ color: order.paymentStatus === 'COMPLETED' ? 'var(--success)' : order.paymentStatus === 'REFUNDED' ? 'var(--warning)' : 'var(--text)' }}>
                            {order.paymentStatus}
                          </span>
                        </div>
                        {order.paymentRef && (
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <span style={{ color: 'var(--text-3)' }}>Ref:</span>
                            <code style={{ fontSize: '0.8125rem', color: 'var(--text-2)', background: 'var(--surface-2)', padding: '1px 6px', borderRadius: 4 }}>{order.paymentRef}</code>
                          </div>
                        )}
                        {order.notes && (
                          <div style={{ marginTop: '0.5rem', padding: '0.625rem', background: 'var(--surface-2)', borderRadius: 8, fontSize: '0.8125rem', color: 'var(--text-2)', fontStyle: 'italic' }}>
                            "{order.notes}"
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {(canCancel && order.status !== 'CANCELLED' && order.status !== 'DELIVERED') && (
                    <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                      <button
                        onClick={() => handleCancel(order.id)}
                        disabled={cancelling === order.id || confirming === order.id}
                        style={{ background: '#FEE2E2', color: '#991B1B', border: '1px solid #FCA5A5', borderRadius: 8, padding: '0.4rem 1rem', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.375rem' }}
                      >
                        {cancelling === order.id ? <><span className="spinner" style={{ width: 14, height: 14, borderColor: '#FCA5A5', borderTopColor: '#991B1B' }} /> Cancelling...</> : '✕ Cancel Order'}
                      </button>
                      
                      {order.status === 'PENDING' && (
                        <button
                          onClick={() => handleConfirm(order.id)}
                          disabled={cancelling === order.id || confirming === order.id}
                          style={{ background: '#D1FAE5', color: '#065F46', border: '1px solid #6EE7B7', borderRadius: 8, padding: '0.4rem 1rem', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.375rem' }}
                        >
                          {confirming === order.id ? <><span className="spinner" style={{ width: 14, height: 14, borderColor: '#6EE7B7', borderTopColor: '#065F46' }} /> Confirming...</> : <><CheckCircle size={16} /> Confirm Order</>}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
