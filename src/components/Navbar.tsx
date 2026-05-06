'use client'
import Link from 'next/link'
import { MapPin, ShoppingCart, User, LogOut } from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/contexts/CartContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { count } = useCart()
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  if (!user) return null

  const navLinks = [
    { href: '/restaurants', label: 'Restaurants' },
    { href: '/orders', label: 'Orders' },
    ...(user.role === 'ADMIN' ? [{ href: '/admin', label: 'Admin' }] : []),
  ]

  const roleBadge = { ADMIN: 'badge-admin', MANAGER: 'badge-manager', MEMBER: 'badge-member' }[user.role]
  const countryLabel = user.country === 'INDIA' ? 'India' : 'America'

  return (
    <header style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(8px)' }}>
      <nav style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1.5rem', height: 64, display: 'flex', alignItems: 'center', gap: '2rem' }}>
        {/* Logo */}
        <Link href="/restaurants" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
          <div style={{ width: 34, height: 34, background: 'var(--brand)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 11l19-9-9 19-2-8-8-2z"/>
            </svg>
          </div>
          <span className="font-display" style={{ fontWeight: 700, fontSize: '1.125rem', color: 'var(--text)' }}>Slooze</span>
        </Link>

        {/* Nav links */}
        <div style={{ display: 'flex', gap: '0.25rem', flex: 1 }}>
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                padding: '0.4rem 0.875rem',
                borderRadius: 8,
                fontSize: '0.9375rem',
                fontWeight: 500,
                textDecoration: 'none',
                color: pathname.startsWith(link.href) ? 'var(--brand)' : 'var(--text-2)',
                background: pathname.startsWith(link.href) ? 'var(--brand-light)' : 'transparent',
                transition: 'all 0.15s',
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
          {/* Country */}
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8125rem', color: 'var(--text-3)' }}>
            <MapPin size={14} /> {countryLabel}
          </span>

          {/* Cart */}
          <Link href="/cart" style={{ textDecoration: 'none', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, borderRadius: 10, background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-2)', transition: 'all 0.15s' }}>
            <ShoppingCart size={18} />
            {count > 0 && (
              <span style={{ position: 'absolute', top: -4, right: -4, background: 'var(--brand)', color: 'white', borderRadius: 99, width: 18, height: 18, fontSize: '0.6875rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {count}
              </span>
            )}
          </Link>

          {/* User */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--brand-light)', border: '1px solid var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', fontWeight: 600, color: 'var(--brand)' }}>
              <User size={18} />
            </div>
            <div style={{ lineHeight: 1.2 }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text)' }}>{user.name.split(' ')[0]}</div>
              <div className={`badge ${roleBadge}`} style={{ marginTop: 2 }}>{user.role}</div>
            </div>
          </div>

          <button onClick={handleLogout} className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.4rem 0.75rem', fontSize: '0.875rem' }}>
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </nav>
    </header>
  )
}
