export default function SetupBanner() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  
  // Don't show banner if Supabase is properly configured
  if (supabaseUrl && !supabaseUrl.includes('your_supabase')) {
    return null
  }

  return (
    <div className="bg-secondary-600 text-white py-3 px-4 text-center">
      <div className="container-custom">
        <p className="text-sm md:text-base font-semibold">
          ⚠️ Supabase Not Configured - 
          <span className="ml-2">
            Please update <code className="bg-white/20 px-2 py-1 rounded">.env.local</code> with your Supabase credentials
          </span>
          <span className="ml-2">
            📖 See <code className="bg-white/20 px-2 py-1 rounded">SETUP_GUIDE.md</code> for instructions
          </span>
        </p>
      </div>
    </div>
  )
}
