import type { Metadata } from 'next'
import { Inter, Noto_Sans_Devanagari } from 'next/font/google'
import { cookies } from 'next/headers'
import { AuthProvider } from '@/contexts/AuthContext'
import { LanguageProvider, type Language } from '@/contexts/LanguageContext'
import './globals.css'

// ── Fonts ─────────────────────────────────────────────────────────────────────
// Loaded by next/font for optimal performance (no external network request at runtime)

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
})

const notoDevanagari = Noto_Sans_Devanagari({
  subsets: ['devanagari'],
  variable: '--font-noto-devanagari',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})

// ── Metadata ──────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: {
    default: 'Yojna Mitra — Find Government Schemes You Qualify For',
    template: '%s | Yojna Mitra',
  },
  description:
    'Yojna Mitra helps citizens discover Indian government welfare schemes they are eligible for, in English and Hindi.',
  keywords: ['government schemes', 'yojana', 'welfare', 'eligibility', 'India', 'subsidies'],
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    title: 'Yojna Mitra',
    description: 'Find government schemes you qualify for — bilingual (English + Hindi)',
  },
}

// ── Root Layout ───────────────────────────────────────────────────────────────

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Read the language cookie server-side to avoid a client-side flash.
  // The middleware ensures this cookie always exists with a default of 'en'.
  const cookieStore = await cookies()
  const langCookie = cookieStore.get('ym_lang')?.value
  const initialLang: Language =
    langCookie === 'hi' || langCookie === 'en' ? langCookie : 'en'

  return (
    <html
      lang={initialLang === 'hi' ? 'hi' : 'en'}
      className={`${inter.variable} ${notoDevanagari.variable}`}
      suppressHydrationWarning
    >
      <head />
      <body>
        {/* Skip-to-content for keyboard users */}
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>

        <AuthProvider>
          <LanguageProvider initialLang={initialLang}>
            {children}
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
