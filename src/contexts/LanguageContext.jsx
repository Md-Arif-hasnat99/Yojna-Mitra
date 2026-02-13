import { createContext, useContext, useState, useEffect } from 'react'
import { STORAGE_KEYS } from '../utils/constants'

const LanguageContext = createContext({})

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return context
}

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    // Try to get from localStorage first
    const saved = localStorage.getItem(STORAGE_KEYS.language)
    return saved || 'en' // Default to English
  })

  useEffect(() => {
    // Save to localStorage whenever language changes
    localStorage.setItem(STORAGE_KEYS.language, language)
  }, [language])

  const setLanguage = (lang) => {
    if (lang === 'en' || lang === 'hi') {
      setLanguageState(lang)
    }
  }

  const toggleLanguage = () => {
    setLanguageState(prev => prev === 'en' ? 'hi' : 'en')
  }

  const value = {
    language,
    setLanguage,
    toggleLanguage,
    isHindi: language === 'hi',
    isEnglish: language === 'en'
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}
