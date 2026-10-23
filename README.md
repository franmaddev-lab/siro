# Site template

Astro template for client showcase websites, hosted on Netlify. The rules for how sites are
created, previewed and released are in `CLAUDE.md`.

## What a new site changes

- `site.config.ts`: name, colours, fonts, texts, contact details, which add-ons are on,
  Clarity IDs and the preview mode. This is the only file most sites need to touch.
- `public/`: images and the favicon.

## Run it

```bash
npm install
npm run dev
```

To test the password page locally, copy `.env.example` to `.env` and run `netlify dev`.

## Preview modes (`preview.mode` in `site.config.ts`)

| Mode | What visitors get |
| --- | --- |
| `locked` | A password page, then the site. Hidden from search engines. |
| `expired` | "This preview is no longer available" on every address. |
| `off` | The public site, open to search engines. |

`locked` needs two Netlify environment variables: `PREVIEW_PASSWORD`, and optionally
`PREVIEW_NOTIFY_URL`, an address that receives a short "Preview opened" message each time
someone unlocks the site. With no password set, a locked site shows "Preview not ready".

## Add-ons

Each add-on has a `mode`: `off`, `demo` (sample content with a "Demo" label; nothing is sent
or charged) or `live`.

| Add-on | Live needs |
| --- | --- |
| `contactForm` | Nothing: uses Netlify Forms. Turn on form notifications in Netlify. |
| `booking` | The client's Calendly or Cal.com link in `url`. |
| `priceList` | Real items. |
| `gallery` | Images in `public/` listed in `images`. |
| `reviews` | Real reviews, with the customer's permission. |
| `map` | A Google Maps embed link in `embedUrl`. |

| `quote` | Nothing: opens the visitor's WhatsApp or email app with their answers. |

Not built yet: shop, Instagram feed, newsletter, multi-language, calendar sync.

Optional home page sections, switched on in the config: why us (with headline numbers), how
it works, closing call-to-action. Own fonts go in `public/fonts` and `theme.fontFaces`.

## Cookies

Microsoft Clarity loads only after the visitor clicks Accept. The booking calendar and map
come from other companies, so they load only when the visitor clicks to open them.
