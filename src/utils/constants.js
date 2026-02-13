// Indian States and Union Territories
export const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry'
]

// Categories
export const CATEGORIES = [
  'General',
  'SC',
  'ST',
  'OBC'
]

// Genders
export const GENDERS = [
  'Male',
  'Female',
  'Other'
]

// Occupations
export const OCCUPATIONS = [
  'Farmer',
  'Student',
  'Entrepreneur',
  'Self-employed',
  'Unemployed',
  'Salaried Employee',
  'Daily Wage Worker',
  'Other'
]

// Income Brackets
export const INCOME_BRACKETS = [
  'Below ₹50,000',
  '₹50,000 - ₹1,00,000',
  '₹1,00,000 - ₹2,50,000',
  '₹2,50,000 - ₹5,00,000',
  '₹5,00,000 - ₹10,00,000',
  'Above ₹10,00,000'
]

// Scheme Types
export const SCHEME_TYPES = [
  { value: 'central', label: 'Central Government' },
  { value: 'state', label: 'State Government' }
]

// Scheme Status
export const SCHEME_STATUS = [
  { value: 'interested', label: 'Interested', color: 'blue' },
  { value: 'applied', label: 'Applied', color: 'yellow' },
  { value: 'received', label: 'Received', color: 'green' }
]

// Languages
export const LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' }
]

// Ministries (sample list - can be expanded)
export const MINISTRIES = [
  'Ministry of Agriculture and Farmers Welfare',
  'Ministry of Education',
  'Ministry of Health and Family Welfare',
  'Ministry of Housing and Urban Affairs',
  'Ministry of Labour and Employment',
  'Ministry of Rural Development',
  'Ministry of Social Justice and Empowerment',
  'Ministry of Women and Child Development',
  'Ministry of Micro, Small and Medium Enterprises',
  'Ministry of Skill Development and Entrepreneurship'
]

// Form validation rules
export const VALIDATION_RULES = {
  name: {
    minLength: 2,
    maxLength: 100,
    pattern: /^[a-zA-Z\s]+$/
  },
  phone: {
    pattern: /^[6-9]\d{9}$/,
    message: 'Please enter a valid 10-digit mobile number'
  },
  age: {
    min: 0,
    max: 120
  },
  familySize: {
    min: 1,
    max: 50
  }
}

// API Endpoints (if using custom backend)
export const API_ENDPOINTS = {
  schemes: '/api/schemes',
  userProfile: '/api/user/profile',
  savedSchemes: '/api/user/saved-schemes',
  admin: '/api/admin'
}

// Local Storage Keys
export const STORAGE_KEYS = {
  language: 'yojnamitra_language',
  userProfile: 'yojnamitra_user_profile',
  lastSearch: 'yojnamitra_last_search'
}

// Pagination
export const ITEMS_PER_PAGE = 12

// Toast/Notification Duration
export const TOAST_DURATION = 3000

// Debounce Delay for Search
export const SEARCH_DEBOUNCE_DELAY = 300
