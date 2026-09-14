'use client'

import { useLanguage } from '@/contexts/LanguageContext'

/**
 * Language toggle button — writes preference to cookie via LanguageContext.
 * Framer Motion is intentionally NOT used here: toggling language is an
 * instant state change, not a spatial transition.
 */
export default function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage()

  const label = language === 'en' ? 'Switch to Hindi' : 'Switch to English'
  const display = language === 'en' ? 'हिं' : 'EN'

  return (
    <button
      onClick={toggleLanguage}
      className={[
        'inline-flex items-center justify-center gap-1.5',
        'min-h-[44px] min-w-[44px] px-3',
        'border border-neutral-300 rounded',
        'text-sm font-semibold text-neutral-700',
        'hover:border-accent hover:text-accent',
        'transition-colors duration-150',
        'focus-visible:outline-none',
      ].join(' ')}
      aria-label={label}
      title={label}
    >
      {/* Globe icon */}
      <svg
        className="w-4 h-4 shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
        />
      </svg>
      <span>{display}</span>
    </button>
  )
}
