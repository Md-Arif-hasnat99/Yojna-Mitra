import type { Metadata } from 'next'
import LandingPage from '@/views/LandingPage'

export const metadata: Metadata = {
  title: 'Yojna Mitra — Find Government Schemes You Qualify For',
  description:
    'Discover Indian government welfare schemes you are eligible for. Bilingual in English and Hindi.',
}

export default function HomePage() {
  return (
    <main id="main-content">
      <LandingPage />
    </main>
  )
}
