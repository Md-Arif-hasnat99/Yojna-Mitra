import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { t } from '../utils/translations'
import { supabase } from '../lib/supabase'
import { matchSchemes, extractAmount } from '../lib/matchingAlgorithm'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import SchemeCard from '../components/user/SchemeCard'

export default function Dashboard() {
  const { user, profile } = useAuth()
  const { language } = useLanguage()
  const [stats, setStats] = useState({
    totalSchemes: 0,
    totalBenefit: 0,
    schemesSaved: 0,
    schemesApplied: 0
  })
  const [savedSchemes, setSavedSchemes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (profile) {
      loadDashboardData()
    } else {
      // No profile, stop loading and show demo mode
      setLoading(false)
    }
  }, [profile])

  const loadDashboardData = async () => {
    setLoading(true)

    // Load all schemes
    const { data: allSchemes } = await supabase
      .from('schemes')
      .select('*')
      .eq('is_active', true)

    // Match schemes with user profile
    const eligibleSchemes = profile ? matchSchemes(profile, allSchemes || []) : []

    // Calculate total benefit
    const totalBenefit = eligibleSchemes.reduce((sum, scheme) => {
      return sum + extractAmount(scheme.benefit_amount)
    }, 0)

    // Load saved schemes
    const { data: savedData } = await supabase
      .from('user_saved_schemes')
      .select(`
        *,
        schemes (*)
      `)
      .eq('user_id', user.id)
      .order('saved_at', { ascending: false })
      .limit(3)

    // Count applied schemes
    const appliedCount = savedData?.filter(s => s.status === 'applied' || s.status === 'received').length || 0

    setStats({
      totalSchemes: eligibleSchemes.length,
      totalBenefit,
      schemesSaved: savedData?.length || 0,
      schemesApplied: appliedCount
    })

    setSavedSchemes(savedData || [])
    setLoading(false)
  }

  const formatCurrency = (amount) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(1)} Cr`
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)} L`
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(1)} K`
    }
    return `₹${amount}`
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    )
  }

  // Demo mode: Show sample data if no profile
  const isDemoMode = !profile || !profile.age || !profile.state || !profile.category
  const displayName = profile?.full_name || 'Demo User'
  const displayStats = isDemoMode ? {
    totalSchemes: 12,
    totalBenefit: 75000,
    schemesSaved: 3,
    schemesApplied: 1
  } : stats

  return (
    <div className="min-h-[calc(100vh-4rem)] py-10">
      <div className="container-custom">
        {isDemoMode && (
          <div className="bg-sky-50 border-2 border-sky-200 text-sky-800 p-5 mb-8 rounded-2xl flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 bg-sky-200 rounded-xl flex items-center justify-center text-sky-700">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-lg">{language === 'hi' ? 'डेमो मोड' : 'Demo Mode - Sample Data'}</p>
              <p className="text-sm mt-1">
                {language === 'hi' ? 'वास्तविक योजनाएं देखने के लिए प्रोफ़ाइल पूरी करें।' : 'Complete your profile to see real schemes matched to your eligibility.'}
                <Link to="/complete-profile" className="ml-2 font-bold text-sky-700 hover:underline">
                  {language === 'hi' ? 'प्रोफ़ाइल पूरी करें →' : 'Complete Profile →'}
                </Link>
              </p>
            </div>
          </div>
        )}

        {/* Welcome Section */}
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3">
            <span className="gradient-text">{t('namaste', language)},</span> {displayName}! 👋
          </h1>
          <p className="text-lg text-neutral-600">
            {language === 'hi' 
              ? `योजनामित्र ने आपके लिए ${displayStats.totalSchemes} योजनाएं खोजीं`
              : `YojnaMitra found ${displayStats.totalSchemes} schemes for you`}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-gradient-to-br from-primary-600 to-primary-500 text-white rounded-2xl p-6 shadow-medium">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className="text-4xl font-black">{displayStats.totalSchemes}</div>
                <div className="text-sm font-medium opacity-90">{t('totalSchemes', language)}</div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-secondary-600 to-secondary-500 text-white rounded-2xl p-6 shadow-medium">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className="text-4xl font-black">{formatCurrency(displayStats.totalBenefit)}</div>
                <div className="text-sm font-medium opacity-90">{t('totalBenefit', language)}</div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-600 to-emerald-500 text-white rounded-2xl p-6 shadow-medium">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </div>
              <div>
                <div className="text-4xl font-black">{displayStats.schemesSaved}</div>
                <div className="text-sm font-medium opacity-90">{t('schemesSaved', language)}</div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-600 to-amber-500 text-white rounded-2xl p-6 shadow-medium">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <div>
                <div className="text-4xl font-black">{displayStats.schemesApplied}</div>
                <div className="text-sm font-medium opacity-90">{t('schemesApplied', language)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <Card variant="hover" className="text-center !py-10">
            <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-medium">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold mb-3 text-neutral-900">{t('checkEligibility', language)}</h3>
            <p className="text-neutral-600 mb-6 max-w-xs mx-auto">
              {language === 'hi' 
                ? 'अपनी पात्रता जांचें और नई योजनाएं खोजें'
                : 'Check your eligibility and discover new schemes'}
            </p>
            <Link to="/check-eligibility">
              <Button variant="primary">{t('getStarted', language)}</Button>
            </Link>
          </Card>

          <Card variant="hover" className="text-center !py-10">
            <div className="w-20 h-20 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-medium">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold mb-3 text-neutral-900">{t('savedSchemes', language)}</h3>
            <p className="text-neutral-600 mb-6 max-w-xs mx-auto">
              {language === 'hi' 
                ? 'अपनी सहेजी गई योजनाओं को देखें और ट्रैक करें'
                : 'View and track your saved schemes'}
            </p>
            <Link to="/saved-schemes">
              <Button variant="outline">{t('viewDetails', language)}</Button>
            </Link>
          </Card>
        </div>

        {/* Recent Saved Schemes */}
        {savedSchemes.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-neutral-900">{t('yourSavedSchemes', language)}</h2>
              <Link to="/saved-schemes" className="text-primary-600 font-semibold hover:text-primary-700 transition-colors flex items-center gap-1">
                {language === 'hi' ? 'सभी देखें' : 'View All'} →
              </Link>
            </div>

            <div className="scheme-grid">
              {savedSchemes.map((saved) => (
                <SchemeCard
                  key={saved.id}
                  scheme={saved.schemes}
                  isSaved={true}
                  onSave={loadDashboardData}
                />
              ))}
            </div>
          </div>
        )}

        {savedSchemes.length === 0 && (
          <Card className="text-center !py-16">
            <div className="w-20 h-20 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <svg className="w-10 h-10 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-neutral-700 mb-3">{t('noSavedSchemes', language)}</h3>
            <p className="text-neutral-500 mb-6 max-w-sm mx-auto">{t('startExploring', language)}</p>
            <Link to="/check-eligibility">
              <Button variant="primary" size="lg">{t('checkEligibility', language)}</Button>
            </Link>
          </Card>
        )}
      </div>
    </div>
  )
}
