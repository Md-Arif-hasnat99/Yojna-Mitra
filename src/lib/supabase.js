import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

let supabase

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your_supabase')) {
  console.warn('⚠️ Supabase not configured! Please update .env.local with your Supabase credentials.')
  console.warn('📖 See SETUP_GUIDE.md for instructions.')
  // Use placeholder values to prevent app crash
  const placeholderUrl = 'https://placeholder.supabase.co'
  const placeholderKey = 'placeholder-key'
  supabase = createClient(placeholderUrl, placeholderKey)
} else {
  supabase = createClient(supabaseUrl, supabaseAnonKey)
}

export { supabase }
