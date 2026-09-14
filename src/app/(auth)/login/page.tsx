import type { Metadata } from 'next'
import LoginForm from '@/components/auth/LoginForm'

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to Yojna Mitra to find government schemes you are eligible for.',
}

export default function LoginPage() {
  return <LoginForm />
}
