/**
 * (admin) layout — admin login and admin panel.
 * Admin guard runs ONCE here.
 */
'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isAdmin, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const isLoginPage = pathname === '/admin/login'

  useEffect(() => {
    if (loading) return

    if (!isLoginPage) {
      // Protected admin panel — must be logged in AND be an admin
      if (!user) {
        router.replace('/admin/login')
      } else if (!isAdmin) {
        router.replace('/dashboard')
      }
    } else {
      // Login page — redirect away if already an admin
      if (user && isAdmin) {
        router.replace('/admin')
      }
    }
  }, [user, isAdmin, loading, isLoginPage, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <span className="spinner" aria-label="Loading…" role="status" />
      </div>
    )
  }

  // While redirecting, render nothing
  if (!isLoginPage && (!user || !isAdmin)) return null

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Minimal admin header */}
      <header
        className="bg-neutral-900 text-white border-b border-neutral-800"
        role="banner"
      >
        <div className="container-app h-14 flex items-center justify-between">
          <span className="font-bold tracking-tight text-sm uppercase text-neutral-300 letter-spacing-widest">
            Yojna Mitra — Admin
          </span>
        </div>
      </header>

      <main id="main-content" className="container-app py-8">
        {children}
      </main>
    </div>
  )
}
