import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  // ── Replace ALL default Tailwind colors with our custom civic palette ────────
  // This ensures no accidental use of default Tailwind color names bleeds through.
  theme: {
    // Only define what we need — no defaults inherited
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      white: '#ffffff',
      black: '#000000',

      // ── Single flat accent: Deep Civic Green ─────────────────────────────────
      // Institutional, not corporate SaaS. No gradients derived from this.
      accent: {
        DEFAULT: '#1A5632', // Primary civic green
        light:   '#236B3E', // For hover states
        muted:   '#E8F0EB', // For tinted backgrounds (very low saturation)
        subtle:  '#C8DBCE', // For borders, dividers
        fg:      '#FFFFFF', // Text on accent background (always white)
      },

      // ── Neutral gray scale ────────────────────────────────────────────────────
      neutral: {
        0:   '#FFFFFF',
        50:  '#F7F7F7',
        100: '#EFEFEF',
        200: '#E0E0E0',
        300: '#CACACA',
        400: '#ADADAD',
        500: '#888888',
        600: '#636363',
        700: '#434343',
        800: '#282828',
        900: '#141414',
        950: '#0A0A0A',
      },

      // ── Semantic / status colors — flat, no gradients ─────────────────────────
      success: {
        DEFAULT: '#1B6B3A',
        light:   '#E6F4EC',
        border:  '#A3D3B4',
      },
      warning: {
        DEFAULT: '#7A4E0D',
        light:   '#FDF4E3',
        border:  '#E8C27A',
      },
      error: {
        DEFAULT: '#8B1A1A',
        light:   '#FAE8E8',
        border:  '#D99090',
      },
      info: {
        DEFAULT: '#1A3A5C',
        light:   '#E6EEF7',
        border:  '#95B4D6',
      },
    },

    // ── Font stacks ───────────────────────────────────────────────────────────
    // English and Hindi are sized and spaced independently per the design brief.
    fontFamily: {
      // English — tight, technical, institutional
      sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      // Devanagari — Noto is the most legible at small sizes
      hindi: ['var(--font-noto-devanagari)', 'sans-serif'],
    },

    // ── Type scale ────────────────────────────────────────────────────────────
    fontSize: {
      xs:   ['0.75rem',  { lineHeight: '1.125rem' }],
      sm:   ['0.875rem', { lineHeight: '1.375rem' }],
      base: ['1rem',     { lineHeight: '1.625rem' }],
      lg:   ['1.125rem', { lineHeight: '1.75rem' }],
      xl:   ['1.25rem',  { lineHeight: '1.875rem' }],
      '2xl':['1.5rem',   { lineHeight: '2rem'    }],
      '3xl':['1.875rem', { lineHeight: '2.375rem'}],
      '4xl':['2.25rem',  { lineHeight: '2.75rem' }],
      '5xl':['3rem',     { lineHeight: '1.15'    }],
      '6xl':['3.75rem',  { lineHeight: '1.1'     }],
    },

    extend: {
      // ── Spacing overrides for 44px touch targets ──────────────────────────────
      minHeight: {
        touch: '44px',
      },
      minWidth: {
        touch: '44px',
      },

      // ── Border radius — squared, institutional feel ──────────────────────────
      borderRadius: {
        none: '0',
        sm:   '2px',
        DEFAULT: '4px',
        md:   '6px',
        lg:   '8px',
        xl:   '12px',
        full: '9999px',
      },

      // ── Box shadows — structural, not decorative ─────────────────────────────
      boxShadow: {
        sm:     '0 1px 2px 0 rgba(0,0,0,0.07)',
        DEFAULT:'0 1px 4px 0 rgba(0,0,0,0.10)',
        md:     '0 2px 8px 0 rgba(0,0,0,0.10)',
        lg:     '0 4px 16px 0 rgba(0,0,0,0.10)',
        inner:  'inset 0 1px 2px 0 rgba(0,0,0,0.08)',
        none:   'none',
      },

      // ── Focus ring — must be visible and distinctive ─────────────────────────
      ringColor: {
        DEFAULT: '#1A5632',
      },
      ringOffsetWidth: {
        DEFAULT: '2px',
      },

      // ── Transition ────────────────────────────────────────────────────────────
      transitionTimingFunction: {
        DEFAULT: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
}

export default config
