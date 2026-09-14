'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { t } from '../../utils/translations'
import { supabase } from '../../lib/supabase'
import Input from '../common/Input'
import Button from '../common/Button'
import Card from '../common/Card'

export default function LoginForm({ isAdmin = false }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const { signIn, signOut } = useAuth()
  const { language } = useLanguage()
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data, error: signInError } = await signIn(email, password)

    if (signInError) {
      setError(signInError.message)
      setLoading(false)
      return
    }

    // If admin login, check admin status
    if (isAdmin) {
      // Check if user is admin
      const { data: adminData } = await supabase
        .from('admins')
        .select('role')
        .eq('user_id', data.user.id)
        .single()

      if (!adminData) {
        setError('You do not have admin access')
        await signOut()
        setLoading(false)
        return
      }
      router.push('/admin')
    } else {
      router.push('/dashboard')
    }

    setLoading(false)
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <Card variant="elevated" className="!p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-500 rounded-2xl mb-4 shadow-medium">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold gradient-text">
            {isAdmin ? t('adminPanel', language) : t('login', language)}
          </h2>
          <p className="mt-2 text-neutral-600">
            {isAdmin 
              ? (language === 'hi' ? 'एडमिन एक्सेस के लिए लॉगिन करें' : 'Login to access admin panel')
              : (language === 'hi' ? 'अपने खाते में लॉगिन करें' : 'Login to your account')}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border-2 border-rose-200 text-rose-700 rounded-xl flex items-start gap-3">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label={t('emailAddress', language)}
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
              </svg>
            }
          />

          <Input
            label={t('password', language)}
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            }
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            disabled={loading}
            className="mt-6"
          >
            {loading ? (
              <>
                <div className="spinner-sm"></div>
                {t('loading', language)}
              </>
            ) : (
              t('login', language)
            )}
          </Button>
        </form>

        {!isAdmin && (
          <p className="mt-8 text-center text-neutral-600">
            {t('dontHaveAccount', language)}{' '}
            <Link href="/signup" className="text-primary-600 font-bold hover:text-primary-700 hover:underline transition-colors">
              {t('signUpHere', language)}
            </Link>
          </p>
        )}
      </Card>
    </div>
  )
}
