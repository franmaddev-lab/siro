/*
 * Site kit: the parts every site shares, in one file with no dependencies.
 *   - cookie banner; Microsoft Clarity loads only after Accept
 *   - floating WhatsApp button
 * The one source is public/site-kit.js in the site-template repo. Do not edit copies in
 * other repos: change it there and run scripts/sync-shared.sh.
 *
 * Use:
 *   <script src="/site-kit.js" defer
 *     data-site="Business name"            used to tag Clarity visits and name the saved choice
 *     data-clarity="projectid"             empty or missing: no banner, no Clarity
 *     data-whatsapp="447700900123"         empty or missing: no button
 *     data-whatsapp-message="Hi, ..."
 *     data-policy="/cookies/"              link in the banner; empty hides the link
 *     data-brand="#1f5f8b" data-brand-text="#fff"></script>
 * Any element with a data-cookie-settings attribute reopens the banner when clicked.
 */
;(function () {
  var script = document.currentScript
  var d = script ? script.dataset : {}
  var site = d.site || document.title
  var clarityId = /^[a-z0-9]+$/i.test(d.clarity || '') ? d.clarity : ''
  var brand = d.brand || 'var(--brand, #1f5f8b)'
  var brandText = d.brandText || 'var(--brand-text, #fff)'
  var KEY = site.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-cookie-consent'

  var css =
    '.sk-wa{position:fixed;right:1rem;bottom:1rem;z-index:2147483000;display:inline-flex;align-items:center;gap:.5rem;min-height:3rem;padding:.5rem 1rem .5rem .75rem;border-radius:999px;background:#128c4b;color:#fff;font:700 1rem/1.2 system-ui,-apple-system,"Segoe UI",sans-serif;text-decoration:none;box-shadow:0 4px 14px rgb(0 0 0/.25)}' +
    '.sk-wa:focus-visible,.sk-cookie button:focus-visible{outline:3px solid #111;outline-offset:2px}' +
    '.sk-cookie{position:fixed;left:0;right:0;bottom:0;z-index:2147483001;padding:1rem;font:400 1rem/1.5 system-ui,-apple-system,"Segoe UI",sans-serif;color:#1c2126}' +
    '.sk-cookie[hidden]{display:none}' +
    '.sk-card{max-width:28rem;padding:1.25rem;border-radius:12px;background:#fff;box-shadow:0 8px 30px rgb(0 0 0/.25)}' +
    '.sk-card h2{margin:0 0 .5rem;font:700 1.25rem/1.2 inherit;font-family:inherit;color:inherit;letter-spacing:0;max-width:none}' +
    '.sk-card p{margin:0;color:#4d5760}.sk-card a{color:inherit}' +
    '.sk-actions{display:grid;grid-template-columns:1fr 1fr;gap:.75rem;margin-top:1rem}' +
    '.sk-actions button{min-height:2.75rem;padding:.5rem 1rem;border-radius:8px;border:2px solid ' + brand + ';font:600 1rem/1.2 inherit;font-family:inherit;cursor:pointer}' +
    '.sk-accept{background:' + brand + ';color:' + brandText + '}.sk-decline{background:#fff;color:#1c2126}'
  var style = document.createElement('style')
  style.textContent = css
  document.head.appendChild(style)

  // WhatsApp button
  var wa = (d.whatsapp || '').replace(/\D/g, '')
  if (wa) {
    var a = document.createElement('a')
    a.className = 'sk-wa'
    a.href = 'https://wa.me/' + wa + (d.whatsappMessage ? '?text=' + encodeURIComponent(d.whatsappMessage) : '')
    a.target = '_blank'
    a.rel = 'noopener'
    a.setAttribute('aria-label', 'Message us on WhatsApp')
    a.innerHTML =
      '<svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path fill="currentColor" d="M12 3a9 9 0 0 0-7.800 13.500L3 21l4.700-1.200A9 9 0 1 0 12 3Zm-3.500 5h7a1 1 0 0 1 0 2h-7a1 1 0 0 1 0-2Zm0 4h4.500a1 1 0 0 1 0 2H8.500a1 1 0 0 1 0-2Z"/></svg><span>WhatsApp</span>'
    document.body.appendChild(a)
  }

  // Cookie banner and Clarity
  function read() {
    try { var v = localStorage.getItem(KEY); return v === 'granted' || v === 'denied' ? v : null } catch (e) { return null }
  }
  function save(v) { try { localStorage.setItem(KEY, v) } catch (e) {} }

  function loadClarity() {
    if (!clarityId || document.getElementById('clarity-script')) return
    window.clarity = window.clarity || function () { (window.clarity.q = window.clarity.q || []).push(arguments) }
    var s = document.createElement('script')
    s.id = 'clarity-script'
    s.async = true
    s.src = 'https://www.clarity.ms/tag/' + clarityId
    document.head.appendChild(s)
    window.clarity('consentv2', { ad_Storage: 'denied', analytics_Storage: 'granted' })
    // Lets one shared Clarity project be filtered by site.
    window.clarity('set', 'site', site)
  }

  var banner = document.createElement('div')
  banner.className = 'sk-cookie'
  banner.hidden = true
  banner.setAttribute('role', 'dialog')
  banner.setAttribute('aria-live', 'polite')
  banner.setAttribute('aria-label', 'Cookie consent')
  var policy = d.policy === undefined ? '/cookies/' : d.policy
  banner.innerHTML =
    '<div class="sk-card"><h2>A note on cookies</h2>' +
    '<p>With your permission we use Microsoft Clarity to see how people use this site, so we can make it better. Nothing is set until you accept.' +
    (policy ? ' <a href="' + policy + '">Cookie policy</a>' : '') +
    '</p><div class="sk-actions"><button type="button" class="sk-decline">Decline</button><button type="button" class="sk-accept">Accept</button></div></div>'
  document.body.appendChild(banner)

  banner.querySelector('.sk-accept').addEventListener('click', function () {
    save('granted'); loadClarity(); banner.hidden = true
  })
  banner.querySelector('.sk-decline').addEventListener('click', function () {
    var wasGranted = read() === 'granted'
    save('denied')
    banner.hidden = true
    if (wasGranted && window.clarity) {
      // Withdraw consent: Clarity clears its cookies, then reload to unload the script.
      window.clarity('consentv2', { ad_Storage: 'denied', analytics_Storage: 'denied' })
      window.clarity('consent', false)
      window.location.reload()
    }
  })
  document.addEventListener('click', function (e) {
    if (clarityId && e.target.closest && e.target.closest('[data-cookie-settings]')) banner.hidden = false
  })

  var choice = read()
  if (choice === 'granted') loadClarity()
  if (choice === null && clarityId) banner.hidden = false

  window.siteKit = { openCookieSettings: function () { if (clarityId) banner.hidden = false } }
})()
