import { BRAND_LINKS } from '@/lib/constants'

export const metadata = {
  title: 'Book a Call | maddiejolie',
  description: 'Schedule a quick call to see how a custom website can grow your contracting business.',
}

export default function BookPage() {
  const embedUrl = BRAND_LINKS.mj.calendarEmbed

  return (
    <div className="bp">
      <div className="bp-grid" />
      <div className="bp-z">

        <nav className="bp-nav">
          <a href="/" className="bp-logo">maddiejolie</a>
          <a href="/" className="bp-back">back to site</a>
        </nav>

        <div className="bp-hero">
          <img className="bp-photo" src="/photo.jpg" alt="Maddie" width="90" height="90" />
          <div className="bp-wave">hey, it's maddie!</div>
          <h1>So happy you liked <em>the site I built you</em></h1>
          <p className="bp-sub">
            I had a lot of fun putting that together, your reviews are seriously
            impressive and I wanted to make sure the site showed that off. I'd love
            to hop on a quick call and walk you through everything. Pick a time
            below and let's chat!
          </p>
          <div className="bp-badges">
            <span className="bp-badge">15 min call</span>
            <span className="bp-badge">No pressure</span>
            <span className="bp-badge">Starts at $79/mo</span>
          </div>
        </div>

        <div className="bp-cal-wrap">
          <div className="bp-cal">
            <iframe
              src={embedUrl}
              scrolling="no"
              style={{ overflow: 'hidden' }}
              allow="payment"
            />
          </div>
        </div>

        <div className="bp-foot">
          <p>maddiejolie · miami, fl</p>
        </div>

      </div>
    </div>
  )
}
