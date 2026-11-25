/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  async rewrites() {
    return [
      { source: '/', destination: '/landing.html' },
    ]
  },
  async redirects() {
    return [
      { source: '/calendar', destination: '/book', permanent: true },
      { source: '/demo', destination: '/book', permanent: true },
      { source: '/landing.html', destination: '/', permanent: true },
    ]
  },
}

module.exports = nextConfig
