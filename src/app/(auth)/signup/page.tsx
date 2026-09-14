import type { Metadata } from 'next'
import SignupForm from '@/components/auth/SignupForm'

export const metadata: Metadata = {
  title: 'Create Account',
  description: 'Create a Yojna Mitra account to discover government schemes you qualify for.',
}

export default function SignupPage() {
  return <SignupForm />
}
