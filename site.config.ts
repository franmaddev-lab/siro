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

  /** `svg`: use the traced logo (src/components/LogoFull.astro) in the header and hero. */
  logo: { svg: boolean }

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

  /**
   * `handle` like '@siro.16'. `showSection` adds a "follow us" band to the home page.
   * `photos`: people and places for that band; use 4 (or 8) so the grid is always full.
   */
  social: { facebook: string; instagram: string; handle: string; showSection: boolean; photos: { src: string; alt: string }[] }

  hero: { eyebrow: string; heading: string; text: string; image: string; /** Shows the logo instead of the image. */ showLogo: boolean; cta: string; badges: string[] }
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
    /** `group` starts a new heading in the list (e.g. Breakfast, Small plates). */
    priceList: { mode: AddonMode; heading: string; intro: string; items: { name: string; note: string; price: string; group?: string }[] }
    gallery: { mode: AddonMode; heading: string; images: { src: string; alt: string }[] }
    /**
     * `sources` are review pages (Google, Tripadvisor) shown as buttons; each item names its
     * source and links to it, opening in a new tab. `rating` like '4.8' shows a summary badge.
     */
    reviews: { mode: AddonMode; heading: string; rating: string; count: string; sources: { name: string; url: string }[]; items: { name: string; text: string; stars: number; source?: string }[] }
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
  name: "SiRo' Mangia & Bevi",
  tagline: 'Italian café bistrot in the heart of Rochdale',
  description: "SiRo' Mangia & Bevi: Italian café bistrot on Baillie Street, Rochdale. Brunch from 10am, small plates, risotto and pasta until 9pm.",
  lang: 'en-GB',
  url: '',

  theme: {
    brand: '#2f4f3a',
    brandText: '#fbf3ee',
    ink: '#1f2a22',
    paper: '#fffaf6',
    surface: '#f7e7ea',
    muted: '#5d6a60',
    radius: '14px',
    // Like the sign and menu: a soft, curly serif for the name and headings,
    // and a clean geometric sans with wide-spaced capitals for labels and text.
    fontHeading: 'Fraunces, Georgia, serif',
    fontBody: '"Josefin Sans", system-ui, sans-serif',
    fontFaces: [
      { family: 'Fraunces', src: '/fonts/fraunces.woff2', weight: '100 900' },
      { family: 'Josefin Sans', src: '/fonts/josefin-sans-400.woff2', weight: '400' },
      { family: 'Josefin Sans', src: '/fonts/josefin-sans-600.woff2', weight: '600' },
      // Rounded capitals close to MANGIA & BEVI / CAFÉ BISTROT on the sign.
      { family: 'Fredoka', src: '/fonts/fredoka.woff2', weight: '300 700' },
    ],
  },

  // Traced from the photo of their wall sign.
  logo: { svg: true },

  contact: {
    phone: '01706 582954',
    // PLACEHOLDER: Ofcom's fictional 07700 900xxx range, reaches no one. Swap for SiRo's mobile.
    whatsapp: '447700900123',
    whatsappMessage: 'Hi, I found you through your website.',
    email: '',
    address: '16 Baillie Street, Rochdale, OL16 1JG',
    area: 'Rochdale town centre',
    hours: [
      { days: 'Tuesday to Saturday', time: '10am to 9pm' },
      { days: 'Sunday and Monday', time: 'Closed' },
    ],
  },

  social: {
    facebook: 'https://www.facebook.com/share/18zqJedRY2/',
    instagram: 'https://www.instagram.com/siro.16',
    handle: '@siro.16',
    showSection: true,
    // From @siro.16 on Instagram: the team and the place, not food (that is in the gallery).
    photos: [
      { src: '/images/street.jpg', alt: "The street outside SiRo'" },
      { src: '/images/team-christmas.jpg', alt: "The SiRo' team with a Christmas elf" },
      { src: '/images/shopfront.jpg', alt: "The SiRo' sign above the door" },
      { src: '/images/sign-flowers.jpg', alt: "SiRo' sign with hanging flowers" },
    ],
  },

  hero: {
    eyebrow: '',
    // A new line in the heading (\n) starts a new line on the page.
    heading: 'Come for the food,\nstay for the experience.',
    text: 'Fresh Italian cooking and warm, personal service on Baillie Street.\nBrunch from 10am, small plates, risotto and pasta into the evening.',
    image: '/images/logo-wall.jpg',
    showLogo: true,
    cta: 'Get in touch',
    badges: [],
  },

  servicesSection: { eyebrow: 'Eat & drink', heading: 'From morning coffee to an evening glass of wine.', intro: '' },

  // Empty hides the "Eat & drink" section.
  services: [],

  whyUs: {
    enabled: true,
    eyebrow: 'Why SiRo’',
    heading: 'A little corner of Italy in Rochdale.',
    points: [
      { title: 'Cooked fresh by Luca', text: 'Our chef cooks Italian classics his way, with good ingredients and bold flavours.' },
      { title: 'Looked after by Danilo', text: 'Warm, personal service from the moment you walk in.' },
      { title: 'Brunch to dinner', text: 'One place for a weekday brunch, a quick lunch or a relaxed evening.' },
    ],
    stats: [],
  },

  howItWorks: { enabled: false, eyebrow: '', heading: '', steps: [] },

  about: {
    heading: 'Meet Danilo & Luca',
    paragraphs: [
      "At SiRo' Mangia & Bevi we are an Italian duo: Danilo, the heart behind the service, and Luca, the creative mind in the kitchen. Together we have created a special space that blends delicious food with warm, personal service.",
      'As chef, manager and owners, we believe in bringing out the best in each other and our team, so that every meal and every moment at our bistrot feels special.',
      "Whether you are here for a casual bite or a relaxing evening, we can't wait to welcome you.",
    ],
    image: '/images/owners.jpg',
    showOnHome: true,
  },

  cta: { heading: 'Hungry yet?', text: 'Call us to book a table, or just drop in. Mangia e bevi!' },

  addons: {
    contactForm: { mode: 'demo' },
    // Off for now; set to 'demo' to show the Book a time section again.
    booking: { mode: 'off', url: '', services: ['Table for brunch', 'Table for lunch or dinner', 'Private celebration'] },
    priceList: {
      mode: 'live',
      heading: 'Menu',
      intro: 'Allergies: please let our staff know.',
      items: [
        { group: 'Breakfast & brunch, 10am to 2pm', name: "SiRo' Breakfast", note: 'Italian sausage, fresh burrata, roasted cherry tomatoes on toast, roast potatoes and eggs your way', price: '£12.75' },
        { name: "SiRo' Benedict", note: 'Crispy Parma ham, poached eggs and basil béarnaise on sourdough', price: '£8.75' },
        { name: "SiRo' Florentine", note: 'Sautéed garlic spinach, poached eggs, hollandaise on sourdough', price: '£8.25' },
        { name: "SiRo' Avotoast", note: 'Fresh avocado, creamy stracciatella, roasted cherry tomatoes and basil oil', price: '£9.75' },
        { name: "SiRo' PLT", note: 'A Mediterranean BLT with Parma ham on sourdough', price: '£8.75' },
        { name: "SiRo' Salmon Toast", note: 'Smoked salmon, scrambled eggs on sourdough, chive oil', price: '£9.75' },
        { name: "SiRo' French Toast", note: 'Banana, Nutella and crushed pistachio', price: '£7.25' },
        { name: 'Pastries', note: 'Selection at the bar, each / with coffee', price: '£3.75 / £5.50' },
        { group: 'Nibbles, 12pm to 9pm', name: 'Bruschetta Mix', note: 'Tomato salad, Parma ham and burrata, hummus, roast pepper and chive', price: '£6.75' },
        { name: 'Aubergine croquettes', note: 'With a creamy tomato and basil sauce', price: '£6.25' },
        { name: 'Potato and cheese croquettes', note: 'Neapolitan street food with pecorino and smoked provola', price: '£6.25' },
        { name: 'Mangia & Bevi', note: 'Spring onions wrapped in pancetta', price: '£4.25' },
        { group: 'Small plates', name: 'Risotto zafferano e gamberi', note: 'Saffron risotto with prawns, a twist on the Milanese classic', price: '£13.25' },
        { name: 'Fillet with beets', note: '180g beef fillet, beetroot sauce, chive oil and roast potatoes', price: '£15.75' },
        { name: 'Seabass in tempura', note: 'With roast peppers and courgette purée', price: '£12.75' },
        { name: 'Slow-cooked spezzatino', note: 'Beef stew in red wine with potatoes', price: '£12.75' },
        { name: "SiRo' Lasagna", note: 'Classic Italian beef lasagna', price: '£9.75' },
        { name: 'Fettuccine zucchine e gamberi', note: 'Fresh fettuccine, courgette cream and prawns', price: '£10.75' },
      ],
    },
    gallery: {
      mode: 'live',
      heading: "From Luca's kitchen",
      // From @siro.16 on Instagram. Ask SiRo' for the originals (and permission) before going live.
      images: [
        { src: '/images/cod.jpg', alt: 'Cod on roasted pepper purée with hand-cooked potato crisps' },
        { src: '/images/burrata.jpg', alt: 'Burrata with crispy bread on roasted pepper purée' },
        { src: '/images/lamb.jpg', alt: 'Lamb chops with pea purée and roast potatoes' },
        { src: '/images/pappardelle.jpg', alt: 'Pappardelle with prawns' },
        { src: '/images/croquettes.jpg', alt: 'Croquettes being plated' },
        { src: '/images/sfincione.jpg', alt: 'Sicilian sfincione' },
      ],
    },
    reviews: {
      mode: 'demo',
      heading: 'What our guests say',
      rating: '',
      count: '',
      // Google: the listing the owner shared. Tripadvisor: a search until we have the exact page.
      sources: [
        { name: 'Google', url: 'https://share.google/MXgmGyLXOlNn3g4n5' },
        { name: 'Tripadvisor', url: 'https://www.tripadvisor.co.uk/Search?q=SiRo%20Mangia%20Bevi%20Rochdale' },
      ],
      // Samples: swap for real Google and Tripadvisor quotes.
      items: [
        { name: 'Sample guest', text: 'Lovely food and such a warm welcome. The risotto was amazing.', stars: 5, source: 'Google' },
        { name: 'Sample guest', text: 'Best brunch in Rochdale. The Benedict is a must.', stars: 5, source: 'Tripadvisor' },
        { name: 'Sample guest', text: 'Had our celebration here and they made it really special.', stars: 5, source: 'Google' },
        { name: 'Sample guest', text: 'Proper Italian food, just like being in Italy. Danilo and Luca are fantastic hosts.', stars: 5, source: 'Tripadvisor' },
        { name: 'Sample guest', text: 'The croquettes and the spezzatino were outstanding. Great value too.', stars: 5, source: 'Google' },
        { name: 'Sample guest', text: 'Lovely little bistrot with a real buzz. Coffee and pastries are spot on.', stars: 5, source: 'Tripadvisor' },
        { name: 'Sample guest', text: 'Friendly staff, beautiful plates, and they took great care with my allergies.', stars: 5, source: 'Google' },
        { name: 'Sample guest', text: 'Our new favourite spot in Rochdale. Already booked to come back.', stars: 5, source: 'Tripadvisor' },
      ],
    },
    quote: { mode: 'off', eyebrow: '', heading: '', intro: '', bullets: [], steps: [] },
    map: { mode: 'live', embedUrl: 'https://www.google.com/maps?q=16+Baillie+Street,+Rochdale+OL16+1JG&output=embed' },
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
