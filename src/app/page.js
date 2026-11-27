import { readFileSync } from 'fs'
import { join } from 'path'

// Serve the landing page at the root URL instead of redirecting to /landing.html.
export const metadata = {
  title: 'Maddie Jolie | websites and lead systems for contractors',
  description: 'Websites and lead systems for roofers, HVAC companies, plumbers, painters, and handymen. $79/mo, no contracts.',
  robots: 'index, follow',
  openGraph: {
    title: 'Maddie Jolie | websites and lead systems for contractors',
    description: 'When Melissa needs a contractor, she is going to Google it. I make sure she finds you. $79/mo, no contracts.',
    url: 'https://maddiejolie.com',
    images: [{ url: 'https://maddiejolie.com/photo.jpg' }],
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Maddie Jolie | websites for contractors',
    description: 'When Melissa needs a contractor, she is going to Google it. I make sure she finds you.',
    images: ['https://maddiejolie.com/photo.jpg'],
  },
}

export default function Home() {
  let html = ''
  try {
    const raw = readFileSync(join(process.cwd(), 'public', 'landing.html'), 'utf8')
    const bodyMatch = raw.match(/<body[^>]*>([\s\S]*)<\/body>/i)
    const styleMatch = raw.match(/<style>([\s\S]*?)<\/style>/gi)
    const styles = styleMatch ? styleMatch.join('\n') : ''
    const linkMatch = raw.match(/<link[^>]*fonts[^>]*>/gi)
    const links = linkMatch ? linkMatch.join('\n') : ''
    html = (links || '') + (styles || '') + (bodyMatch ? bodyMatch[1] : raw)
  } catch {
    html = '<p>Landing page not found</p>'
  }
  return <div dangerouslySetInnerHTML={{ __html: html }} />
}
