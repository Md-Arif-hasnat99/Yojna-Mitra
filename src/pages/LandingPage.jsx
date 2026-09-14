'use client'

import Link from 'next/link'
import { useLanguage } from '../contexts/LanguageContext'
import { t } from '../utils/translations'
import Button from '../components/common/Button'
import Card from '../components/common/Card'

export default function LandingPage() {
  const { language } = useLanguage()

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-accent text-white py-24 md:py-32">
        
        <div className="container-app">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 border border-white/30 px-4 py-2 rounded mb-8 text-sm font-medium">
              <span className="w-2 h-2 bg-white rounded-full" aria-hidden="true"></span>
              {language === 'hi' ? 'भारत का #1 योजना खोज मंच' : 'India\'s #1 Scheme Discovery Platform'}
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
              {t('heroTitle', language)}
            </h1>
            <p className="text-xl md:text-2xl mb-10 opacity-95 leading-relaxed max-w-3xl mx-auto">
              {t('heroSubtitle', language)}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/signup">
                <Button size="lg" variant="secondary" className="shadow-large">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  {t('getStarted', language)}
                </Button>
              </Link>
              <a href="#how-it-works">
                <Button size="lg" variant="ghost" className="text-white border-2 border-white/30 hover:bg-white/10 hover:border-white/50">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {t('learnMore', language)}
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white relative">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="text-5xl font-black text-accent mb-2">50+</div>
              <div className="text-neutral-600 text-lg font-semibold">{t('statsSchemes', language)}</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-black text-accent mb-2">5K+</div>
              <div className="text-neutral-600 text-lg font-semibold">{t('statsUsers', language)}</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-black text-accent mb-2">₹10Cr+</div>
              <div className="text-neutral-600 text-lg font-semibold">{t('statsBenefit', language)}</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 bg-neutral-50">
        <div className="container-app">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold text-neutral-900 mb-4">
              {t('howItWorks', language)}
            </h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              {language === 'hi' ? 'सिर्फ 3 आसान चरणों में अपनी योजनाएं खोजें' : 'Find your schemes in just 3 simple steps'}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Step 1 */}
            <div className="relative">
              <Card variant="hover" className="text-center h-full">
                <div className="relative inline-flex items-center justify-center w-20 h-20 bg-accent rounded-xl mx-auto mb-6">
                  <span className="text-white text-3xl font-black">1</span>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-3 text-neutral-900">{t('step1Title', language)}</h3>
                <p className="text-neutral-600 leading-relaxed">{t('step1Desc', language)}</p>
              </Card>
              {/* Connector Line */}
              <div className="hidden md:block absolute top-10 left-full w-full h-px bg-neutral-200 -translate-x-1/2" aria-hidden="true"></div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <Card variant="hover" className="text-center h-full">
                <div className="relative inline-flex items-center justify-center w-20 h-20 bg-accent rounded-xl mx-auto mb-6">
                  <span className="text-white text-3xl font-black">2</span>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-3 text-neutral-900">{t('step2Title', language)}</h3>
                <p className="text-neutral-600 leading-relaxed">{t('step2Desc', language)}</p>
              </Card>
              {/* Connector Line */}
              <div className="hidden md:block absolute top-10 left-full w-full h-px bg-neutral-200 -translate-x-1/2" aria-hidden="true"></div>
            </div>

            {/* Step 3 */}
            <Card variant="hover" className="text-center h-full">
              <div className="relative inline-flex items-center justify-center w-20 h-20 bg-accent rounded-xl mx-auto mb-6">
                <span className="text-white text-3xl font-black">3</span>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-neutral-900">{t('step3Title', language)}</h3>
              <p className="text-neutral-600 leading-relaxed">{t('step3Desc', language)}</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="container-app">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold text-neutral-900 mb-4">
              {t('featuresTitle', language)}
            </h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              {language === 'hi' ? 'आपकी सुविधा के लिए शक्तिशाली सुविधाएँ' : 'Powerful features designed for your convenience'}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Feature 1 */}
            <Card variant="hover" className="group">
              <div className="w-14 h-14 bg-accent rounded flex items-center justify-center mb-5">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-neutral-900">{t('feature1Title', language)}</h3>
              <p className="text-neutral-600 leading-relaxed">{t('feature1Desc', language)}</p>
            </Card>

            {/* Feature 2 */}
            <Card variant="hover" className="group">
              <div className="w-14 h-14 bg-accent rounded flex items-center justify-center mb-5">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-neutral-900">{t('feature2Title', language)}</h3>
              <p className="text-neutral-600 leading-relaxed">{t('feature2Desc', language)}</p>
            </Card>

            {/* Feature 3 */}
            <Card variant="hover" className="group">
              <div className="w-14 h-14 bg-accent rounded flex items-center justify-center mb-5">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-neutral-900">{t('feature3Title', language)}</h3>
              <p className="text-neutral-600 leading-relaxed">{t('feature3Desc', language)}</p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-accent text-white">
        
        <div className="container-app text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6">
            {language === 'hi' ? 'आज ही शुरू करें' : 'Get Started Today'}
          </h2>
          <p className="text-xl md:text-2xl mb-10 opacity-95 max-w-2xl mx-auto">
            {language === 'hi' 
              ? 'अपने लिए सरकारी योजनाएं खोजें और लाभ उठाएं'
              : 'Discover government schemes and benefits tailored for you'}
          </p>
          <Link to="/signup">
            <Button size="lg" variant="secondary" className="shadow-large">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
              {t('getStarted', language)}
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-900 text-white py-12">
        <div className="container-custom">
          <div className="text-center">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-white/20 rounded flex items-center justify-center">
                <span className="text-white font-bold text-xl" aria-hidden="true">य</span>
              </div>
              <span className="text-2xl font-extrabold text-white">
                {t('appName', language)}
              </span>
            </div>
            
            <p className="text-sm text-neutral-400 mb-3 max-w-2xl mx-auto">
              {t('disclaimer', language)}
            </p>
            <p className="text-xs text-neutral-500 mb-8 max-w-2xl mx-auto">
              {t('disclaimerText', language)}
            </p>
            
            <div className="border-t border-neutral-800 pt-8">
              <p className="text-neutral-400 text-sm">
                © 2026 {t('appName', language)}. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
