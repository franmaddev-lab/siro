const potrace = require('potrace'), fs = require('fs'), path = require('path')
const dir = '/tmp/claude-0/fontwork/glyphs', out = {}
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.png'))
let left = files.length
for (const f of files) {
  potrace.trace(path.join(dir, f), { turdSize: 80, optTolerance: 1.4, alphaMax: 1.3, threshold: 128, blackOnWhite: false }, (e, svg) => {
    if (e) throw e
    const d = (svg.match(/ d="([^"]+)"/) || [])[1] || ''
    const m = svg.match(/width="(\d+)" height="(\d+)"/)
    out[f.replace('.png', '')] = { d, w: +m[1], h: +m[2] }
    if (--left === 0) fs.writeFileSync('/tmp/claude-0/fontwork/paths.json', JSON.stringify(out))
  })
}
