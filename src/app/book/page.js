import { BRAND_LINKS } from '@/lib/constants'

export const metadata = {
  title: 'Book a Call — Madeleine Jolie',
  description: 'Schedule a quick call to see how a custom website can grow your contracting business.',
}

export default function BookPage() {
  const embedUrl = BRAND_LINKS.mj.calendarEmbed

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,700;1,800&display=swap');

        .bp * { margin: 0; padding: 0; box-sizing: border-box; }
        .bp {
          font-family: 'Plus Jakarta Sans', -apple-system, system-ui, sans-serif;
          background: #091624;
          color: #4fc3f7;
          -webkit-font-smoothing: antialiased;
          min-height: 100vh;
          position: relative;
          overflow-x: hidden;
        }

        /* Ambient glow behind the content */
        .bp::before {
          content: '';
          position: fixed;
          top: -20%;
          left: 50%;
          transform: translateX(-50%);
          width: 800px;
          height: 600px;
          background: radial-gradient(ellipse, rgba(79,195,247,0.06) 0%, rgba(245,166,35,0.03) 40%, transparent 70%);
          pointer-events: none;
          z-index: 0;
        }

        .bp-content { position: relative; z-index: 1; max-width: 540px; margin: 0 auto; padding: 0 20px; }

        /* Nav */
        .bp-nav {
          padding: 24px 0 0;
          text-align: center;
        }
        .bp-name {
          font-weight: 800;
          font-size: 15px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(79,195,247,0.4);
        }

        /* Hero */
        .bp-hero {
          text-align: center;
          padding: 48px 0 36px;
        }
        .bp-hero img {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          object-fit: cover;
          object-position: center 20%;
          margin-bottom: 24px;
          border: 2px solid rgba(255,255,255,0.15);
          box-shadow: 0 0 40px rgba(79,195,247,0.12), 0 4px 20px rgba(0,0,0,0.3);
        }
        .bp-wave {
          font-size: 14px;
          font-weight: 600;
          color: rgba(79,195,247,0.6);
          margin-bottom: 14px;
        }
        .bp-hero h1 {
          font-size: clamp(22px, 5vw, 30px);
          font-weight: 800;
          line-height: 1.25;
          letter-spacing: -0.025em;
          color: #fff;
          margin-bottom: 16px;
        }
        .bp-hero h1 em {
          font-style: italic;
          color: #4fc3f7;
        }
        .bp-desc {
          font-size: 14px;
          color: rgba(79,195,247,0.55);
          line-height: 1.75;
          max-width: 420px;
          margin: 0 auto;
        }

        /* Divider */
        .bp-divider {
          width: 60px;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(245,166,35,0.4), transparent);
          margin: 0 auto 36px;
        }

        /* Calendar section */
        .bp-cal-label {
          text-align: center;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: rgba(245,166,35,0.5);
          margin-bottom: 14px;
        }
        .bp-cal {
          background: #0d1a2a;
          border: 1px solid rgba(79,195,247,0.08);
          border-radius: 14px;
          overflow: hidden;
          box-shadow: 0 8px 40px rgba(0,0,0,0.3);
        }
        .bp-cal iframe {
          width: 100%;
          min-height: 620px;
          border: none;
          display: block;
        }

        /* Bottom note */
        .bp-bottom {
          text-align: center;
          padding: 28px 0 48px;
        }
        .bp-bottom p {
          font-size: 12px;
          color: rgba(79,195,247,0.2);
          line-height: 1.6;
        }

        @media (max-width: 600px) {
          .bp-hero { padding: 36px 0 28px; }
          .bp-hero img { width: 68px; height: 68px; }
          .bp-cal iframe { min-height: 580px; }
        }
      `}</style>

      <div className="bp">
        <div className="bp-content">

          <div className="bp-nav">
            <div className="bp-name">maddiejolie</div>
          </div>

          <div className="bp-hero">
            <img src="/photo.jpg" alt="Maddie" width="80" height="80" />
            <div className="bp-wave">hey, it's maddie!</div>
            <h1>So happy you liked <em>the site I built you</em></h1>
            <p className="bp-desc">
              I pulled your reviews, your photos, everything — and I really think
              it came out great. I'd love to hop on a quick 15-minute call, walk
              you through it, and show you a few things I think could really help
              your business. No pressure at all, just pick a time that works!
            </p>
          </div>

          <div className="bp-divider" />

          <div className="bp-cal-label">Pick a time</div>
          <div className="bp-cal">
            <iframe
              src={embedUrl}
              allow="payment"
              scrolling="no"
            />
          </div>

          <div className="bp-bottom">
            <p>maddiejolie · miami, fl</p>
          </div>

        </div>
      </div>
    </>
  )
}
