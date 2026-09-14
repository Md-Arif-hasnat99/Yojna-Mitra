import type { Metadata } from 'next'
import AdminPanelPage from '@/pages/AdminPanelPage'

export const metadata: Metadata = {
  title: 'Admin Panel',
  description: 'Yojna Mitra administration panel.',
}

export default function AdminPanelPageRoute() {
  return <AdminPanelPage />
}
