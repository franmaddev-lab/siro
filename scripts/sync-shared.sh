#!/usr/bin/env bash
# Copies the shared files from this repo into another site's clone, so every site runs the
# same cookie banner, WhatsApp button and preview password gate.
#
# Usage: scripts/sync-shared.sh <path-to-site-clone> [public-dir]
#   public-dir is where that site serves static files from, relative to its root:
#   "public" for Astro and Next.js (the default), "." for a plain HTML site.
#
# It never commits or pushes: review the diff in the site's clone, then commit to dev.
set -euo pipefail

SRC="$(cd "$(dirname "$0")/.." && pwd)"
DEST="${1:-}"
PUB="${2:-public}"
[ -n "$DEST" ] && [ -d "$DEST/.git" ] || { echo "Usage: $0 <path-to-site-clone> [public-dir]" >&2; exit 1; }
[ "$(cd "$DEST" && pwd)" != "$SRC" ] || { echo "That is the template itself." >&2; exit 1; }

mkdir -p "$DEST/$PUB" "$DEST/netlify/edge-functions"
cp "$SRC/public/site-kit.js" "$DEST/$PUB/site-kit.js"
cp "$SRC/netlify/edge-functions/preview-gate.ts" "$DEST/netlify/edge-functions/preview-gate.ts"
echo "Copied site-kit.js to $PUB/ and preview-gate.ts to netlify/edge-functions/"

if [ ! -f "$DEST/netlify/preview.config.ts" ]; then
  cat > "$DEST/netlify/preview.config.ts" <<'CFG'
// What the shared preview gate needs to know about this site.
export default {
  name: 'Business name',
  lang: 'en-GB',
  // off: no password. locked: password page. expired: "preview no longer available".
  mode: 'off' as 'off' | 'locked' | 'expired',
  // 'previews': only Netlify preview addresses (dev--site.netlify.app), never the live site.
  // 'all': every address, including the live one.
  scope: 'previews' as 'all' | 'previews',
  contactLine: 'Questions? Reply to the message that brought you here.',
  theme: {
    brand: '#1f5f8b', brandText: '#ffffff', ink: '#1c2126', paper: '#ffffff',
    surface: '#f3f5f7', muted: '#5b6670', radius: '10px',
    fontHeading: 'system-ui, sans-serif', fontBody: 'system-ui, sans-serif',
  },
}
CFG
  echo "Created netlify/preview.config.ts (mode off): fill in the name and colours."
fi

if ! grep -q 'preview-gate' "$DEST/netlify.toml" 2>/dev/null; then
  cat <<'NOTE'

Add this to the site's netlify.toml once:

[[edge_functions]]
  function = "preview-gate"
  path = "/*"

And load the kit on every page, before </body>:

<script src="/site-kit.js" defer data-site="..." data-clarity="..." data-whatsapp="..."></script>
NOTE
fi
