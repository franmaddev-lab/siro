// Everything that differs between client sites lives in this one file.
// It must stay free of imports: the preview gate (netlify/edge-functions) reads it too.

type AddonMode = 'off' | 'demo' | 'live'

type QuoteField =
  | { type: 'choice'; label: string; options: { label: string; note?: string }[] }
  | { type: 'select'; label: string; options: string[] }
  | { type: 'textarea'; label: string }

export type SiteConfig = {
  name: string
  tagline: string
  description: string
  lang: string
  /** Public address once live, e.g. https://example.co.uk. Leave empty until there is one. */
  url: string

  theme: {
    brand: string
    brandText: string
    ink: string
    paper: string
    surface: string
    muted: string
    radius: string
    fontHeading: string
    fontBody: string
    /** Font files in public/fonts, served by the site itself. Empty uses system fonts. */
    fontFaces: { family: string; src: string; weight: string }[]
  }

  contact: {
    phone: string
    /** Digits only, with country code, e.g. 447700900123. Empty hides the WhatsApp button. */
    whatsapp: string
    whatsappMessage: string
    email: string
    address: string
    area: string
    hours: { days: string; time: string }[]
  }

  social: { facebook: string; instagram: string }

  hero: { eyebrow: string; heading: string; text: string; image: string; cta: string; badges: string[] }
  servicesSection: { eyebrow: string; heading: string; intro: string }
  services: { name: string; text: string }[]
  /** Reasons to choose the business, with optional headline numbers. */
  whyUs: { enabled: boolean; eyebrow: string; heading: string; points: { title: string; text: string }[]; stats: { value: string; label: string }[] }
  howItWorks: { enabled: boolean; eyebrow: string; heading: string; steps: { title: string; text: string }[] }
  about: { heading: string; paragraphs: string[]; image: string; showOnHome: boolean }
  /** Closing call-to-action band on the home page. Empty heading hides it. */
  cta: { heading: string; text: string }

  addons: {
    /** Netlify Forms contact form. demo: looks real, sends nothing. */
    contactForm: { mode: AddonMode }
    /** live: `url` is the client's Calendly or Cal.com link. */
    booking: { mode: AddonMode; url: string; services: string[] }
    priceList: { mode: AddonMode; items: { name: string; note: string; price: string }[] }
    gallery: { mode: AddonMode; images: { src: string; alt: string }[] }
    reviews: { mode: AddonMode; items: { name: string; text: string; stars: number }[] }
    /**
     * Step-by-step quote form. Nothing is stored: the last step opens the visitor's WhatsApp
     * or email app with the answers filled in. demo: shows the message instead of sending.
     */
    quote: {
      mode: AddonMode
      eyebrow: string
      heading: string
      intro: string
      bullets: string[]
      steps: { title: string; hint: string; fields: QuoteField[] }[]
    }
    /** live: `embedUrl` is a Google Maps embed link. Loaded only when the visitor clicks. */
    map: { mode: AddonMode; embedUrl: string }
  }

  /** Cookie-free visit counter (goatcounter.com). The site code, or empty for none. */
  goatcounter: string

  clarity: {
    /** Shared "Previews" project, used until the client has their own. */
    previewId: string
    /** The client's own project, once they sign. Takes over from previewId when set. */
    liveId: string
  }

  preview: {
    /**
     * off: public site.
     * locked: password page in front, hidden from search engines. Needs PREVIEW_PASSWORD
     *         (and optionally PREVIEW_NOTIFY_URL) set as Netlify environment variables.
     * expired: every address shows "preview no longer available".
     */
    mode: 'off' | 'locked' | 'expired'
    /** Shown on the password and expired pages so the prospect can reach the owner. */
    contactLine: string
  }
}

const site: SiteConfig = {
  name: 'Example Business',
  tagline: 'Friendly local service you can rely on',
  description: 'Example Business: friendly, reliable local service. Get in touch for a free quote.',
  lang: 'en-GB',
  url: '',

  theme: {
    brand: '#1f5f8b',
    brandText: '#ffffff',
    ink: '#1c2126',
    paper: '#ffffff',
    surface: '#f3f5f7',
    muted: '#5b6670',
    radius: '10px',
    fontHeading: 'Georgia, "Times New Roman", serif',
    fontBody: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
    fontFaces: [],
  },

  contact: {
    phone: '01234 567890',
    whatsapp: '447700900123',
    whatsappMessage: 'Hi, I found you through your website.',
    email: 'hello@example.com',
    address: '1 High Street, Exampleton, EX1 2AB',
    area: 'Exampleton and nearby',
    hours: [
      { days: 'Monday to Friday', time: '8am to 6pm' },
      { days: 'Saturday', time: '9am to 1pm' },
    ],
  },

  social: { facebook: '', instagram: '' },

  hero: {
    eyebrow: 'Local and independent',
    heading: 'Friendly local service you can rely on',
    text: 'A short, plain sentence about what the business does and who it is for.',
    image: '',
    cta: 'Get in touch',
    badges: ['Free quotes', 'Fully insured'],
  },

  servicesSection: { eyebrow: 'What we do', heading: 'Everything you need, sorted.', intro: '' },

  services: [
    { name: 'First service', text: 'One line on what it is and why it helps.' },
    { name: 'Second service', text: 'One line on what it is and why it helps.' },
    { name: 'Third service', text: 'One line on what it is and why it helps.' },
  ],

  whyUs: {
    enabled: true,
    eyebrow: 'Why us',
    heading: 'A local business you will recommend.',
    points: [
      { title: 'One point of contact', text: 'The person who quotes is the person who does the job.' },
      { title: 'Clear prices up front', text: 'You know where you stand before any work starts.' },
    ],
    stats: [],
  },

  howItWorks: {
    enabled: true,
    eyebrow: 'How it works',
    heading: 'Simple from first message to finished job.',
    steps: [
      { title: 'Tell us the job', text: 'Call, message or use the form.' },
      { title: 'Get a price', text: 'A clear quote with no obligation.' },
      { title: 'Job done', text: 'On the agreed day, left clean and tidy.' },
    ],
  },

  about: {
    heading: 'Who we are',
    paragraphs: [
      'A couple of sentences about who runs the business and how long they have been doing it.',
      'A couple of sentences about how they work and what customers can expect.',
    ],
    image: '',
    showOnHome: true,
  },

  cta: { heading: 'Ready to get started?', text: 'Get a free, no-obligation quote today.' },

  addons: {
    contactForm: { mode: 'demo' },
    booking: { mode: 'demo', url: '', services: ['First service', 'Second service'] },
    priceList: {
      mode: 'demo',
      items: [
        { name: 'First service', note: 'What is included', price: 'from £40' },
        { name: 'Second service', note: 'What is included', price: 'from £75' },
        { name: 'Third service', note: 'What is included', price: 'from £120' },
      ],
    },
    gallery: { mode: 'off', images: [] },
    reviews: {
      mode: 'demo',
      items: [
        { name: 'Sample customer', text: 'Turned up on time and did a great job.', stars: 5 },
        { name: 'Sample customer', text: 'Clear price up front and no mess left behind.', stars: 5 },
        { name: 'Sample customer', text: 'Would happily recommend to friends and family.', stars: 5 },
      ],
    },
    quote: {
      mode: 'demo',
      eyebrow: 'Free quote',
      heading: 'Get your quote in under a minute.',
      intro: 'Answer a few quick questions and send them straight to us by WhatsApp or email.',
      bullets: ['Takes about 60 seconds', 'No obligation'],
      steps: [
        {
          title: 'What do you need?',
          hint: 'Pick the closest match.',
          fields: [{ type: 'choice', label: 'Job', options: [{ label: 'First service' }, { label: 'Second service' }, { label: 'Something else', note: 'Tell us about it' }] }],
        },
        {
          title: 'When do you need us?',
          hint: 'And anything else worth knowing.',
          fields: [
            { type: 'choice', label: 'Timing', options: [{ label: 'This week' }, { label: 'This month' }, { label: 'No rush' }] },
            { type: 'textarea', label: 'Details (optional)' },
          ],
        },
      ],
    },
    map: { mode: 'off', embedUrl: '' },
  },

  goatcounter: '',

  clarity: { previewId: 'yx1cctzktd', liveId: '' },

  preview: {
    // Keep this line's layout: netlify.toml reads it to skip paid builds for previews.
    mode: 'locked',
    contactLine: 'Questions? Reply to the message that brought you here.',
  },
}

export default site
