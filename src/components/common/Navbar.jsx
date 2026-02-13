import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { t } from '../../utils/translations'
import LanguageToggle from './LanguageToggle'
import { useState } from 'react'

export default function Navbar() {
  const { user, isAdmin, signOut } = useAuth()
  const { language } = useLanguage()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const isActive = (path) => location.pathname === path

  return (
    <nav className="glass border-b border-neutral-200/50 sticky top-0 z-50 backdrop-blur-xl">
      <div className="container-custom">
        <div className="flex items-center justify-between h-18 py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative w-11 h-11 bg-gradient-to-br from-primary-600 to-primary-500 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-200 group-hover:scale-105">
              <span className="text-white font-bold text-xl">य</span>
              <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <span className="text-xl font-extrabold gradient-text hidden sm:block">
              {t('appName', language)}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                    isActive('/dashboard')
                      ? 'bg-primary-50 text-primary-700 shadow-sm'
                      : 'text-neutral-700 hover:bg-neutral-100 hover:text-primary-600'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    {t('dashboard', language)}
                  </span>
                </Link>
                <Link
                  to="/check-eligibility"
                  className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                    isActive('/check-eligibility')
                      ? 'bg-primary-50 text-primary-700 shadow-sm'
                      : 'text-neutral-700 hover:bg-neutral-100 hover:text-primary-600'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    {t('checkEligibility', language)}
                  </span>
                </Link>
                <Link
                  to="/saved-schemes"
                  className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                    isActive('/saved-schemes')
                      ? 'bg-primary-50 text-primary-700 shadow-sm'
                      : 'text-neutral-700 hover:bg-neutral-100 hover:text-primary-600'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                    {t('savedSchemes', language)}
                  </span>
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                      isActive('/admin')
                        ? 'bg-secondary-50 text-secondary-700 shadow-sm'
                        : 'text-neutral-700 hover:bg-secondary-50 hover:text-secondary-600'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {t('adminPanel', language)}
                    </span>
                  </Link>
                )}
                <div className="ml-2">
                  <LanguageToggle />
                </div>
                <button
                  onClick={handleSignOut}
                  className="ml-2 px-5 py-2.5 rounded-xl font-semibold text-sm border-2 border-neutral-300 text-neutral-700 bg-white hover:bg-neutral-50 hover:border-neutral-400 transition-all duration-200"
                >
                  {t('logout', language)}
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-5 py-2.5 rounded-xl font-semibold text-sm text-neutral-700 hover:bg-neutral-100 transition-all duration-200"
                >
                  {t('login', language)}
                </Link>
                <Link
                  to="/signup"
                  className="px-5 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                >
                  {t('signup', language)}
                </Link>
                <div className="ml-2">
                  <LanguageToggle />
                </div>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2.5 rounded-xl hover:bg-neutral-100 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-neutral-200 animate-slide-down">
            {user ? (
              <div className="flex flex-col gap-2">
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-xl font-semibold transition-all ${
                    isActive('/dashboard')
                      ? 'bg-primary-600 text-white shadow-md'
                      : 'text-neutral-700 hover:bg-neutral-100'
                  }`}
                >
                  {t('dashboard', language)}
                </Link>
                <Link
                  to="/check-eligibility"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-xl font-semibold transition-all ${
                    isActive('/check-eligibility')
                      ? 'bg-primary-600 text-white shadow-md'
                      : 'text-neutral-700 hover:bg-neutral-100'
                  }`}
                >
                  {t('checkEligibility', language)}
                </Link>
                <Link
                  to="/saved-schemes"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-xl font-semibold transition-all ${
                    isActive('/saved-schemes')
                      ? 'bg-primary-600 text-white shadow-md'
                      : 'text-neutral-700 hover:bg-neutral-100'
                  }`}
                >
                  {t('savedSchemes', language)}
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-4 py-3 rounded-xl font-semibold transition-all ${
                      isActive('/admin')
                        ? 'bg-secondary-600 text-white shadow-md'
                        : 'text-neutral-700 hover:bg-neutral-100'
                    }`}
                  >
                    {t('adminPanel', language)}
                  </Link>
                )}
                <div className="px-4 py-2">
                  <LanguageToggle />
                </div>
                <button
                  onClick={() => {
                    handleSignOut()
                    setMobileMenuOpen(false)
                  }}
                  className="mx-4 px-4 py-3 rounded-xl font-semibold border-2 border-neutral-300 text-neutral-700 hover:bg-neutral-50 transition-all"
                >
                  {t('logout', language)}
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 rounded-xl font-semibold text-neutral-700 hover:bg-neutral-100 transition-all"
                >
                  {t('login', language)}
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="mx-4 px-4 py-3 rounded-xl font-semibold bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-md"
                >
                  {t('signup', language)}
                </Link>
                <div className="px-4 py-2">
                  <LanguageToggle />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
