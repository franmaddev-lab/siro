// Prospect previews: a password page in front of the site, a cookie-free "preview opened"
// alert to the owner, and a "preview no longer available" page.
// Controlled by netlify/preview.config.ts. The password is never in the repo:
// set PREVIEW_PASSWORD (and optionally PREVIEW_NOTIFY_URL) in Netlify's environment variables.
//
// Shared file: the one source is the site-template repo. Do not edit copies in other repos;
// change it there and run scripts/sync-shared.sh.
import type { Context } from 'https://edge.netlify.com'
import site from '../preview.config.ts'

declare const Netlify: { env: { get(name: string): string | undefined } }

const COOKIE = 'preview_access'
const UNLOCK_PATH = '/__preview'

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!)

function page(title: string, body: string, status: number) {
  const t = site.theme
  const html = `<!doctype html><html lang="${esc(site.lang)}"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex, nofollow">
<title>${esc(title)} | ${esc(site.name)}</title>
<style>
body{margin:0;min-height:100vh;display:grid;place-items:center;padding:1rem;font-family:${t.fontBody};color:${t.ink};background:${t.surface};line-height:1.6}
main{width:min(100%,26rem);background:${t.paper};padding:2rem;border-radius:${t.radius};box-shadow:0 8px 30px rgb(0 0 0 / .12)}
h1{font-family:${t.fontHeading};font-size:1.6rem;line-height:1.2;margin:0 0 .5rem}
p{margin:0 0 1rem}label{display:block;font-weight:600;margin-bottom:.25rem}
input{box-sizing:border-box;width:100%;min-height:2.75rem;padding:.6rem .75rem;font:inherit;border:1px solid #9aa3ab;border-radius:${t.radius}}
button{width:100%;min-height:2.75rem;margin-top:1rem;font:inherit;font-weight:600;cursor:pointer;border:0;border-radius:${t.radius};background:${t.brand};color:${t.brandText}}
.err{color:#b3261e;font-weight:600}.muted{color:${t.muted};font-size:.95rem;margin:1.25rem 0 0}
</style></head><body><main>${body}</main></body></html>`
  return new Response(html, {
    status,
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'X-Robots-Tag': 'noindex, nofollow', 'Cache-Control': 'no-store' },
  })
}

const form = (error = '') =>
  page(
    'Private preview',
    `<h1>${esc(site.name)}</h1><p>This is a private preview. Enter the password you were sent.</p>
${error ? `<p class="err" role="alert">${esc(error)}</p>` : ''}
<form method="POST" action="${UNLOCK_PATH}"><label for="pw">Password</label>
<input id="pw" name="password" type="password" autocomplete="off" required autofocus>
<button type="submit">View the preview</button></form>
<p class="muted">${esc(site.contactLine)}</p>`,
    401,
  )

async function token(password: string) {
  const data = new TextEncoder().encode(`${site.name}:${password}`)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export default async function gate(request: Request, context: Context) {
  const mode = site.mode
  if (mode === 'off') return

  const url = new URL(request.url)
  // Netlify preview addresses look like dev--site.netlify.app; the live site never has "--".
  if (site.scope === 'previews' && !url.hostname.includes('--')) return

  if (mode === 'expired') {
    return page(
      'Preview no longer available',
      `<h1>This preview is no longer available</h1><p>The private preview of ${esc(site.name)} has ended.</p>
<p class="muted">${esc(site.contactLine)}</p>`,
      410,
    )
  }

  const password = Netlify.env.get('PREVIEW_PASSWORD')
  // Fail closed: a locked preview with no password set shows nothing.
  if (!password) return page('Preview not ready', '<h1>Preview not ready</h1><p>This preview has not been switched on yet.</p>', 503)

  const expected = await token(password)

  if (url.pathname === UNLOCK_PATH && request.method === 'POST') {
    const data = await request.formData().catch(() => null)
    if (data?.get('password') !== password) return form('That password is not right. Please try again.')

    const notify = Netlify.env.get('PREVIEW_NOTIFY_URL')
    if (notify) {
      // No cookies or personal details: just which preview was opened, and when.
      const text = `Preview opened: ${site.name} (${url.host}) at ${new Date().toISOString()}`
      context.waitUntil(fetch(notify, { method: 'POST', body: text }).catch(() => {}))
    }
    return new Response(null, {
      status: 303,
      headers: {
        Location: '/',
        // Strictly necessary for access control, so it needs no consent.
        'Set-Cookie': `${COOKIE}=${expected}; Path=/; Max-Age=2592000; HttpOnly; Secure; SameSite=Lax`,
      },
    })
  }

  if (context.cookies.get(COOKIE) !== expected) return form()

  const response = await context.next()
  response.headers.set('X-Robots-Tag', 'noindex, nofollow')
  return response
}
