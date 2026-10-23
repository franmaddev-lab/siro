// What the shared preview gate needs to know about this site.
// In the template it comes from site.config.ts; in other repos it is a plain object.
import site from '../site.config.ts'

export default {
  name: site.name,
  lang: site.lang,
  // 'open' = no password page, but still hidden from search engines (handled by the site itself).
  mode: site.preview.mode === 'open' ? ('off' as const) : site.preview.mode,
  /** 'all': every address. 'previews': only Netlify preview addresses (dev--site.netlify.app), never the live site. */
  scope: 'all' as 'all' | 'previews',
  contactLine: site.preview.contactLine,
  theme: site.theme,
}
