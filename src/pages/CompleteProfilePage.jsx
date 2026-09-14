'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { t } from '../utils/translations'
import { INDIAN_STATES, CATEGORIES, GENDERS, OCCUPATIONS, INCOME_BRACKETS } from '../utils/constants'
import Input from '../components/common/Input'
import Select from '../components/common/Select'
import Button from '../components/common/Button'

export default function CompleteProfilePage() {
  const { profile, updateProfile } = useAuth()
  const { language } = useLanguage()
  const router = useRouter()

  const [formData, setFormData] = useState({
    phone_number: profile?.phone_number || '',
    age: profile?.age || '',
    gender: profile?.gender || '',
    state: profile?.state || '',
    district: profile?.district || '',
    category: profile?.category || '',
    occupation: profile?.occupation || '',
    income_bracket: profile?.income_bracket || '',
    family_size: profile?.family_size || '',
    has_bpl_card: profile?.has_bpl_card || false
  })

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const validate = () => {
    const newErrors = {}

    if (!formData.age || formData.age < 0 || formData.age > 120) {
      newErrors.age = t('invalidAge', language)
    }

    if (!formData.gender) {
      newErrors.gender = t('selectOption', language)
    }

    if (!formData.state) {
      newErrors.state = t('selectOption', language)
    }

    if (!formData.category) {
      newErrors.category = t('selectOption', language)
    }

    if (!formData.occupation) {
      newErrors.occupation = t('selectOption', language)
    }

    if (!formData.income_bracket) {
      newErrors.income_bracket = t('selectOption', language)
    }

    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setLoading(true)

    try {
      const { error } = await updateProfile({
        ...formData,
        age: parseInt(formData.age),
        family_size: formData.family_size ? parseInt(formData.family_size) : null
      })

      if (error) {
        console.error('Error updating profile:', error)
        // Check if it's a demo mode error
        if (error.message && error.message.includes('placeholder')) {
          alert('Demo Mode: Supabase is not configured. Please set up Supabase to save your profile.')
        } else {
          alert(`Error: ${error.message || 'Failed to save profile'}`)
        }
        setLoading(false)
        return
      }

      // Success - navigate to dashboard
      router.push('/dashboard')
    } catch (err) {
      console.error('Unexpected error:', err)
      alert('An unexpected error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-large p-8 md:p-10">
          <h1 className="text-3xl font-extrabold text-center mb-2 gradient-text">
            {t('personalDetails', language)}
          </h1>
          <p className="text-center text-neutral-600 mb-8">
            {t('fillDetails', language)}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label={t('phoneNumber', language)}
                type="tel"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                placeholder="9876543210"
              />

              <Input
                label={t('age', language)}
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                required
                error={errors.age}
                min="0"
                max="120"
              />

              <Select
                label={t('gender', language)}
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                options={GENDERS}
                required
                error={errors.gender}
              />

              <Select
                label={t('category', language)}
                name="category"
                value={formData.category}
                onChange={handleChange}
                options={CATEGORIES}
                required
                error={errors.category}
              />
            </div>

            {/* Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label={t('state', language)}
                name="state"
                value={formData.state}
                onChange={handleChange}
                options={INDIAN_STATES}
                required
                error={errors.state}
              />

              <Input
                label={t('district', language)}
                type="text"
                name="district"
                value={formData.district}
                onChange={handleChange}
              />
            </div>

            {/* Economic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label={t('occupation', language)}
                name="occupation"
                value={formData.occupation}
                onChange={handleChange}
                options={OCCUPATIONS}
                required
                error={errors.occupation}
              />

              <Select
                label={t('incomeBracket', language)}
                name="income_bracket"
                value={formData.income_bracket}
                onChange={handleChange}
                options={INCOME_BRACKETS}
                required
                error={errors.income_bracket}
              />

              <Input
                label={t('familySize', language)}
                type="number"
                name="family_size"
                value={formData.family_size}
                onChange={handleChange}
                min="1"
              />

              <div className="flex items-center mt-8">
                <input
                  type="checkbox"
                  id="has_bpl_card"
                  name="has_bpl_card"
                  checked={formData.has_bpl_card}
                  onChange={handleChange}
                  className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                />
                <label htmlFor="has_bpl_card" className="ml-2 text-sm font-medium text-neutral-700">
                  {t('hasBPLCard', language)}
                </label>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={loading}
              className="mt-8"
            >
              {loading ? t('loading', language) : t('submit', language)}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
