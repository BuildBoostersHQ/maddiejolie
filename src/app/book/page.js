import { BRAND_LINKS } from '@/lib/constants'

export const metadata = {
  title: 'Book a Call | maddiejolie',
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
          background: linear-gradient(180deg, #0d1e30 0%, #091624 40%, #050c16 100%);
          color: #4fc3f7;
          -webkit-font-smoothing: antialiased;
          line-height: 1.6;
          min-height: 100vh;
          position: relative;
          overflow-x: hidden;
        }
        .bp-grid {
          position: fixed; top: 0; left: 0; width: 100%; height: 100%;
          pointer-events: none; z-index: 0;
          background-image:
            linear-gradient(rgba(79,195,247,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(79,195,247,0.04) 1px, transparent 1px);
          background-size: 60px 60px;
        }
        .bp-z { position: relative; z-index: 1; }

        /* Nav */
        .bp-nav {
          max-width: 960px; margin: 0 auto; padding: 20px 24px;
          display: flex; align-items: center; justify-content: space-between;
        }
        .bp-logo {
          font-weight: 800; font-size: 20px; letter-spacing: -0.02em;
          color: #4fc3f7; text-decoration: none;
        }
        .bp-back {
          font-size: 13px; font-weight: 600; color: rgba(79,195,247,0.5);
          text-decoration: none; transition: color 0.15s;
        }
        .bp-back:hover { color: rgba(79,195,247,0.8); }

        /* Hero */
        .bp-hero {
          text-align: center;
          padding: 50px 24px 36px;
          max-width: 580px;
          margin: 0 auto;
        }
        .bp-photo {
          width: 90px; height: 90px; border-radius: 50%;
          object-fit: cover; object-position: center 20%;
          margin: 0 auto 20px;
          display: block;
          border: 3px solid rgba(255,255,255,0.3);
          box-shadow: 0 4px 24px rgba(0,0,0,0.12);
        }
        .bp-wave {
          font-size: 14px; font-weight: 600;
          color: rgba(79,195,247,0.7); margin-bottom: 12px;
        }
        .bp-hero h1 {
          font-size: clamp(24px, 4.5vw, 36px); font-weight: 800;
          line-height: 1.2; letter-spacing: -0.025em;
          margin-bottom: 16px; color: #fff;
        }
        .bp-hero h1 em { font-style: italic; color: #4fc3f7; }
        .bp-sub {
          font-size: 15px; color: rgba(79,195,247,0.65);
          max-width: 460px; margin: 0 auto 20px; line-height: 1.7;
        }

        /* Badges */
        .bp-badges {
          display: flex; justify-content: center; gap: 10px;
          flex-wrap: wrap;
        }
        .bp-badge {
          font-size: 12px; font-weight: 600; color: #4fc3f7;
          background: rgba(255,255,255,0.08);
          backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
          padding: 8px 18px; border-radius: 100px;
          border: 1px solid rgba(255,255,255,0.1);
        }

        /* Calendar */
        .bp-cal-wrap {
          max-width: 640px; margin: 0 auto; padding: 0 24px 32px;
        }
        .bp-cal {
          background: #0f1f33;
          border: 1px solid rgba(79,195,247,0.12);
          border-radius: 16px;
          overflow: hidden;
        }
        .bp-cal iframe {
          width: 100%;
          height: 700px;
          border: none;
          display: block;
        }

        /* Footer */
        .bp-foot {
          text-align: center; padding: 16px 0 40px;
        }
        .bp-foot p {
          font-size: 12px; color: rgba(79,195,247,0.25);
        }

        @media (max-width: 600px) {
          .bp-hero { padding: 36px 20px 28px; }
          .bp-photo { width: 76px; height: 76px; }
          .bp-cal iframe { height: 620px; }
        }
      `}</style>

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
                allow="payment"
              />
            </div>
          </div>

          <div className="bp-foot">
            <p>maddiejolie · miami, fl</p>
          </div>

        </div>
      </div>
    </>
  )
}
