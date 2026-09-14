import type { Metadata } from 'next'
import Dashboard from '@/views/Dashboard'

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Your personalised government scheme dashboard.',
}

export default function DashboardPage() {
  return <Dashboard />
}
