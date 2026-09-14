/**
 * (auth) layout — login and signup pages.
 * Intentionally minimal: no Navbar, no shared providers beyond what root layout provides.
 * Provides its own focused, centered layout for auth flows.
 */
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    default: 'Sign In | Yojna Mitra',
    template: '%s | Yojna Mitra',
  },
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      {/* Minimal header — just brand name */}
      <header className="border-b border-neutral-200 bg-white">
        <div className="container-app h-14 flex items-center">
          <a
            href="/"
            className="text-lg font-bold text-accent tracking-tight focus-visible:outline-none"
            aria-label="Yojna Mitra — go to home"
          >
            Yojna Mitra
          </a>
        </div>
      </header>

      <main
        id="main-content"
        className="flex-1 flex items-center justify-center px-4 py-12"
      >
        {children}
      </main>

      <footer className="border-t border-neutral-200 py-4 text-center text-sm text-neutral-500">
        © {new Date().getFullYear()} Yojna Mitra. Government scheme discovery portal.
      </footer>
    </div>
  )
}
