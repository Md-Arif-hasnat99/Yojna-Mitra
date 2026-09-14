

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Redirect legacy Vite-era routes to new App Router paths
  async redirects() {
    return [
      { source: '/complete-profile', destination: '/profile', permanent: true },
      { source: '/check-eligibility', destination: '/eligibility', permanent: true },
      { source: '/saved-schemes', destination: '/saved', permanent: true },
    ]
  },
}

export default nextConfig

