export const metadata = {
  title: 'You're booked! | maddiejolie',
  description: 'Thanks for booking a call with Maddie.',
}

export default function ThankYouPage() {
  return (
    <div className="bp">
      <div className="bp-grid" />
      <div className="bp-z">

        <nav className="bp-nav">
          <a href="/" className="bp-logo">maddiejolie</a>
        </nav>

        <div className="bp-hero">
          <img className="bp-photo" src="/photo.jpg" alt="Maddie" width="90" height="90" />
          <div className="bp-wave">you're all set!</div>
          <h1>Can't wait to <em>talk to you</em></h1>
          <p className="bp-sub">
            You should get a confirmation in your email. I'm going to do a little
            more research on your business before we chat so I can show you
            exactly what I'd do for you. Talk soon!
          </p>
          <div className="bp-badges">
            <span className="bp-badge">Check your email for details</span>
          </div>
        </div>

        <div className="bp-foot">
          <p>maddiejolie · miami, fl</p>
        </div>

      </div>
    </div>
  )
}
