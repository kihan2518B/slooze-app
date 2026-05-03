'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Navbar from '@/components/Navbar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [user, loading, router])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface)' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 1rem', width: 32, height: 32 }} />
          <p style={{ color: 'var(--text-2)', fontSize: '0.9375rem' }}>Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface)' }}>
      <Navbar />
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1.5rem' }} className="page-enter">
        {children}
      </main>
    </div>
  )
}
