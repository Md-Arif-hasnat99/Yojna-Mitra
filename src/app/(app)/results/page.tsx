import type { Metadata } from 'next'
import ResultsPage from '@/pages/ResultsPage'

export const metadata: Metadata = {
  title: 'Your Results',
  description: 'Government schemes you are eligible for, ranked by benefit amount.',
}

export default function ResultsPageRoute() {
  return <ResultsPage />
}
