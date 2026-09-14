import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { t } from '../../utils/translations'
import { supabase } from '../../lib/supabase'
import Button from '../common/Button'

export default function SchemeCard({ scheme, onSave, isSaved = false, showMatchScore = false }) {
  const { user } = useAuth()
  const { language } = useLanguage()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(isSaved)

  const schemeName = language === 'hi' && scheme.scheme_name_hi 
    ? scheme.scheme_name_hi 
    : scheme.scheme_name

  const description = language === 'hi' && scheme.description_hi 
    ? scheme.description_hi 
    : scheme.description

  const handleSave = async () => {
    if (!user) return

    setSaving(true)

    if (saved) {
      // Unsave
      const { error } = await supabase
        .from('user_saved_schemes')
        .delete()
        .eq('user_id', user.id)
        .eq('scheme_id', scheme.id)

      if (!error) {
        setSaved(false)
        onSave && onSave(scheme.id, false)
      }
    } else {
      // Save
      const { error } = await supabase
        .from('user_saved_schemes')
        .insert({
          user_id: user.id,
          scheme_id: scheme.id,
          status: 'interested'
        })

      if (!error) {
        setSaved(true)
        onSave && onSave(scheme.id, true)
      }
    }

    setSaving(false)
  }

  return (
    <div className="group relative bg-white rounded-2xl border-2 border-neutral-200 overflow-hidden transition-all duration-300 hover:shadow-large hover:border-primary-300 hover:-translate-y-1">
      {/* Colored Top Border */}
      <div className={`h-2 ${
        scheme.scheme_type === 'central' 
          ? 'bg-gradient-to-r from-primary-600 via-primary-500 to-primary-400'
          : 'bg-gradient-to-r from-secondary-600 via-secondary-500 to-secondary-400'
      }`} />
      
      <div className="p-6">
        {/* Header - Type Badge & Match Score */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              scheme.scheme_type === 'central' ? 'bg-primary-500' : 'bg-secondary-500'
            } animate-pulse`} />
            <span className={`text-xs font-bold uppercase tracking-wider ${
              scheme.scheme_type === 'central' ? 'text-primary-700' : 'text-secondary-700'
            }`}>
              {scheme.scheme_type === 'central' 
                ? (language === 'hi' ? 'केंद्रीय योजना' : 'Central Scheme')
                : (language === 'hi' ? 'राज्य योजना' : 'State Scheme')}
            </span>
          </div>
          {showMatchScore && scheme.match_score && (
            <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full border border-emerald-200">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-xs font-bold">{scheme.match_score}%</span>
            </div>
          )}
        </div>

        {/* Scheme Name */}
        <h3 className="text-xl font-bold text-neutral-900 mb-3 line-clamp-2 leading-tight group-hover:text-primary-600 transition-colors">
          {schemeName}
        </h3>

        {/* Benefit Amount - Highlighted */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 mb-4 border-2 border-amber-100">
          <div className="flex items-baseline gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-medium text-neutral-600 mb-0.5">{t('benefit', language)}</p>
              <p className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-secondary-600 to-amber-600">
                {scheme.benefit_amount}
              </p>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-neutral-600 text-sm leading-relaxed mb-4 line-clamp-3">
          {description}
        </p>

        {/* Ministry - with icon */}
        {scheme.ministry && (
          <div className="flex items-start gap-2 mb-5 pb-5 border-b border-neutral-200">
            <svg className="w-4 h-4 text-neutral-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
            </svg>
            <p className="text-xs text-neutral-500 leading-relaxed">
              {scheme.ministry}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className={`flex-1 flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
              saved 
                ? 'bg-amber-50 text-amber-700 border-2 border-amber-300 hover:bg-amber-100 hover:border-amber-400'
                : 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                {saved ? (
                  <>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span>{language === 'hi' ? 'सहेजा गया' : 'Saved'}</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                    <span>{t('saveScheme', language)}</span>
                  </>
                )}
              </>
            )}
          </button>
          <button
            onClick={() => window.open(scheme.application_link, '_blank')}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-semibold text-sm bg-white text-neutral-700 border-2 border-neutral-300 hover:border-primary-500 hover:text-primary-600 hover:bg-primary-50 transition-all duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            <span>{t('viewDetails', language)}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
