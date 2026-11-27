/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  async redirects() {
    return [
      { source: '/calendar', destination: '/book', permanent: true },
      { source: '/demo', destination: '/book', permanent: true },
      { source: '/landing.html', destination: '/', permanent: true },
      { source: '/landing', destination: '/', permanent: true },
    ]
  },
  // Serve the Umami tracking script from this domain so ad blockers are less
  // likely to block it. Off until UMAMI_HOST is set (e.g. https://umami-yq1l.vercel.app).
  async rewrites() {
    const host = process.env.UMAMI_HOST
    if (!host) return []
    return [
      { source: '/_m/s.js', destination: `${host}/script.js` },
      { source: '/_m/api/send', destination: `${host}/api/send` },
    ]
  },
}

module.exports = nextConfig
