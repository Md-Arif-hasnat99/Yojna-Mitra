import type { Metadata } from 'next'
import CompleteProfilePage from '@/views/CompleteProfilePage'

export const metadata: Metadata = {
  title: 'Complete Profile',
  description: 'Complete your profile to get accurate scheme recommendations.',
}

export default function ProfilePage() {
  return <CompleteProfilePage />
}
