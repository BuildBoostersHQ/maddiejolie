import CopyButton from './CopyButton'

const LINKEDIN = 'https://www.linkedin.com/in/madeleinejolie/'

export const metadata = {
  title: 'Consulting and speaking | Madeleine Jolie',
  description:
    'Madeleine Jolie advises home service companies, agencies and software companies on easy-to-use marketing systems. Specialties, bios, speaking topics and media kit.',
  robots: 'index, follow',
  alternates: { canonical: 'https://maddiejolie.com/consulting' },
  openGraph: {
    title: 'Consulting and speaking | Madeleine Jolie',
    description:
      'Easy-to-use marketing systems for home service businesses. Specialties, bios, speaking topics and media kit.',
    url: 'https://maddiejolie.com/consulting',
    images: [{ url: 'https://maddiejolie.com/photo.jpg' }],
    type: 'profile',
  },
}

const TITLE = 'Consultant | Easy-to-Use Marketing Systems for Home Service Businesses'

const SPECIALTIES = [
  'User experience for owners who are not technical',
  "Marketing systems that run a home service company's front office from a phone",
  'Local search across Google, Maps and AI answers',
  'Attribution that shows an owner which marketing brought in the job',
]

const TALKS = [
  {
    title: 'Easy wins: why the simplest system beats the smartest one',
    blurb:
      'What five years of designing software for people who never asked to learn software taught me about getting a tool used after the sale.',
  },
  {
    title: 'The front office in your pocket',
    blurb:
      'How a two-person crew can run its website, calls, texts and reviews from one phone, and what that means for the agencies and software companies that serve them.',
  },
  {
    title: 'Getting found on Google, Maps and AI answers',
    blurb:
      'How homeowners search for a contractor now, and how a local business should be built so that both a search engine and an AI assistant can read it.',
  },
  {
    title: 'Your lowest-view content might be your best salesperson',
    blurb:
      'What I found when I connected individual pieces of content to the customers they brought in, and how to stop cutting the work that is quietly paying for everything else.',
  },
]

const BIO_SHORT =
  'Madeleine Jolie is a consultant on easy-to-use marketing systems for home service businesses and the founder of Build Boosters, which gives small contractors a website, a business phone line, automatic follow-up and review requests in one system they can run from their phone.'

const BIO_MEDIUM =
  'Madeleine Jolie is a consultant and speaker on easy-to-use marketing systems for home service businesses, and the founder of Build Boosters, which gives small contractors a website, a business phone line, automatic follow-up and review requests in one system they can run from their phone. She has spent five years designing software and learning tools for people who never asked to learn software, including broadcast tools adopted by more than 60 channels and a mobile training system for FIFA World Cup 2026 staff, for which she received FIFA\'s Best Intern Award. At HighLevel she built the attribution infrastructure that showed partners which marketing was bringing in customers.'

const BIO_LONG = [
  'Madeleine Jolie is a consultant and speaker on easy-to-use marketing systems for home service businesses. She advises home service companies, and the agencies and software companies that serve them, on building systems that an owner will keep using after the first week, because a contractor on a roof has no patience for a tool that needs a manual.',
  'She is the founder of Build Boosters, which gives small contractors a website built for Google and AI search, a local business phone line, an automatic text back when a call is missed, and review requests after every job, all run from one app on the owner\'s phone. She designs and builds the system herself.',
  'Before Build Boosters, Madeleine worked at HighLevel, where she built the attribution infrastructure that connected individual pieces of content and campaigns to the customers they produced. Her growth plans took one partner from 37 to more than 668 trials in four months and produced 1,455% trial growth for another.',
  'She spent five years running Fired Up Media, where she earned more than 32.6 million organic views without paid promotion and built broadcast software adopted by more than 60 partner channels. As a senior intern with FIFA World Cup 2026, she replaced static staff handbooks with a mobile learning system built for staff across the host countries and received FIFA\'s Best Intern Award, presented by FIFA President Gianni Infantino.',
  'Madeleine graduated with highest honors from Miami Dade College and lives in Miami, Florida.',
]

const ROLES = [
  {
    role: 'Consultant, easy-to-use marketing systems for home service businesses',
    where: 'Independent',
    note: 'Advising home service companies, agencies and software companies.',
  },
  {
    role: 'Founder and lead developer',
    where: 'Build Boosters',
    note: 'A website, business phone line and review system for small contractors, run from a phone.',
  },
  {
    role: 'Affiliate manager, growth strategy and attribution',
    where: 'HighLevel',
    note: 'Built attribution infrastructure and growth plans across a portfolio of high-value partners.',
  },
  {
    role: 'Founder, growth strategy and content technology',
    where: 'Fired Up Media',
    note: 'Five years of audience building, broadcast software and community products.',
  },
  {
    role: 'Senior intern, brand storytelling and fan engagement',
    where: 'FIFA World Cup 2026',
    note: 'Designed mobile training for tournament staff across the United States, Canada and Mexico.',
  },
  {
    role: 'Guest experience',
    where: 'The Ritz-Carlton, Key Biscayne',
    note: "Trained in the company's Gold Standards of hospitality.",
  },
]

const PROOF = [
  "FIFA's Best Intern Award, presented by FIFA President Gianni Infantino",
  'More than 32.6 million organic views across 279 videos with no paid promotion',
  'Broadcast software adopted by more than 60 partner channels',
  'Took one HighLevel partner from 37 to more than 668 trials in four months',
  '1,455% trial growth for another HighLevel partner',
  'Publisher of the Contractor Website Checker extension on the Chrome Web Store',
  'Graduated with highest honors from Miami Dade College',
  'Presented to the Miami Dade College Board of Trustees and to audiences of up to 300 people',
]

const AVAILABILITY = [
  ['Consulting', 'Project work and monthly retainers for home service companies, agencies and software companies.'],
  ['Advisory roles', 'Ongoing advice for companies building products for home service businesses.'],
  ['Speaking', 'Keynotes and workshops in person, plus panels and remote sessions.'],
  ['Podcasts and press', 'Interviews and written commentary on local search and on making software easy to use.'],
]

const css = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,800&display=swap');
.cs{font-family:'Plus Jakarta Sans',-apple-system,system-ui,sans-serif;background:linear-gradient(180deg,#0d1e30 0%,#091624 40%,#050c16 100%);color:rgba(255,255,255,.82);min-height:100vh;line-height:1.65;position:relative;overflow-x:hidden;-webkit-font-smoothing:antialiased}
.cs *{box-sizing:border-box;margin:0;padding:0}
.cs-grid{position:fixed;inset:0;pointer-events:none;background-image:linear-gradient(rgba(79,195,247,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(79,195,247,.04) 1px,transparent 1px);background-size:60px 60px}
.cs-wrap{position:relative;z-index:1;max-width:820px;margin:0 auto;padding:0 24px}
.cs-nav{display:flex;align-items:center;justify-content:space-between;padding:20px 0}
.cs-logo{font-weight:800;font-size:20px;letter-spacing:-.02em;color:#4fc3f7;text-decoration:none}
.cs-cta{font-size:13px;font-weight:700;color:#091624;background:#f5a623;padding:10px 22px;border-radius:100px;text-decoration:none}
.cs-hero{display:grid;grid-template-columns:132px 1fr;gap:28px;align-items:center;padding:48px 0 40px}
.cs-photo{width:132px;height:132px;border-radius:50%;object-fit:cover;object-position:center 20%;border:3px solid rgba(255,255,255,.4)}
.cs h1{font-size:clamp(30px,5vw,42px);font-weight:800;letter-spacing:-.025em;line-height:1.12;color:#fff}
.cs-title{margin-top:10px;font-size:17px;font-weight:600;color:#4fc3f7;line-height:1.4}
.cs-loc{margin-top:8px;font-size:14px;color:rgba(79,195,247,.6)}
.cs-lead{font-size:18px;color:rgba(255,255,255,.9);max-width:680px;padding-bottom:8px}
.cs section{padding:38px 0;border-top:1px solid rgba(79,195,247,.12)}
.cs h2{font-size:24px;font-weight:800;letter-spacing:-.02em;color:#fff;margin-bottom:6px}
.cs-sub{font-size:15px;color:rgba(79,195,247,.7);margin-bottom:20px}
.cs-list{list-style:none;display:grid;gap:12px}
.cs-list li{position:relative;padding-left:22px;font-size:16px}
.cs-list li::before{content:'';position:absolute;left:0;top:.62em;width:8px;height:8px;border-radius:50%;background:#f5a623}
.cs-two{display:grid;grid-template-columns:1fr 1fr;gap:22px 36px}
.cs-item h3{font-size:16.5px;font-weight:700;color:#fff;line-height:1.35;margin-bottom:4px}
.cs-item p{font-size:14.5px;color:rgba(255,255,255,.72)}
.cs-bio{padding:22px 0;border-top:1px solid rgba(79,195,247,.1)}
.cs-bio:first-of-type{border-top:none;padding-top:4px}
.cs-biohead{display:flex;align-items:baseline;justify-content:space-between;gap:16px;margin-bottom:8px}
.cs-biohead h3{font-size:16px;font-weight:700;color:#4fc3f7}
.cs-biohead span{font-weight:500;color:rgba(79,195,247,.55);font-size:13.5px;margin-left:8px}
.cs-copy{font:600 13px 'Plus Jakarta Sans',sans-serif;color:#4fc3f7;background:transparent;border:1px solid rgba(79,195,247,.35);border-radius:100px;padding:5px 16px;cursor:pointer}
.cs-copy:hover{background:rgba(79,195,247,.1)}
.cs-bio p{font-size:15.5px;margin-top:10px}
.cs-bio p:first-of-type{margin-top:0}
.cs-role{display:grid;grid-template-columns:1fr;gap:2px;padding:14px 0;border-top:1px solid rgba(79,195,247,.1)}
.cs-role:first-of-type{border-top:none;padding-top:0}
.cs-role b{color:#fff;font-weight:700;font-size:16px}
.cs-role i{font-style:normal;color:#4fc3f7;font-size:14.5px;font-weight:600}
.cs-role span{font-size:14.5px;color:rgba(255,255,255,.7)}
.cs-kit{display:flex;flex-wrap:wrap;gap:12px;margin-top:6px}
.cs-btn{font-size:14px;font-weight:700;color:#4fc3f7;border:1px solid rgba(79,195,247,.35);border-radius:100px;padding:10px 22px;text-decoration:none}
.cs-btn:hover{background:rgba(79,195,247,.1)}
.cs-btn.amber{color:#091624;background:#f5a623;border-color:#f5a623}
.cs-contact{text-align:center;padding:48px 0}
.cs-contact p{max-width:520px;margin:0 auto 22px;font-size:16px}
.cs-foot{text-align:center;padding:28px 0 40px;border-top:1px solid rgba(255,255,255,.15);font-size:13px;color:rgba(79,195,247,.45)}
.cs-foot a{color:rgba(79,195,247,.7);text-decoration:none}
@media(max-width:640px){.cs-hero{grid-template-columns:1fr;text-align:left;gap:18px;padding-top:28px}.cs-photo{width:104px;height:104px}.cs-two{grid-template-columns:1fr}.cs-lead{font-size:16.5px}}
`

export default function ConsultingPage() {
  const longText = BIO_LONG.join('\n\n')
  return (
    <div className="cs">
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="cs-grid" />
      <div className="cs-wrap">
        <nav className="cs-nav">
          <a href="/" className="cs-logo">maddiejolie</a>
          <a href={LINKEDIN} className="cs-cta">Get in touch</a>
        </nav>

        <header className="cs-hero">
          <img className="cs-photo" src="/photo.jpg" alt="Madeleine Jolie" width="132" height="132" />
          <div>
            <h1>Madeleine Jolie</h1>
            <p className="cs-title">{TITLE}</p>
            <p className="cs-loc">Founder of Build Boosters · Miami, Florida</p>
          </div>
        </header>

        <p className="cs-lead">
          I advise home service companies, and the agencies and software companies that serve them, on
          building marketing systems that owners will actually use. A system only works if a contractor
          can run it from his phone between jobs, so I design for the person on the roof and not the
          person in the office.
        </p>

        <section>
          <h2>Specialties</h2>
          <p className="cs-sub">The four things I am hired to advise on.</p>
          <ul className="cs-list">
            {SPECIALTIES.map(s => <li key={s}>{s}</li>)}
          </ul>
        </section>

        <section>
          <h2>Speaking topics</h2>
          <p className="cs-sub">Each one works as a keynote or as a hands-on workshop.</p>
          <div className="cs-two">
            {TALKS.map(t => (
              <div className="cs-item" key={t.title}>
                <h3>{t.title}</h3>
                <p>{t.blurb}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2>Availability</h2>
          <p className="cs-sub">Based in Miami and flying out of MIA, with remote sessions available anywhere.</p>
          <div className="cs-two">
            {AVAILABILITY.map(([h, p]) => (
              <div className="cs-item" key={h}>
                <h3>{h}</h3>
                <p>{p}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2>Biography</h2>
          <p className="cs-sub">Written in the third person, ready to paste into a program or an introduction.</p>

          <div className="cs-bio">
            <div className="cs-biohead">
              <h3>Short<span>one sentence</span></h3>
              <CopyButton text={BIO_SHORT} />
            </div>
            <p>{BIO_SHORT}</p>
          </div>

          <div className="cs-bio">
            <div className="cs-biohead">
              <h3>Medium<span>one paragraph</span></h3>
              <CopyButton text={BIO_MEDIUM} />
            </div>
            <p>{BIO_MEDIUM}</p>
          </div>

          <div className="cs-bio">
            <div className="cs-biohead">
              <h3>Long<span>full biography</span></h3>
              <CopyButton text={longText} />
            </div>
            {BIO_LONG.map(p => <p key={p.slice(0, 24)}>{p}</p>)}
          </div>
        </section>

        <section>
          <h2>Roles</h2>
          <p className="cs-sub">Where the experience comes from.</p>
          {ROLES.map(r => (
            <div className="cs-role" key={r.where}>
              <b>{r.role}</b>
              <i>{r.where}</i>
              <span>{r.note}</span>
            </div>
          ))}
        </section>

        <section>
          <h2>Results and recognition</h2>
          <p className="cs-sub">The record behind the advice.</p>
          <ul className="cs-list">
            {PROOF.map(s => <li key={s}>{s}</li>)}
          </ul>
        </section>

        <section>
          <h2>Media kit</h2>
          <p className="cs-sub">For hosts, event organizers and reporters.</p>
          <div className="cs-kit">
            <a className="cs-btn" href="/photo.jpg" download="madeleine-jolie.jpg">Download photo</a>
            <a className="cs-btn" href={LINKEDIN}>LinkedIn</a>
            <a className="cs-btn" href="https://buildboosters.com">Build Boosters</a>
            <a className="cs-btn" href="https://chromewebstore.google.com/detail/contractor-website-checke/aodlincjjmjjnbcgeedalofjbnhmefmp">Contractor Website Checker</a>
          </div>
        </section>

        <section className="cs-contact">
          <h2>Work with me</h2>
          <p>
            For consulting, advisory roles, speaking or an interview, send me a message on LinkedIn with
            what you have in mind and the dates you are working with.
          </p>
          <a className="cs-btn amber" href={LINKEDIN}>Message me on LinkedIn</a>
        </section>

        <footer className="cs-foot">
          <p>Maddie Jolie · <a href="https://buildboosters.com">Build Boosters</a> · Miami, FL</p>
        </footer>
      </div>
    </div>
  )
}
