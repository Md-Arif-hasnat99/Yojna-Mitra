import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { LanguageProvider } from './contexts/LanguageContext'
import Navbar from './components/common/Navbar'
import SetupBanner from './components/common/SetupBanner'
import ProtectedRoute from './components/auth/ProtectedRoute'
import AdminRoute from './components/admin/AdminRoute'

// Pages
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import Dashboard from './pages/Dashboard'
import CompleteProfilePage from './pages/CompleteProfilePage'
import CheckEligibilityPage from './pages/CheckEligibilityPage'
import ResultsPage from './pages/ResultsPage'
import SavedSchemesPage from './pages/SavedSchemesPage'
import AdminLoginPage from './pages/AdminLoginPage'
import AdminPanelPage from './pages/AdminPanelPage'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LanguageProvider>
          <SetupBanner />
          <div className="min-h-screen bg-neutral-50">
            <Navbar />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/admin/login" element={<AdminLoginPage />} />

              {/* Protected User Routes */}
              <Route
                path="/complete-profile"
                element={
                  <ProtectedRoute>
                    <CompleteProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/check-eligibility"
                element={
                  <ProtectedRoute>
                    <CheckEligibilityPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/results"
                element={
                  <ProtectedRoute>
                    <ResultsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/saved-schemes"
                element={
                  <ProtectedRoute>
                    <SavedSchemesPage />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminPanelPage />
                  </AdminRoute>
                }
              />
            </Routes>
          </div>
        </LanguageProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
