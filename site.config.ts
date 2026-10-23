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
  name: "SiRo' Café Bistrot",
  tagline: 'Mangia & Bevi: Italian food, made with love',
  description: "SiRo' Mangia & Bevi: an Italian café bistrot run by Danilo and Luca. Brunch from 10am, small plates and Italian classics until 9pm.",
  lang: 'en-GB',
  url: '',

  theme: {
    brand: '#2f5d3a',
    brandText: '#ffffff',
    ink: '#1f2a22',
    paper: '#fffaf8',
    surface: '#f6e6e6',
    muted: '#5c6660',
    radius: '14px',
    fontHeading: '"Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif',
    fontBody: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
    fontFaces: [],
  },

  contact: {
    phone: '',
    whatsapp: '',
    whatsappMessage: "Ciao! I found SiRo' through your website.",
    email: '',
    address: '',
    area: '',
    hours: [
      { days: 'Breakfast and brunch', time: '10am to 2pm' },
      { days: 'Afternoons and evenings', time: '12pm to 9pm' },
    ],
  },

  social: { facebook: 'https://www.facebook.com/share/18zqJedRY2/', instagram: '' },

  hero: {
    eyebrow: 'Café Bistrot · Mangia & Bevi',
    heading: 'Come for the food, stay for the experience.',
    text: 'Italian brunch, small plates and classics like lasagna and saffron risotto, served with warm, personal service.',
    image: '/logo-wall.jpg',
    cta: 'Get in touch',
    badges: ['Brunch from 10am', 'Small plates until 9pm', 'Fresh, Italian, homemade'],
  },

  servicesSection: { eyebrow: 'Mangia & Bevi', heading: 'From morning coffee to evening plates.', intro: '' },

  services: [
    { name: 'Breakfast and brunch', text: "SiRo' Benedict, Avotoast, salmon toast, French toast with Nutella and pistachio, and pastries at the bar." },
    { name: 'Nibbles and small plates', text: 'Bruschetta, croquettes, burrata, soup and Italian plates to share, from 12pm to 9pm.' },
    { name: 'Italian classics', text: "Risotto zafferano e gamberi, slow-cooked spezzatino and the SiRo' lasagna." },
  ],

  whyUs: {
    enabled: true,
    eyebrow: 'Why SiRo\'',
    heading: 'A special space for food and community.',
    points: [
      { title: 'An Italian duo', text: 'Danilo looks after the service, Luca is the creative mind in the kitchen.' },
      { title: 'Fresh and unique flavours', text: 'A menu that reflects their love for fresh ingredients and Italian cooking.' },
      { title: 'Warm, personal service', text: 'Whether for a casual bite or a relaxing evening, every moment should feel special.' },
    ],
    stats: [],
  },

  howItWorks: { enabled: false, eyebrow: '', heading: '', steps: [] },

  about: {
    heading: 'Who we are',
    paragraphs: [
      "At SiRo' Mangia&Bevi, we are a dynamic Italian duo: Danilo, the heart behind the service, and Luca, the creative mind in the kitchen. Together, we've created a special space that blends delicious food with warm, personalised service.",
      "With a shared passion for quality and community, we're excited to offer you a menu that reflects our love for fresh and unique flavours.",
      "As chef, manager and owners, we believe in bringing out the best in each other and our team, so that every meal and every moment at our Bistrot feels special. Whether you're here for a casual bite or a relaxing evening, we can't wait to welcome you.",
    ],
    image: '/danilo-luca.jpg',
    showOnHome: true,
  },

  cta: { heading: "We can't wait to welcome you.", text: 'Book a table or ask us anything.' },

  addons: {
    contactForm: { mode: 'demo' },
    booking: { mode: 'demo', url: '', services: ['Table for brunch', 'Table for lunch or dinner', 'Private celebration'] },
    priceList: {
      mode: 'live',
      items: [
        { name: "SiRo' Breakfast", note: 'Italian sausage, fresh burrata, roasted cherry tomatoes on toast, roast potatoes and eggs your way', price: '£12.75' },
        { name: "SiRo' Benedict", note: 'Crispy Parma ham, poached eggs and basil bernaise on sourdough', price: '£8.75' },
        { name: "SiRo' Avotoast", note: 'Fresh avocado, creamy stracciatella, roasted cherry tomatoes and basil oil', price: '£9.75' },
        { name: "SiRo' French Toast", note: 'Banana sauce, Nutella and crushed pistachio', price: '£7.25' },
        { name: 'Bruschetta Mix', note: 'Tomato salad, Parma ham and burrata, hummus, roast pepper and chive', price: '£6.75' },
        { name: 'Risotto zafferano e gamberi', note: 'Saffron risotto with prawns, a twist on the Milanese classic', price: '£13.25' },
        { name: 'Slow cooked Spezzatino', note: 'Tender beef stew slow-cooked in red wine, with potatoes', price: '£12.75' },
        { name: 'Fillet with Beets', note: '180g pan-fried beef fillet, beetroot sauce, chive oil and roast potatoes', price: '£15.75' },
        { name: "SiRo' Lasagna", note: 'Classic Italian beef lasagna', price: '£9.75' },
      ],
    },
    gallery: {
      mode: 'live',
      images: [
        { src: '/logo-wall.jpg', alt: "The SiRo' Mangia & Bevi logo on the green bistro wall" },
        { src: '/table.jpg', alt: 'A table set for a celebration under the SiRo\' sign' },
        { src: '/danilo-luca.jpg', alt: 'Danilo and Luca at the bar' },
      ],
    },
    reviews: {
      mode: 'demo',
      items: [
        { name: 'Sample guest', text: 'Lovely brunch and such friendly service. The Benedict is a must.', stars: 5 },
        { name: 'Sample guest', text: 'Felt like being back in Italy. The risotto was beautiful.', stars: 5 },
        { name: 'Sample guest', text: 'Perfect spot for a celebration, they made it really special.', stars: 5 },
      ],
    },
    quote: { mode: 'off', eyebrow: '', heading: '', intro: '', bullets: [], steps: [] },
    map: { mode: 'demo', embedUrl: '' },
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
