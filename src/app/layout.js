import './globals.css'

export const metadata = {
  title: 'Maddie Jolie',
  description: 'Websites and lead systems for contractors',
  robots: 'index, follow',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
  },
  openGraph: {
    title: 'Maddie Jolie',
    description: 'Websites and lead systems for contractors',
    url: 'https://maddiejolie.com',
    siteName: 'Maddie Jolie',
    images: [
      {
        url: 'https://maddiejolie.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Maddie Jolie — websites and lead systems for contractors',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Maddie Jolie',
    description: 'Websites and lead systems for contractors',
    images: ['https://maddiejolie.com/og-image.png'],
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
