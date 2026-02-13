import { useState, useEffect } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { t } from '../utils/translations'
import { supabase } from '../lib/supabase'
import { INDIAN_STATES, CATEGORIES, SCHEME_TYPES, MINISTRIES } from '../utils/constants'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import Select from '../components/common/Select'

export default function AdminPanelPage() {
  const { language } = useLanguage()
  const [activeTab, setActiveTab] = useState('dashboard') // dashboard, schemes, add
  const [stats, setStats] = useState({
    totalSchemes: 0,
    activeSchemes: 0,
    totalUsers: 0,
    checksToday: 0
  })
  const [schemes, setSchemes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)

  // Add Scheme Form State
  const [formData, setFormData] = useState({
    scheme_name: '',
    scheme_name_hi: '',
    description: '',
    description_hi: '',
    benefit_amount: '',
    scheme_type: 'central',
    ministry: '',
    application_link: '',
    applicable_states: [],
    age_min: 0,
    age_max: 100,
    income_max: '',
    categories: [],
    occupation: '',
    gender: '',
    documents_required: '',
    documents_required_hi: '',
    is_active: true
  })

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setLoading(true)

    // Load stats
    const { data: schemesData } = await supabase
      .from('schemes')
      .select('*')

    const { data: usersData } = await supabase
      .from('user_profiles')
      .select('id')

    const { data: checksData } = await supabase
      .from('scheme_checks')
      .select('id')
      .gte('created_at', new Date().toISOString().split('T')[0])

    setStats({
      totalSchemes: schemesData?.length || 0,
      activeSchemes: schemesData?.filter(s => s.is_active).length || 0,
      totalUsers: usersData?.length || 0,
      checksToday: checksData?.length || 0
    })

    setSchemes(schemesData || [])
    setLoading(false)
  }

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleMultiSelect = (name, value) => {
    setFormData(prev => {
      const current = prev[name] || []
      if (current.includes(value)) {
        return { ...prev, [name]: current.filter(v => v !== value) }
      } else {
        return { ...prev, [name]: [...current, value] }
      }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const eligibilityCriteria = {
      age_min: parseInt(formData.age_min) || 0,
      age_max: parseInt(formData.age_max) || 100,
      income_max: formData.income_max ? parseInt(formData.income_max) : null,
      categories: formData.categories,
      states: formData.applicable_states.length > 0 ? formData.applicable_states : ['All States'],
      occupation: formData.occupation || null,
      gender: formData.gender || null,
      special_conditions: []
    }

    const schemeData = {
      scheme_name: formData.scheme_name,
      scheme_name_hi: formData.scheme_name_hi,
      description: formData.description,
      description_hi: formData.description_hi,
      benefit_amount: formData.benefit_amount,
      scheme_type: formData.scheme_type,
      ministry: formData.ministry,
      application_link: formData.application_link,
      applicable_states: formData.applicable_states.length > 0 ? formData.applicable_states : ['All States'],
      eligibility_criteria: eligibilityCriteria,
      documents_required: formData.documents_required.split(',').map(d => d.trim()).filter(d => d),
      documents_required_hi: formData.documents_required_hi.split(',').map(d => d.trim()).filter(d => d),
      is_active: formData.is_active
    }

    const { error } = await supabase
      .from('schemes')
      .insert(schemeData)

    if (!error) {
      alert(t('schemeAdded', language))
      setShowAddForm(false)
      setFormData({
        scheme_name: '',
        scheme_name_hi: '',
        description: '',
        description_hi: '',
        benefit_amount: '',
        scheme_type: 'central',
        ministry: '',
        application_link: '',
        applicable_states: [],
        age_min: 0,
        age_max: 100,
        income_max: '',
        categories: [],
        occupation: '',
        gender: '',
        documents_required: '',
        documents_required_hi: '',
        is_active: true
      })
      loadDashboardData()
    } else {
      alert('Error adding scheme: ' + error.message)
    }
  }

  const toggleSchemeStatus = async (schemeId, currentStatus) => {
    const { error } = await supabase
      .from('schemes')
      .update({ is_active: !currentStatus })
      .eq('id', schemeId)

    if (!error) {
      loadDashboardData()
    }
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
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2 text-secondary-600">
            {t('adminPanel', language)}
          </h1>
          <p className="text-lg text-neutral-600">
            {language === 'hi' ? 'योजनाओं का प्रबंधन करें' : 'Manage government schemes'}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-neutral-200">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 font-semibold transition-colors border-b-2 ${
              activeTab === 'dashboard'
                ? 'border-secondary-600 text-secondary-600'
                : 'border-transparent text-neutral-600 hover:text-neutral-900'
            }`}
          >
            {t('dashboard', language)}
          </button>
          <button
            onClick={() => setActiveTab('schemes')}
            className={`px-4 py-2 font-semibold transition-colors border-b-2 ${
              activeTab === 'schemes'
                ? 'border-secondary-600 text-secondary-600'
                : 'border-transparent text-neutral-600 hover:text-neutral-900'
            }`}
          >
            {t('schemeManagement', language)}
          </button>
          <button
            onClick={() => setActiveTab('add')}
            className={`px-4 py-2 font-semibold transition-colors border-b-2 ${
              activeTab === 'add'
                ? 'border-secondary-600 text-secondary-600'
                : 'border-transparent text-neutral-600 hover:text-neutral-900'
            }`}
          >
            {t('addNewScheme', language)}
          </button>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="bg-gradient-to-br from-primary-600 to-primary-500 text-white">
                <div className="text-4xl font-bold mb-2">{stats.totalSchemes}</div>
                <div className="text-sm opacity-90">{t('totalSchemes', language)}</div>
              </Card>

              <Card className="bg-gradient-to-br from-emerald-600 to-emerald-500 text-white">
                <div className="text-4xl font-bold mb-2">{stats.activeSchemes}</div>
                <div className="text-sm opacity-90">{t('activeSchemes', language)}</div>
              </Card>

              <Card className="bg-gradient-to-br from-secondary-600 to-secondary-500 text-white">
                <div className="text-4xl font-bold mb-2">{stats.totalUsers}</div>
                <div className="text-sm opacity-90">{t('totalUsers', language)}</div>
              </Card>

              <Card className="bg-gradient-to-br from-amber-600 to-amber-500 text-white">
                <div className="text-4xl font-bold mb-2">{stats.checksToday}</div>
                <div className="text-sm opacity-90">
                  {language === 'hi' ? 'आज की जांच' : 'Checks Today'}
                </div>
              </Card>
            </div>

            <Card>
              <h3 className="text-xl font-bold mb-4">{t('recentActivity', language)}</h3>
              <p className="text-neutral-600">
                {language === 'hi'
                  ? 'हाल की गतिविधि यहां दिखाई देगी'
                  : 'Recent activity will be displayed here'}
              </p>
            </Card>
          </div>
        )}

        {/* Schemes Management Tab */}
        {activeTab === 'schemes' && (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-700">
                      {t('schemeName', language)}
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-700">
                      {t('schemeType', language)}
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-700">
                      {t('benefit', language)}
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-700">
                      {t('status', language)}
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-700">
                      {language === 'hi' ? 'क्रियाएं' : 'Actions'}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {schemes.map((scheme) => (
                    <tr key={scheme.id} className="hover:bg-neutral-50">
                      <td className="px-4 py-3 text-sm">{scheme.scheme_name}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`badge ${scheme.scheme_type === 'central' ? 'badge-info' : 'badge-warning'}`}>
                          {scheme.scheme_type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-secondary-600">
                        {scheme.benefit_amount}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`badge ${scheme.is_active ? 'badge-success' : 'bg-neutral-200 text-neutral-700'}`}>
                          {scheme.is_active ? (language === 'hi' ? 'सक्रिय' : 'Active') : (language === 'hi' ? 'निष्क्रिय' : 'Inactive')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <button
                          onClick={() => toggleSchemeStatus(scheme.id, scheme.is_active)}
                          className="text-primary-600 hover:underline mr-3"
                        >
                          {scheme.is_active ? (language === 'hi' ? 'निष्क्रिय करें' : 'Deactivate') : (language === 'hi' ? 'सक्रिय करें' : 'Activate')}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Add Scheme Tab */}
        {activeTab === 'add' && (
          <Card>
            <h2 className="text-2xl font-bold mb-6 gradient-text">{t('addNewScheme', language)}</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  {language === 'hi' ? 'बुनियादी जानकारी' : 'Basic Information'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label={t('schemeName', language) + ' (English)'}
                    name="scheme_name"
                    value={formData.scheme_name}
                    onChange={handleFormChange}
                    required
                  />
                  <Input
                    label={t('schemeNameHindi', language)}
                    name="scheme_name_hi"
                    value={formData.scheme_name_hi}
                    onChange={handleFormChange}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="input-label">{t('description', language)} (English)</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleFormChange}
                      className="input-field"
                      rows="3"
                      required
                    />
                  </div>
                  <div>
                    <label className="input-label">{t('schemeDescriptionHindi', language)}</label>
                    <textarea
                      name="description_hi"
                      value={formData.description_hi}
                      onChange={handleFormChange}
                      className="input-field"
                      rows="3"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label={t('benefitDetails', language)}
                    name="benefit_amount"
                    value={formData.benefit_amount}
                    onChange={handleFormChange}
                    placeholder="₹10,000"
                    required
                  />
                  <Select
                    label={t('schemeType', language)}
                    name="scheme_type"
                    value={formData.scheme_type}
                    onChange={handleFormChange}
                    options={SCHEME_TYPES}
                    required
                  />
                  <Select
                    label={t('ministry', language)}
                    name="ministry"
                    value={formData.ministry}
                    onChange={handleFormChange}
                    options={MINISTRIES}
                    required
                  />
                </div>

                <Input
                  label={t('applicationLink', language)}
                  name="application_link"
                  value={formData.application_link}
                  onChange={handleFormChange}
                  placeholder="https://..."
                  required
                />
              </div>

              {/* Eligibility Criteria */}
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  {t('eligibilityCriteria', language)}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label={language === 'hi' ? 'न्यूनतम आयु' : 'Min Age'}
                    type="number"
                    name="age_min"
                    value={formData.age_min}
                    onChange={handleFormChange}
                    min="0"
                  />
                  <Input
                    label={language === 'hi' ? 'अधिकतम आयु' : 'Max Age'}
                    type="number"
                    name="age_max"
                    value={formData.age_max}
                    onChange={handleFormChange}
                    min="0"
                  />
                  <Input
                    label={language === 'hi' ? 'अधिकतम आय' : 'Max Income'}
                    type="number"
                    name="income_max"
                    value={formData.income_max}
                    onChange={handleFormChange}
                    placeholder="500000"
                  />
                </div>

                <div className="mb-4">
                  <label className="input-label">{t('category', language)}</label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map(cat => (
                      <label key={cat} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.categories.includes(cat)}
                          onChange={() => handleMultiSelect('categories', cat)}
                          className="rounded"
                        />
                        <span>{cat}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="input-label">{t('applicableStates', language)}</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-40 overflow-y-auto p-2 border rounded">
                    {INDIAN_STATES.slice(0, 10).map(state => (
                      <label key={state} className="flex items-center gap-2 cursor-pointer text-sm">
                        <input
                          type="checkbox"
                          checked={formData.applicable_states.includes(state)}
                          onChange={() => handleMultiSelect('applicable_states', state)}
                          className="rounded"
                        />
                        <span>{state}</span>
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-neutral-500 mt-1">
                    {language === 'hi' ? 'खाली छोड़ें = सभी राज्य' : 'Leave empty for all states'}
                  </p>
                </div>
              </div>

              {/* Documents */}
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  {t('documentsRequired', language)}
                </h3>
                <Input
                  label={language === 'hi' ? 'दस्तावेज़ (अंग्रेज़ी, अल्पविराम से अलग)' : 'Documents (English, comma-separated)'}
                  name="documents_required"
                  value={formData.documents_required}
                  onChange={handleFormChange}
                  placeholder="Aadhaar Card, Bank Account, Income Certificate"
                />
                <Input
                  label={language === 'hi' ? 'दस्तावेज़ (हिंदी, अल्पविराम से अलग)' : 'Documents (Hindi, comma-separated)'}
                  name="documents_required_hi"
                  value={formData.documents_required_hi}
                  onChange={handleFormChange}
                  placeholder="आधार कार्ड, बैंक खाता, आय प्रमाण पत्र"
                />
              </div>

              {/* Active Status */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleFormChange}
                  className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                />
                <label htmlFor="is_active" className="ml-2 text-sm font-medium text-neutral-700">
                  {t('isActive', language)}
                </label>
              </div>

              <Button type="submit" variant="primary" fullWidth>
                {t('addNewScheme', language)}
              </Button>
            </form>
          </Card>
        )}
      </div>
    </div>
  )
}
