import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  
  // Demo mode: Allow access if Supabase is not configured
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const isDemoMode = !supabaseUrl || supabaseUrl.includes('your_supabase')

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    )
  }

  // In demo mode, allow access without authentication
  if (isDemoMode) {
    return (
      <div>
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
          <p className="font-bold">Demo Mode</p>
          <p className="text-sm">This page requires authentication. Set up Supabase to enable full functionality.</p>
        </div>
        {children}
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}
