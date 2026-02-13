import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'
import { t } from '../utils/translations'
import { filterSchemes, searchSchemes } from '../lib/matchingAlgorithm'
import { SCHEME_TYPES, MINISTRIES } from '../utils/constants'
import SchemeCard from '../components/user/SchemeCard'
import Button from '../components/common/Button'
import Select from '../components/common/Select'
import Input from '../components/common/Input'

export default function ResultsPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { language } = useLanguage()
  
  const [allSchemes, setAllSchemes] = useState([])
  const [filteredSchemes, setFilteredSchemes] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    scheme_type: '',
    ministry: '',
    min_benefit: '',
    max_benefit: ''
  })
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    const schemes = location.state?.eligibleSchemes || []
    if (schemes.length === 0) {
      navigate('/check-eligibility')
      return
    }
    setAllSchemes(schemes)
    setFilteredSchemes(schemes)
  }, [location.state])

  useEffect(() => {
    applyFiltersAndSearch()
  }, [searchQuery, filters, allSchemes])

  const applyFiltersAndSearch = () => {
    let result = [...allSchemes]

    // Apply search
    if (searchQuery.trim()) {
      result = searchSchemes(result, searchQuery, language)
    }

    // Apply filters
    result = filterSchemes(result, filters)

    setFilteredSchemes(result)
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters(prev => ({ ...prev, [name]: value }))
  }

  const clearFilters = () => {
    setFilters({
      scheme_type: '',
      ministry: '',
      min_benefit: '',
      max_benefit: ''
    })
    setSearchQuery('')
  }

  const hasActiveFilters = Object.values(filters).some(v => v !== '') || searchQuery !== ''

  return (
    <div className="min-h-[calc(100vh-4rem)] py-8">
      <div className="container-custom">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3 gradient-text">
            {t('eligibleSchemes', language)}
          </h1>
          <p className="text-lg text-neutral-600">
            {language === 'hi'
              ? `हमें आपके लिए ${filteredSchemes.length} योजनाएं मिलीं`
              : `We found ${filteredSchemes.length} schemes for you`}
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            {/* Search */}
            <div className="flex-1">
              <Input
                type="text"
                placeholder={language === 'hi' ? 'योजना खोजें...' : 'Search schemes...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mb-0"
              />
            </div>

            {/* Filter Toggle Button (Mobile) */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden"
            >
              <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              {t('filter', language)}
            </Button>
          </div>

          {/* Filters */}
          <div className={`${showFilters ? 'block' : 'hidden'} md:block`}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-5 bg-neutral-50 rounded-2xl border border-neutral-200">
              <Select
                label={t('schemeType', language)}
                name="scheme_type"
                value={filters.scheme_type}
                onChange={handleFilterChange}
                options={SCHEME_TYPES}
                className="mb-0"
              />

              <Select
                label={t('ministry', language)}
                name="ministry"
                value={filters.ministry}
                onChange={handleFilterChange}
                options={MINISTRIES}
                className="mb-0"
              />

              <Input
                label={language === 'hi' ? 'न्यूनतम लाभ (₹)' : 'Min Benefit (₹)'}
                type="number"
                name="min_benefit"
                value={filters.min_benefit}
                onChange={handleFilterChange}
                placeholder="0"
                className="mb-0"
              />

              <Input
                label={language === 'hi' ? 'अधिकतम लाभ (₹)' : 'Max Benefit (₹)'}
                type="number"
                name="max_benefit"
                value={filters.max_benefit}
                onChange={handleFilterChange}
                placeholder="1000000"
                className="mb-0"
              />
            </div>

            {hasActiveFilters && (
              <div className="mt-4 flex justify-end">
                <Button variant="ghost" onClick={clearFilters} className="text-sm">
                  {t('clearFilters', language)}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        {filteredSchemes.length > 0 ? (
          <div className="scheme-grid">
            {filteredSchemes.map((scheme) => (
              <SchemeCard
                key={scheme.id}
                scheme={scheme}
                showMatchScore={true}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-soft p-12 text-center">
            <div className="w-20 h-20 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <svg className="w-10 h-10 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-neutral-700 mb-3">{t('noResults', language)}</h3>
            <p className="text-neutral-500 mb-6">
              {hasActiveFilters
                ? (language === 'hi' ? 'फ़िल्टर बदलने का प्रयास करें' : 'Try adjusting your filters')
                : t('tryAdjusting', language)}
            </p>
            {hasActiveFilters && (
              <Button variant="primary" onClick={clearFilters}>
                {t('clearFilters', language)}
              </Button>
            )}
          </div>
        )}

        {/* Back to Dashboard */}
        <div className="mt-8 text-center">
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            ← {language === 'hi' ? 'डैशबोर्ड पर वापस जाएं' : 'Back to Dashboard'}
          </Button>
        </div>
      </div>
    </div>
  )
}
