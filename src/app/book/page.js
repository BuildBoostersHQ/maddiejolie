import { BRAND_LINKS } from '@/lib/constants'

export const metadata = {
  title: 'Book a Call — Madeleine Jolie',
  description: 'Schedule a quick call to see how a custom website can grow your contracting business.',
}

export default function BookPage() {
  const embedUrl = BRAND_LINKS.mj.calendarEmbed

  return (
    <>
      {/* Match landing.html design system exactly */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,700;1,800&display=swap');

        .book-page * { margin: 0; padding: 0; box-sizing: border-box; }
        .book-page {
          font-family: 'Plus Jakarta Sans', -apple-system, system-ui, sans-serif;
          background: linear-gradient(180deg, #0d1e30 0%, #091624 40%, #050c16 100%);
          color: #4fc3f7;
          -webkit-font-smoothing: antialiased;
          line-height: 1.6;
          min-height: 100vh;
          position: relative;
          overflow-x: hidden;
        }
        .book-grid {
          position: fixed; top: 0; left: 0; width: 100%; height: 100%;
          pointer-events: none; z-index: 0;
          background-image:
            linear-gradient(rgba(79,195,247,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(79,195,247,0.04) 1px, transparent 1px);
          background-size: 60px 60px;
        }
        .book-content { position: relative; z-index: 1; }
        .book-wrap { max-width: 640px; margin: 0 auto; padding: 0 24px; }

        .book-nav {
          max-width: 960px; margin: 0 auto; padding: 20px 24px;
          display: flex; align-items: center; justify-content: space-between;
        }
        .book-logo {
          font-weight: 800; font-size: 20px; letter-spacing: -0.02em;
          color: #4fc3f7; display: flex; align-items: center; gap: 10px;
          text-decoration: none;
        }
        .book-logo span { opacity: 0.5; }
        .book-back {
          font-size: 13px; font-weight: 600; color: rgba(79,195,247,0.5);
          text-decoration: none; transition: color 0.15s;
        }
        .book-back:hover { color: rgba(79,195,247,0.8); }

        .book-hero { text-align: center; padding: 50px 0 32px; }
        .book-hero img {
          width: 90px; height: 90px; border-radius: 50%;
          object-fit: cover; object-position: center 20%;
          margin-bottom: 20px;
          border: 3px solid rgba(255,255,255,0.3);
          box-shadow: 0 4px 24px rgba(0,0,0,0.12);
        }
        .book-hero .wave {
          font-size: 14px; font-weight: 600;
          color: rgba(79,195,247,0.7); margin-bottom: 12px;
        }
        .book-hero h1 {
          font-size: clamp(24px, 4.5vw, 36px); font-weight: 800;
          line-height: 1.2; letter-spacing: -0.025em;
          margin-bottom: 14px; color: #fff;
        }
        .book-hero h1 em { font-style: italic; color: #4fc3f7; }
        .book-hero .sub {
          font-size: 15px; color: rgba(79,195,247,0.65);
          max-width: 460px; margin: 0 auto; line-height: 1.7;
        }

        .book-badges {
          display: flex; justify-content: center; gap: 10px;
          flex-wrap: wrap; margin-top: 20px;
        }
        .book-badge {
          font-size: 12px; font-weight: 600; color: #4fc3f7;
          background: rgba(255,255,255,0.08);
          backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
          padding: 7px 16px; border-radius: 100px;
          border: 1px solid rgba(255,255,255,0.1);
        }

        .book-card {
          background: #0f1f33;
          border: 1px solid rgba(79,195,247,0.12);
          border-radius: 16px;
          overflow: hidden;
          margin-bottom: 32px;
        }
        .book-card iframe {
          width: 100%; min-height: 650px; border: none;
        }

        .book-footer {
          text-align: center; padding: 24px 0 40px;
        }
        .book-footer p {
          font-size: 12px; color: rgba(79,195,247,0.3);
        }

        @media (max-width: 600px) {
          .book-hero { padding: 36px 0 24px; }
          .book-hero img { width: 72px; height: 72px; }
        }
      `}</style>

      <div className="book-page">
        <div className="book-grid" />
        <div className="book-content">

          {/* Nav — matches landing.html */}
          <nav className="book-nav">
            <a href="/" className="book-logo">
              <svg width="28" height="28" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#4fc3f7" stopOpacity="0.7"/>
                    <stop offset="100%" stopColor="#f5a623" stopOpacity="0.7"/>
                  </linearGradient>
                </defs>
                <rect width="32" height="32" rx="8" fill="rgba(255,255,255,0.06)"/>
                <text x="16" y="21" textAnchor="middle" fontFamily="system-ui,sans-serif" fontWeight="600" fontSize="13" fill="url(#lg)">mj</text>
              </svg>
              maddie<span>jolie</span>
            </a>
            <a href="/" className="book-back">← back to site</a>
          </nav>

          {/* Hero */}
          <div className="book-wrap">
            <div className="book-hero">
              <img src="/photo.jpg" alt="Maddie" width="90" height="90" />
              <div className="wave">hey, it's maddie!</div>
              <h1>So glad you checked out <em>the site I made you</em></h1>
              <p className="sub">
                I had a lot of fun putting that together — your reviews are seriously
                impressive and I wanted to make sure the site showed that off. I'd love
                to hop on a quick call and walk you through everything. Pick a time
                below and let's chat!
              </p>
              <div className="book-badges">
                <span className="book-badge">15 min call</span>
                <span className="book-badge">No pressure</span>
                <span className="book-badge">Starts at $79/mo</span>
              </div>
            </div>
          </div>

          {/* Calendar embed */}
          <div className="book-wrap">
            <div className="book-card">
              <iframe
                src={embedUrl}
                allow="payment"
                scrolling="no"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="book-footer">
            <p>maddie jolie · miami, fl</p>
          </div>

        </div>
      </div>
    </>
  )
}
