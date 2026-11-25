import { BRAND_LINKS } from '@/lib/constants'

export const metadata = {
  title: 'Book a Call — Madeleine Jolie',
  description: 'Schedule a quick call to see how a custom website can grow your contracting business.',
}

export default function BookPage() {
  const embedUrl = BRAND_LINKS.mj.calendarEmbed

  return (
    <div className="min-h-screen bg-[#08080a] text-white">
      {/* Header */}
      <div className="max-w-2xl mx-auto px-4 pt-10 pb-6 text-center">
        <p className="text-sm tracking-widest uppercase text-violet-400/70 mb-3">Madeleine Jolie</p>
        <h1 className="text-2xl sm:text-3xl font-bold font-heading mb-3"
            style={{ fontFamily: 'Figtree, sans-serif' }}>
          Let's Talk About Your Business
        </h1>
        <p className="text-sm text-white/50 max-w-md mx-auto leading-relaxed"
           style={{ fontFamily: 'Poppins, sans-serif' }}>
          Pick a time that works for you. I'll walk you through how a custom website and marketing system can bring in more leads for your business.
        </p>
      </div>

      {/* Calendar embed */}
      <div className="max-w-2xl mx-auto px-4 pb-16">
        <div className="rounded-2xl overflow-hidden border border-white/5 bg-white/[0.02]">
          <iframe
            src={embedUrl}
            allow="payment"
            style={{ width: '100%', minHeight: '700px', border: 'none', overflow: 'hidden' }}
            scrolling="no"
          />
        </div>
      </div>

      {/* Footer */}
      <div className="text-center pb-8">
        <p className="text-xs text-white/20">
          Website design & marketing systems for contractors
        </p>
      </div>
    </div>
  )
}
