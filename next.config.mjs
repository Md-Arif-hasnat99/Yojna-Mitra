/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure src/ directory is used
  // Strict mode for catching issues early
  reactStrictMode: true,

  // Redirect legacy Vite-era routes to new App Router paths
  async redirects() {
    return [
      { source: '/complete-profile', destination: '/profile', permanent: true },
      { source: '/check-eligibility', destination: '/eligibility', permanent: true },
      { source: '/saved-schemes', destination: '/saved', permanent: true },
      { source: '/admin/login', destination: '/admin/login', permanent: false },
    ]
  },
}

export default nextConfig
