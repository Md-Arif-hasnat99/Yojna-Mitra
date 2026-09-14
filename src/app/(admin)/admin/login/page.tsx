import type { Metadata } from 'next'
import AdminLoginPage from '@/views/AdminLoginPage'

export const metadata: Metadata = {
  title: 'Admin Sign In',
  description: 'Sign in to the Yojna Mitra administration panel.',
}

export default function AdminLoginPageRoute() {
  return <AdminLoginPage />
}
