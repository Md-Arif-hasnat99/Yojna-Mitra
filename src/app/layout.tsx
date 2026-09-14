import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { AuthProvider } from '@/contexts/AuthContext'
import { LanguageProvider, type Language } from '@/contexts/LanguageContext'
import './globals.css'

// ── Fonts ─────────────────────────────────────────────────────────────────────
// Switched from next/font to runtime links to bypass build-time network timeouts.
// Variable tokens defined manually here to match previous config.
const fontVariables = '--font-inter: "Inter", sans-serif; --font-noto-devanagari: "Noto Sans Devanagari", sans-serif;'

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
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Noto+Sans+Devanagari:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <style dangerouslySetInnerHTML={{ __html: `:root { ${fontVariables} }` }} />
      </head>
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
