/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  async redirects() {
    return [
      { source: '/calendar', destination: '/book', permanent: true },
      { source: '/demo', destination: '/book', permanent: true },
    ]
  },
}

module.exports = nextConfig
