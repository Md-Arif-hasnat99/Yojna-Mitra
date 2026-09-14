'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

// ── Types ────────────────────────────────────────────────────────────────────

export interface UserProfileRow {
  id: string
  full_name: string
  age?: number
  gender?: string
  state?: string
  category?: string
  occupation?: string
  income_bracket?: string
  has_bpl_card?: boolean
  family_size?: number
  phone?: string
  language_preference?: 'en' | 'hi'
}

interface AuthContextValue {
  user: User | null
  profile: UserProfileRow | null
  isAdmin: boolean
  loading: boolean
  signUp: (
    email: string,
    password: string,
    fullName: string
  ) => Promise<{ data: unknown; error: null } | { data: null; error: Error }>
  signIn: (
    email: string,
    password: string
  ) => Promise<{ data: unknown; error: null } | { data: null; error: Error }>
  signOut: () => Promise<{ error: null } | { error: Error }>
  updateProfile: (
    updates: Partial<UserProfileRow>
  ) => Promise<{ data: UserProfileRow | null; error: null } | { data: null; error: Error }>
  refreshProfile: () => void
}

// ── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>')
  return ctx
}

// ── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfileRow | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  // ── Helpers ──────────────────────────────────────────────────────────────

  const loadUserProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading profile:', error)
      } else {
        setProfile(data)
      }
    } catch (err) {
      console.error('Error loading profile:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const checkAdminStatus = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('admins')
        .select('role')
        .eq('user_id', userId)
        .single()

      if (error) {
        setIsAdmin(error.code === 'PGRST116' ? false : false)
        if (error.code !== 'PGRST116') {
          console.warn('Error checking admin status:', error.message)
        }
      } else {
        setIsAdmin(!!data)
      }
    } catch (err) {
      console.error('Unexpected error checking admin status:', err)
      setIsAdmin(false)
    }
  }, [])

  // ── Auth initialisation ──────────────────────────────────────────────────

  useEffect(() => {
    const initAuth = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.error('Supabase connection error:', error)
          setLoading(false)
          return
        }

        setUser(session?.user ?? null)
        if (session?.user) {
          await Promise.all([
            loadUserProfile(session.user.id),
            checkAdminStatus(session.user.id),
          ])
        } else {
          setLoading(false)
        }
      } catch (err) {
        console.error('Error initialising auth:', err)
        setLoading(false)
      }
    }

    initAuth()

    try {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) {
          loadUserProfile(session.user.id)
          checkAdminStatus(session.user.id)
        } else {
          setProfile(null)
          setIsAdmin(false)
          setLoading(false)
        }
      })
      return () => subscription?.unsubscribe()
    } catch (err) {
      console.error('Error setting up auth listener:', err)
      return () => {}
    }
  }, [loadUserProfile, checkAdminStatus])

  // ── Auth actions ─────────────────────────────────────────────────────────

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      })
      if (error) throw error

      if (data.user) {
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert([{ id: data.user.id, full_name: fullName, language_preference: 'en' }])
        if (profileError) console.error('Error creating profile:', profileError)
      }

      return { data, error: null }
    } catch (err) {
      return { data: null, error: err as Error }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err as Error }
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setProfile(null)
      setIsAdmin(false)
      return { error: null }
    } catch (err) {
      return { error: err as Error }
    }
  }

  const updateProfile = async (updates: Partial<UserProfileRow>) => {
    if (!user) {
      return {
        data: null,
        error: new Error('No user logged in. Please configure Supabase and log in.'),
      }
    }
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          full_name:
            profile?.full_name ?? (user.user_metadata?.full_name as string) ?? 'User',
          ...updates,
        })
        .select()
        .single()

      if (error) throw error
      setProfile(data)
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err as Error }
    }
  }

  // ── Value ────────────────────────────────────────────────────────────────

  const value: AuthContextValue = {
    user,
    profile,
    isAdmin,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    refreshProfile: () => user && loadUserProfile(user.id),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
