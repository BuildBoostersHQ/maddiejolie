export const FALLBACK_STAGE = { id: 'unknown', label: 'Unknown', class: 'status-lost' }

export function getStage(stageId) {
  return STAGES.find(s => s.id === stageId) || FALLBACK_STAGE
}

export const STAGES = [
  { id: 'prospect', label: 'Prospect', class: 'status-new' },
  { id: 'sms12', label: 'SMS 1+2', class: 'status-sms1' },
  { id: 'sms3', label: 'SMS 3', class: 'status-sms3' },
  { id: 'sms4', label: 'SMS 4', class: 'status-sms4' },
  { id: 'sms5', label: 'SMS 5', class: 'status-bye' },
  { id: 'clicked', label: 'Clicked', class: 'status-clicked' },
  { id: 'engaged', label: 'Engaged', class: 'status-vm' },
  { id: 'responded', label: 'Responded', class: 'status-responded' },
  { id: 'booked', label: 'Booked', class: 'status-booked' },
  { id: 'closed', label: 'Closed', class: 'status-closed' },
  { id: 'lost', label: 'Lost', class: 'status-lost' },
]

export const CALL_OUTCOMES = [
  { id: 'no_answer', label: 'No answer' },
  { id: 'voicemail', label: 'Left VM' },
  { id: 'talked', label: 'Talked' },
  { id: 'booked', label: 'Booked call' },
  { id: 'closed', label: 'Closed' },
  { id: 'not_interested', label: 'Not interested' },
]

export const TRADES = [
  'Handyman',
  'Painter',
  'Pressure Washing',
  'Junk Removal',
  'Landscaper',
  'General Contractor',
  'Remodeling',
  'Cleaning',
  'HVAC',
  'Plumber',
  'Electrician',
]

export const BRANDS = [
  { id: 'mj', label: 'Maddie Jolie', domain: 'maddiejolie.com' },
  { id: 'bb', label: 'Build Boosters', domain: 'buildboosters.com' },
]

// Update these URLs as you set them up — this is the ONE place they live.
// Calendar: branded booking pages on each domain
// Pricing: build a /pricing page or link to your pricing PDF
// VSL: upload your video and paste the link here
export const BRAND_LINKS = {
  mj: {
    calendar: 'https://maddiejolie.com/book',
    pricing: '',  // paste your pricing page URL here
    vsl: '',      // paste your VSL video URL here
    calendarEmbed: 'https://api.buildboosters.com/widget/booking/6KwM8Zzp23FeEW0wWTNs',
  },
  bb: {
    calendar: 'https://api.buildboosters.com/widget/bookings/buildboostersdemo',
    pricing: '',  // paste your pricing page URL here
    vsl: '',      // paste your VSL video URL here
    calendarEmbed: 'https://api.buildboosters.com/widget/bookings/buildboostersdemo',
  },
}

// ── Sequence steps (tag each outbound SMS so you can filter by step) ──
export const SEQUENCE_STEPS = [
  { id: 'sms1',      label: 'SMS 1 — Intro + Link',      color: 'rgba(139,92,246,0.5)' },
  { id: 'sms2',      label: 'SMS 2 — Typo Fix',          color: 'rgba(139,92,246,0.4)' },
  { id: 'sms3',      label: 'SMS 3 — Review Name',        color: 'rgba(236,72,153,0.5)' },
  { id: 'voicemail', label: 'Voicemail Drop',              color: 'rgba(251,191,36,0.5)' },
  { id: 'sms4',      label: 'SMS 4 — Testimonial',        color: 'rgba(74,222,128,0.5)' },
  { id: 'sms5',      label: 'SMS 5 — Soft Close',         color: 'rgba(248,113,113,0.5)' },
  { id: 'manual',    label: 'Manual Message',              color: 'rgba(255,255,255,0.3)' },
  { id: 'reply',     label: 'Reply',                       color: 'rgba(96,165,250,0.5)' },
  { id: 'inbound',   label: 'Inbound',                     color: 'rgba(52,211,153,0.5)' },
]

export function getSequenceStep(stepId) {
  return SEQUENCE_STEPS.find(s => s.id === stepId) || { id: stepId, label: stepId || 'Unknown', color: 'rgba(255,255,255,0.2)' }
}

// ── Kixie numbers — fill in your actual numbers ──
// Map area codes to the Kixie number that texts prospects in that market.
// The export route uses this to auto-assign from_number per prospect.
export const KIXIE_NUMBERS = {
  '305': '',  // Miami-Dade  — paste your Kixie 305 number here
  '786': '',  // Miami-Dade alt
  '954': '',  // Broward
  '561': '',  // Palm Beach
  'default': '',  // fallback for any area code not listed
}

// Given a prospect's phone, pick which Kixie number to text from
export function assignKixieNumber(phone) {
  const digits = (phone || '').replace(/\D/g, '')
  const areaCode = digits.startsWith('1') ? digits.slice(1, 4) : digits.slice(0, 3)
  return KIXIE_NUMBERS[areaCode] || KIXIE_NUMBERS['default'] || ''
}

// ── Batch statuses ──
export const BATCH_STATUSES = [
  { id: 'pulled',   label: 'Pulled' },
  { id: 'verified', label: 'Verified' },
  { id: 'exported', label: 'Exported' },
  { id: 'sending',  label: 'Sending' },
  { id: 'complete', label: 'Complete' },
]

// Mock data for UI development — will be replaced with Supabase
export const MOCK_PROSPECTS = [
  {
    id: 1,
    name: 'Gotham Handyman',
    owner: 'Mike Torres',
    phone: '(718) 555-0142',
    trade: 'Handyman',
    city: 'Brooklyn',
    state: 'NY',
    rating: 4.8,
    reviews: 47,
    stage: 'clicked',
    demoUrl: '/demo/gotham-handyman-brooklyn',
    pageViews: 3,
    timeOnPage: 127,
    lastVisit: '2026-11-24T18:30:00Z',
    score: 92,
    messages: [
      { type: 'out', text: 'Hey Mike, it\'s Maddie! I put this together for your busieness: maddiejolie.com/demo/gotham-handyman-brooklyn', time: '2026-11-23T10:00:00Z' },
      { type: 'out', text: '*sorry, business, too much coffee haha', time: '2026-11-23T10:00:30Z' },
      { type: 'out', text: 'btw I grabbed your reviews from Google and put them right on the homepage — the one from Sarah M. is really good', time: '2026-11-24T10:00:00Z' },
    ],
  },
  {
    id: 2,
    name: 'A-Z Handyman',
    owner: 'Carlos Ruiz',
    phone: '(718) 555-0198',
    trade: 'Handyman',
    city: 'Brooklyn',
    state: 'NY',
    rating: 4.6,
    reviews: 23,
    stage: 'responded',
    demoUrl: '/demo/a-z-handyman-brooklyn',
    pageViews: 5,
    timeOnPage: 243,
    lastVisit: '2026-11-24T20:15:00Z',
    score: 97,
    messages: [
      { type: 'out', text: 'Hey Carlos, it\'s Maddie! I put this together for your busieness: maddiejolie.com/demo/a-z-handyman-brooklyn', time: '2026-11-22T10:00:00Z' },
      { type: 'out', text: '*sorry, business, too much coffee haha', time: '2026-11-22T10:00:30Z' },
      { type: 'in', text: 'Hey this is pretty cool how much does something like this cost?', time: '2026-11-22T14:22:00Z' },
    ],
  },
  {
    id: 3,
    name: 'Brooklyn HVAC Services',
    owner: 'James Wright',
    phone: '(347) 555-0167',
    trade: 'HVAC',
    city: 'Brooklyn',
    state: 'NY',
    rating: 4.9,
    reviews: 89,
    stage: 'sms12',
    demoUrl: '/demo/brooklyn-hvac-services-brooklyn',
    pageViews: 0,
    timeOnPage: 0,
    lastVisit: null,
    score: 71,
    messages: [
      { type: 'out', text: 'Hey James, it\'s Maddie! I put this together for your busieness: maddiejolie.com/demo/brooklyn-hvac-services-brooklyn', time: '2026-11-24T10:00:00Z' },
      { type: 'out', text: '*sorry, business, too much coffee haha', time: '2026-11-24T10:00:30Z' },
    ],
  },
  {
    id: 4,
    name: 'EliteFix Handyman Services',
    owner: 'David Park',
    phone: '(917) 555-0134',
    trade: 'Handyman',
    city: 'Brooklyn',
    state: 'NY',
    rating: 4.7,
    reviews: 31,
    stage: 'closed',
    demoUrl: '/demo/elitefix-handyman-services-brooklyn',
    pageViews: 8,
    timeOnPage: 412,
    lastVisit: '2026-11-20T16:45:00Z',
    score: 99,
    messages: [
      { type: 'out', text: 'Hey David, it\'s Maddie! I put this together for your busieness: maddiejolie.com/demo/elitefix-handyman-services-brooklyn', time: '2026-11-18T10:00:00Z' },
      { type: 'out', text: '*sorry, business, too much coffee haha', time: '2026-11-18T10:00:30Z' },
      { type: 'in', text: 'Wow this looks great! What all is included?', time: '2026-11-18T15:10:00Z' },
      { type: 'out', text: 'Thanks David! The site comes with automated review requests, missed-call text-back, and a full lead follow-up system. Want me to walk you through it?', time: '2026-11-18T15:15:00Z' },
      { type: 'in', text: 'Yeah let\'s do it. Can you call me tomorrow around 2?', time: '2026-11-18T15:20:00Z' },
    ],
  },
  {
    id: 5,
    name: 'Say Renovations',
    owner: 'Anthony Say',
    phone: '(646) 555-0189',
    trade: 'Remodeling',
    city: 'Brooklyn',
    state: 'NY',
    rating: 4.5,
    reviews: 15,
    stage: 'sms3',
    demoUrl: '/demo/say-renovations-brooklyn',
    pageViews: 1,
    timeOnPage: 34,
    lastVisit: '2026-11-23T12:00:00Z',
    score: 65,
    messages: [
      { type: 'out', text: 'Hey Anthony, it\'s Maddie! I put this together for your busieness: maddiejolie.com/demo/say-renovations-brooklyn', time: '2026-11-21T10:00:00Z' },
      { type: 'out', text: '*sorry, business, too much coffee haha', time: '2026-11-21T10:00:30Z' },
      { type: 'out', text: 'btw I grabbed your reviews from Google and put them right on the homepage — the one from Rachel K. is really good', time: '2026-11-22T10:00:00Z' },
    ],
  },
  {
    id: 6,
    name: 'On Time Handyman Services',
    owner: 'Robert Chen',
    phone: '(212) 555-0156',
    trade: 'Handyman',
    city: 'Brooklyn',
    state: 'NY',
    rating: 4.3,
    reviews: 12,
    stage: 'lost',
    demoUrl: '/demo/on-time-handyman-services-brooklyn',
    pageViews: 2,
    timeOnPage: 15,
    lastVisit: '2026-11-20T09:00:00Z',
    score: 45,
    messages: [
      { type: 'out', text: 'Hey Robert, it\'s Maddie! I put this together for your busieness: maddiejolie.com/demo/on-time-handyman-services-brooklyn', time: '2026-11-18T10:00:00Z' },
      { type: 'out', text: '*sorry, business, too much coffee haha', time: '2026-11-18T10:00:30Z' },
      { type: 'in', text: 'Not interested thanks', time: '2026-11-18T11:00:00Z' },
    ],
  },
  {
    id: 7,
    name: 'Think Clean',
    owner: 'Maria Santos',
    phone: '(929) 555-0178',
    trade: 'Cleaning',
    city: 'New York',
    state: 'NY',
    rating: 4.8,
    reviews: 56,
    stage: 'engaged',
    demoUrl: '/demo/think-clean-new-york',
    pageViews: 4,
    timeOnPage: 189,
    lastVisit: '2026-11-24T14:30:00Z',
    score: 88,
    messages: [
      { type: 'out', text: 'Hey Maria, it\'s Maddie! I put this together for your busieness: maddiejolie.com/demo/think-clean-new-york', time: '2026-11-20T10:00:00Z' },
      { type: 'out', text: '*sorry, business, too much coffee haha', time: '2026-11-20T10:00:30Z' },
      { type: 'in', text: 'Hi Maddie! This looks amazing, how did you do this?', time: '2026-11-20T16:45:00Z' },
    ],
  },
  {
    id: 8,
    name: 'Handyman Pro',
    owner: 'Jason Miller',
    phone: '(347) 555-0123',
    trade: 'Handyman',
    city: 'Elmhurst',
    state: 'NY',
    rating: 4.4,
    reviews: 19,
    stage: 'prospect',
    demoUrl: '/demo/handyman-pro-elmhurst',
    pageViews: 0,
    timeOnPage: 0,
    lastVisit: null,
    score: 58,
    messages: [],
  },
]
