import type { Metadata } from 'next'
import SavedSchemesPage from '@/views/SavedSchemesPage'

export const metadata: Metadata = {
  title: 'Saved Schemes',
  description: 'Government schemes you have saved for later review.',
}

export default function SavedPage() {
  return <SavedSchemesPage />
}
