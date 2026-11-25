// Small MJ / BB brand pill used on messages + prospects pages
const BRAND_PILL = {
  mj: { short: 'MJ', color: 'rgba(167,139,250,0.75)', bg: 'rgba(139,92,246,0.12)' },
  bb: { short: 'BB', color: 'rgba(251,191,36,0.8)', bg: 'rgba(251,191,36,0.1)' },
}

export default function BrandPill({ brand }) {
  const b = BRAND_PILL[brand] || BRAND_PILL.mj
  return (
    <span style={{ fontSize: '8px', fontWeight: 700, letterSpacing: '0.5px', padding: '1px 6px', borderRadius: '20px', background: b.bg, color: b.color, flexShrink: 0 }}>
      {b.short}
    </span>
  )
}
