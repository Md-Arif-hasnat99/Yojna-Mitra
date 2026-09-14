/**
 * (app) layout — dashboard and all protected user pages.
 * Auth guard runs ONCE here, not per-page.
 * Renders Navbar above the page content.
 */
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Navbar from '@/components/common/NavbarNext'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()
  const router = useRouter()

  // Fine-grained auth guard — middleware handles the coarse redirect,
  // this handles the case where Supabase session expires mid-session.
  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <span className="spinner" aria-label="Loading…" role="status" />
      </div>
    )
  }

  if (!user) {
    // Render nothing while redirect is in progress
    return null
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />
      <main id="main-content" className="container-app py-8">
        {children}
      </main>
    </div>
  )
}
