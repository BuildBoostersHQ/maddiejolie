import { redirect } from 'next/navigation'

// Root page redirects to the static landing page
// The landing page is at /landing.html (served from public/)
export default function Home() {
  redirect('/landing.html')
}
