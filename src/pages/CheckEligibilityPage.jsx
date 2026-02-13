import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { t } from '../utils/translations'
import { supabase } from '../lib/supabase'
import { matchSchemes } from '../lib/matchingAlgorithm'
import Button from '../components/common/Button'

export default function CheckEligibilityPage() {
  const { profile, updateProfile } = useAuth()
  const { language } = useLanguage()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // If profile is complete, run the check automatically
    if (profile && profile.age && profile.state && profile.category) {
      handleCheckEligibility()
    }
  }, [])

  const handleCheckEligibility = async () => {
    if (!profile || !profile.age || !profile.state || !profile.category) {
      navigate('/complete-profile')
      return
    }

    setLoading(true)

    // Fetch all active schemes
    const { data: schemes, error } = await supabase
      .from('schemes')
      .select('*')
      .eq('is_active', true)

    if (error) {
      console.error('Error fetching schemes:', error)
      setLoading(false)
      return
    }

    // Match schemes with user profile
    const eligibleSchemes = matchSchemes(profile, schemes || [])

    // Log the check for analytics
    await supabase.from('scheme_checks').insert({
      user_id: profile.id,
      search_criteria: {
        age: profile.age,
        state: profile.state,
        category: profile.category,
        occupation: profile.occupation,
        income_bracket: profile.income_bracket
      },
      matched_schemes_count: eligibleSchemes.length
    })

    // Navigate to results with the matched schemes
    navigate('/results', { state: { eligibleSchemes } })
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-large p-10 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-600 to-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-medium">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <h1 className="text-3xl font-extrabold mb-4 gradient-text">
            {t('checkYourEligibility', language)}
          </h1>

          <p className="text-lg text-neutral-600 mb-8">
            {language === 'hi'
              ? 'हम आपकी प्रोफ़ाइल के आधार पर आपके लिए सरकारी योजनाएं खोजेंगे'
              : 'We\'ll find government schemes based on your profile'}
          </p>

          {profile && profile.age && profile.state && profile.category ? (
            <div className="bg-neutral-50 rounded-2xl p-6 mb-6 text-left border border-neutral-200">
              <h3 className="font-bold text-neutral-800 mb-3">
                {language === 'hi' ? 'आपकी प्रोफ़ाइल:' : 'Your Profile:'}
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-neutral-500">{t('age', language)}:</span>
                  <span className="ml-2 font-semibold text-neutral-900">{profile.age}</span>
                </div>
                <div>
                  <span className="text-neutral-500">{t('gender', language)}:</span>
                  <span className="ml-2 font-semibold text-neutral-900">{profile.gender}</span>
                </div>
                <div>
                  <span className="text-neutral-500">{t('state', language)}:</span>
                  <span className="ml-2 font-semibold text-neutral-900">{profile.state}</span>
                </div>
                <div>
                  <span className="text-neutral-500">{t('category', language)}:</span>
                  <span className="ml-2 font-semibold text-neutral-900">{profile.category}</span>
                </div>
                <div>
                  <span className="text-neutral-500">{t('occupation', language)}:</span>
                  <span className="ml-2 font-semibold text-neutral-900">{profile.occupation}</span>
                </div>
                <div>
                  <span className="text-neutral-500">{t('incomeBracket', language)}:</span>
                  <span className="ml-2 font-semibold text-neutral-900">{profile.income_bracket}</span>
                </div>
              </div>
            </div>
          ) : null}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="primary"
              onClick={handleCheckEligibility}
              disabled={loading}
              size="lg"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="spinner-sm"></div>
                  <span>{language === 'hi' ? 'खोज रहे हैं...' : 'Finding Schemes...'}</span>
                </div>
              ) : (
                t('findSchemes', language)
              )}
            </Button>

            {profile && profile.age && (
              <Button
                variant="outline"
                onClick={() => navigate('/complete-profile')}
                size="lg"
              >
                {language === 'hi' ? 'प्रोफ़ाइल संपादित करें' : 'Edit Profile'}
              </Button>
            )}
          </div>

          <p className="text-sm text-neutral-400 mt-6">
            {language === 'hi'
              ? 'यह कुछ सेकंड लग सकता है...'
              : 'This may take a few seconds...'}
          </p>
        </div>
      </div>
    </div>
  )
}
