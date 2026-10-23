import site from '../../site.config'

// Previews stay out of search engines; a live site is open to them.
export function GET() {
  const body = site.preview.mode === 'off' ? 'User-agent: *\nAllow: /\n' : 'User-agent: *\nDisallow: /\n'
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
