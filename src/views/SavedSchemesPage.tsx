'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { t } from '../utils/translations'
import { supabase } from '../lib/supabase'
import { SCHEME_STATUS } from '../utils/constants'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Select from '../components/common/Select'

export default function SavedSchemesPage() {
  const { user } = useAuth()
  const { language } = useLanguage()
  const [savedSchemes, setSavedSchemes] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('')

  useEffect(() => {
    loadSavedSchemes()
  }, [])

  const loadSavedSchemes = async () => {
    setLoading(true)

    const { data, error } = await supabase
      .from('user_saved_schemes')
      .select(`
        *,
        schemes (*)
      `)
      .eq('user_id', user.id)
      .order('saved_at', { ascending: false })

    if (!error) {
      setSavedSchemes(data || [])
    }

    setLoading(false)
  }

  const updateStatus = async (savedSchemeId, newStatus) => {
    const { error } = await supabase
      .from('user_saved_schemes')
      .update({ status: newStatus })
      .eq('id', savedSchemeId)

    if (!error) {
      loadSavedSchemes()
    }
  }

  const unsaveScheme = async (savedSchemeId) => {
    const { error } = await supabase
      .from('user_saved_schemes')
      .delete()
      .eq('id', savedSchemeId)

    if (!error) {
      loadSavedSchemes()
    }
  }

  const filteredSchemes = filterStatus
    ? savedSchemes.filter(s => s.status === filterStatus)
    : savedSchemes

  const getStatusColor = (status) => {
    const statusObj = SCHEME_STATUS.find(s => s.value === status)
    return statusObj?.color || 'gray'
  }

  const getStatusBadgeClass = (status) => {
    const colors = {
      interested: 'bg-blue-100 text-blue-800',
      applied: 'bg-yellow-100 text-yellow-800',
      received: 'bg-green-100 text-green-800'
    }
    return colors[status] || 'bg-neutral-100 text-neutral-800'
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] py-8">
      <div className="container-custom">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3 gradient-text">
            {t('savedSchemes', language)}
          </h1>
          <p className="text-lg text-neutral-600">
            {language === 'hi'
              ? `आपने ${savedSchemes.length} योजनाएं सहेजी हैं`
              : `You have saved ${savedSchemes.length} schemes`}
          </p>
        </div>

        {/* Filter by Status */}
        {savedSchemes.length > 0 && (
          <div className="mb-6 max-w-xs">
            <Select
              label={t('filterBy', language)}
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              options={SCHEME_STATUS}
              placeholder={language === 'hi' ? 'सभी स्थितियां' : 'All Statuses'}
            />
          </div>
        )}

        {/* Saved Schemes List */}
        {filteredSchemes.length > 0 ? (
          <div className="space-y-6">
            {filteredSchemes.map((saved) => {
              const scheme = saved.schemes
              const schemeName = language === 'hi' && scheme.scheme_name_hi
                ? scheme.scheme_name_hi
                : scheme.scheme_name
              const description = language === 'hi' && scheme.description_hi
                ? scheme.description_hi
                : scheme.description

              return (
                <Card key={saved.id} className="border-l-4 border-primary-600">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    {/* Scheme Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-neutral-900">
                          {schemeName}
                        </h3>
                        <span className={`badge ${getStatusBadgeClass(saved.status)}`}>
                          {t(saved.status, language)}
                        </span>
                      </div>

                      <div className="mb-2">
                        <span className="text-sm text-neutral-600">{t('benefit', language)}: </span>
                        <span className="benefit-amount text-lg">{scheme.benefit_amount}</span>
                      </div>

                      <p className="text-neutral-600 text-sm mb-3 line-clamp-2">
                        {description}
                      </p>

                      <div className="flex flex-wrap gap-2 text-xs text-neutral-500">
                        <span className={`badge ${scheme.scheme_type === 'central' ? 'badge-info' : 'badge-warning'}`}>
                          {scheme.scheme_type === 'central'
                            ? (language === 'hi' ? 'केंद्रीय' : 'Central')
                            : (language === 'hi' ? 'राज्य' : 'State')}
                        </span>
                        {scheme.ministry && (
                          <span className="text-neutral-500">• {scheme.ministry}</span>
                        )}
                        <span className="text-neutral-500">
                          • {language === 'hi' ? 'सहेजा गया:' : 'Saved:'} {new Date(saved.saved_at).toLocaleDateString()}
                        </span>
                      </div>

                      {saved.notes && (
                        <div className="mt-3 p-3 bg-neutral-50 rounded-xl">
                          <p className="text-sm text-neutral-700">
                            <span className="font-semibold">{t('notes', language)}:</span> {saved.notes}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 min-w-[200px]">
                      <Select
                        label={t('updateStatus', language)}
                        value={saved.status}
                        onChange={(e) => updateStatus(saved.id, e.target.value)}
                        options={SCHEME_STATUS}
                        className="mb-0"
                      />

                      <Button
                        variant="secondary"
                        onClick={() => window.open(scheme.application_link, '_blank')}
                        className="text-sm"
                      >
                        {t('applyNow', language)}
                      </Button>

                      <Button
                        variant="ghost"
                        onClick={() => unsaveScheme(saved.id)}
                        className="text-sm text-red-600 hover:bg-red-50"
                      >
                        {t('unsaveScheme', language)}
                      </Button>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        ) : (
          <Card className="text-center !py-16">
            <div className="w-20 h-20 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <svg className="w-10 h-10 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-neutral-700 mb-3">
              {filterStatus
                ? (language === 'hi' ? 'इस स्थिति में कोई योजना नहीं' : 'No schemes with this status')
                : t('noSavedSchemes', language)}
            </h3>
            <p className="text-neutral-500 mb-6">
              {filterStatus
                ? (language === 'hi' ? 'फ़िल्टर साफ़ करने का प्रयास करें' : 'Try clearing the filter')
                : t('startExploring', language)}
            </p>
            {filterStatus ? (
              <Button variant="primary" onClick={() => setFilterStatus('')}>
                {t('clearFilters', language)}
              </Button>
            ) : (
              <Button variant="primary" onClick={() => window.location.href = '/check-eligibility'}>
                {t('checkEligibility', language)}
              </Button>
            )}
          </Card>
        )}
      </div>
    </div>
  )
}

