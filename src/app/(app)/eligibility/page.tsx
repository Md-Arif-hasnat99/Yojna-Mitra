import type { Metadata } from 'next'
import CheckEligibilityPage from '@/views/CheckEligibilityPage'

export const metadata: Metadata = {
  title: 'Check Eligibility',
  description: 'Check which government schemes you are eligible for based on your profile.',
}

export default function EligibilityPage() {
  return <CheckEligibilityPage />
}
