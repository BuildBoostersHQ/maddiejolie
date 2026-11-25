import './globals.css'

export const metadata = {
  title: 'Maddie Jolie',
  description: 'Websites and lead systems for contractors',
  robots: 'noindex',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
