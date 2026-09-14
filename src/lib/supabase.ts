import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const isConfigured =
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('your_supabase')

if (!isConfigured) {
  console.warn(
    '⚠️ Supabase not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local'
  )
}

// Browser client — safe to use in Client Components
export const supabase = createBrowserClient(
  isConfigured ? supabaseUrl! : 'https://placeholder.supabase.co',
  isConfigured ? supabaseAnonKey! : 'placeholder-key'
)

export const isSupabaseConfigured = !!isConfigured
