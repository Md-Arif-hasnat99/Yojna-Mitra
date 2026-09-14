'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { t } from '@/utils/translations'
import LanguageToggle from './LanguageToggle'

// ── Nav link definitions ──────────────────────────────────────────────────────

const NAV_LINKS = [
  {
    href: '/dashboard',
    labelKey: 'dashboard' as const,
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: '/eligibility',
    labelKey: 'checkEligibility' as const,
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    href: '/saved',
    labelKey: 'savedSchemes' as const,
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
      </svg>
    ),
  },
]

// ── Mobile menu animation variants (Framer Motion — functional, not decorative) ──

const mobileMenuVariants = {
  hidden: { height: 0, opacity: 0 },
  visible: {
    height: 'auto',
    opacity: 1,
    transition: { duration: 0.22, ease: 'easeOut' },
  },
  exit: {
    height: 0,
    opacity: 0,
    transition: { duration: 0.18, ease: 'easeIn' },
  },
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function Navbar() {
  const { user, isAdmin, signOut } = useAuth()
  const { language } = useLanguage()
  const router = useRouter()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleSignOut = useCallback(async () => {
    setMobileOpen(false)
    await signOut()
    router.push('/')
  }, [signOut, router])

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  const navLinkClass = (href: string) =>
    [
      'inline-flex items-center gap-2 min-h-[44px] px-4 py-2 rounded',
      'text-sm font-semibold transition-colors duration-150',
      'focus-visible:outline-none',
      isActive(href)
        ? 'bg-accent-muted text-accent border border-accent-subtle'
        : 'text-neutral-700 hover:bg-neutral-100',
    ].join(' ')

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-neutral-200" role="banner">
      <nav
        className="container-app"
        aria-label="Primary navigation"
      >
        <div className="flex items-center justify-between h-16">

          {/* ── Brand ────────────────────────────────────────────────────────── */}
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 min-h-[44px] font-bold text-lg text-neutral-900 tracking-tight focus-visible:outline-none rounded"
            aria-label="Yojna Mitra — go to home"
          >
            {/* Flat civic mark — no gradient, no glow */}
            <span
              className="w-9 h-9 rounded flex items-center justify-center bg-accent text-white font-bold text-base select-none"
              aria-hidden="true"
            >
              य
            </span>
            <span className="hidden sm:block">{t('appName', language)}</span>
          </Link>

          {/* ── Desktop nav ───────────────────────────────────────────────────── */}
          <div className="hidden md:flex items-center gap-1" role="list">
            {user ? (
              <>
                {NAV_LINKS.map((link) => (
                  <div key={link.href} role="listitem">
                    <Link
                      href={link.href}
                      className={navLinkClass(link.href)}
                      aria-current={isActive(link.href) ? 'page' : undefined}
                    >
                      {link.icon}
                      {t(link.labelKey, language)}
                    </Link>
                  </div>
                ))}

                {isAdmin && (
                  <div role="listitem">
                    <Link
                      href="/admin"
                      className={navLinkClass('/admin')}
                      aria-current={isActive('/admin') ? 'page' : undefined}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {t('adminPanel', language)}
                    </Link>
                  </div>
                )}

                <div className="ml-1 border-l border-neutral-200 pl-3 flex items-center gap-2">
                  <LanguageToggle />
                  <button
                    onClick={handleSignOut}
                    className="btn-outline text-sm"
                    aria-label={t('logout', language)}
                  >
                    {t('logout', language)}
                  </button>
                </div>
              </>
            ) : (
              <>
                <LanguageToggle />
                <div className="border-l border-neutral-200 pl-3 flex items-center gap-2">
                  <Link href="/login" className="btn-ghost text-sm">
                    {t('login', language)}
                  </Link>
                  <Link href="/signup" className="btn-primary text-sm">
                    {t('signup', language)}
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* ── Mobile: lang toggle + hamburger ─────────────────────────────── */}
          <div className="flex items-center gap-2 md:hidden">
            <LanguageToggle />
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="inline-flex items-center justify-center w-11 h-11 rounded text-neutral-700 hover:bg-neutral-100 transition-colors"
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileOpen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* ── Mobile menu — Framer Motion expand/collapse ─────────────────────── */}
        <AnimatePresence initial={false}>
          {mobileOpen && (
            <motion.div
              id="mobile-menu"
              key="mobile-menu"
              variants={mobileMenuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="overflow-hidden md:hidden border-t border-neutral-200"
              aria-label="Mobile navigation"
            >
              <div className="flex flex-col py-3 gap-1">
                {user ? (
                  <>
                    {NAV_LINKS.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMobileOpen(false)}
                        className={`${navLinkClass(link.href)} w-full`}
                        aria-current={isActive(link.href) ? 'page' : undefined}
                      >
                        {link.icon}
                        {t(link.labelKey, language)}
                      </Link>
                    ))}
                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setMobileOpen(false)}
                        className={`${navLinkClass('/admin')} w-full`}
                        aria-current={isActive('/admin') ? 'page' : undefined}
                      >
                        {t('adminPanel', language)}
                      </Link>
                    )}
                    <div className="border-t border-neutral-200 mt-2 pt-3">
                      <button
                        onClick={handleSignOut}
                        className="btn-outline w-full text-sm"
                        aria-label={t('logout', language)}
                      >
                        {t('logout', language)}
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setMobileOpen(false)}
                      className="btn-ghost w-full text-sm"
                    >
                      {t('login', language)}
                    </Link>
                    <Link
                      href="/signup"
                      onClick={() => setMobileOpen(false)}
                      className="btn-primary w-full text-sm"
                    >
                      {t('signup', language)}
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  )
}
