'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import Cookies from 'js-cookie'

// ── Types ────────────────────────────────────────────────────────────────────

export type Language = 'en' | 'hi'

interface LanguageContextValue {
  language: Language
  setLanguage: (lang: Language) => void
  toggleLanguage: () => void
  isHindi: boolean
  isEnglish: boolean
}

// ── Cookie key (must match middleware.ts) ─────────────────────────────────────

const LANG_COOKIE = 'ym_lang'
const COOKIE_OPTS: Cookies.CookieAttributes = {
  expires: 365,
  path: '/',
  sameSite: 'lax',
}

// ── Context ──────────────────────────────────────────────────────────────────

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within <LanguageProvider>')
  return ctx
}

// ── Provider ─────────────────────────────────────────────────────────────────

interface LanguageProviderProps {
  /** Initial language value read from the cookie server-side and passed in as a prop */
  initialLang?: Language
  children: ReactNode
}

export function LanguageProvider({ initialLang = 'en', children }: LanguageProviderProps) {
  // Hydrate from the cookie (set by middleware) — never localStorage.
  // We accept the initialLang prop from the server layout so there is no flash.
  const [language, setLanguageState] = useState<Language>(() => {
    // On the client, prefer the cookie value so the toggle persists on refresh.
    if (typeof window !== 'undefined') {
      const cookie = Cookies.get(LANG_COOKIE) as Language | undefined
      if (cookie === 'en' || cookie === 'hi') return cookie
    }
    return initialLang
  })

  // Keep the cookie in sync whenever the language changes.
  useEffect(() => {
    Cookies.set(LANG_COOKIE, language, COOKIE_OPTS)
    // Also update the <html lang=""> attribute for screen readers
    document.documentElement.lang = language === 'hi' ? 'hi' : 'en'
  }, [language])

  const setLanguage = useCallback((lang: Language) => {
    if (lang === 'en' || lang === 'hi') setLanguageState(lang)
  }, [])

  const toggleLanguage = useCallback(() => {
    setLanguageState((prev) => (prev === 'en' ? 'hi' : 'en'))
  }, [])

  const value: LanguageContextValue = {
    language,
    setLanguage,
    toggleLanguage,
    isHindi: language === 'hi',
    isEnglish: language === 'en',
  }

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}
