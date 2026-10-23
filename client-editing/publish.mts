// Publish button for the client: merges the "edits" branch (where Pages CMS saves) into "main"
// through the GitHub API, which makes Netlify build the live site. Each successful publish counts
// against a monthly cap kept in Netlify Blobs, so client edits can't run up production deploys.
//
// Environment variables (Netlify > Site configuration > Environment variables, never in code):
//   PUBLISH_PASSWORD  password the client types on /publish                       (required)
//   GITHUB_TOKEN      fine-grained token for this repo only, Contents: read & write  (required)
//   GITHUB_REPO       "owner/repo" of this site                                     (required)
//   PUBLISH_CAP       publishes allowed per calendar month, default 10
//   EDITS_BRANCH      default "edits"; LIVE_BRANCH default "main"
//   EDITS_PREVIEW_URL default https://edits--<Netlify site name>.netlify.app
//   CONTACT_NAME      who the client asks for help, default "Over a Brew"
//
// Shared file: the source is client-editing/publish.mts in site-template. Copy it into a site's
// netlify/functions/ unchanged; per-site settings go in the environment variables above.

import { getStore } from '@netlify/blobs'
import { createHash, timingSafeEqual } from 'node:crypto'

const env = (name: string, fallback = '') => process.env[name]?.trim() || fallback

const REPO = env('GITHUB_REPO')
const EDITS = env('EDITS_BRANCH', 'edits')
const LIVE = env('LIVE_BRANCH', 'main')
// SITE_NAME is set by Netlify.
const PREVIEW = env('EDITS_PREVIEW_URL', env('SITE_NAME') ? `https://${EDITS}--${env('SITE_NAME')}.netlify.app` : '')
const WHO = env('CONTACT_NAME', 'Over a Brew')
const CONTACT = `Contact ${WHO}.`

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  })

// Compares hashes so the check takes the same time whatever was typed.
function passwordOk(given: unknown) {
  const expected = env('PUBLISH_PASSWORD')
  if (!expected || typeof given !== 'string') return false
  const a = createHash('sha256').update(given).digest()
  const b = createHash('sha256').update(expected).digest()
  return timingSafeEqual(a, b)
}

function cap() {
  const n = Number.parseInt(env('PUBLISH_CAP', '10'), 10)
  return Number.isFinite(n) && n >= 0 ? n : 10
}

// One counter per calendar month (UK time), e.g. "2026-10".
function monthKey() {
  const [{ value: y }, , { value: m }] = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/London',
    year: 'numeric',
    month: '2-digit',
  }).formatToParts(new Date())
  return `${y}-${m}`
}

const store = () => getStore({ name: 'publishes', consistency: 'strong' })

async function used(): Promise<number> {
  const entry = (await store().get(monthKey(), { type: 'json' })) as { count?: number } | null
  return entry?.count ?? 0
}

// Adds one to this month's count. Conditional writes stop two publishes at once losing a count.
async function countOne() {
  const s = store()
  const key = monthKey()
  for (let attempt = 0; attempt < 5; attempt++) {
    const current = await s.getWithMetadata(key, { type: 'json' })
    const count = ((current?.data as { count?: number } | undefined)?.count ?? 0) + 1
    const result = current
      ? await s.setJSON(key, { count }, { onlyIfMatch: current.etag })
      : await s.setJSON(key, { count }, { onlyIfNew: true })
    if (result.modified) return count
  }
  throw new Error('Could not update the publish counter')
}

function status(usedCount: number) {
  const total = cap()
  const left = Math.max(total - usedCount, 0)
  return {
    left,
    cap: total,
    previewUrl: PREVIEW,
    counter: left > 0 ? `${left} of ${total} publishes left this month` : `Monthly publishes used. ${CONTACT}`,
  }
}

// POST /repos/{repo}/merges: 201 merged, 204 nothing to merge, 409 merge conflict, 404 missing branch.
function github(path: string, body: Record<string, unknown>) {
  return fetch(`https://api.github.com/repos/${REPO}${path}`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${env('GITHUB_TOKEN')}`,
      accept: 'application/vnd.github+json',
      'x-github-api-version': '2022-11-28',
      'user-agent': 'client-editing-publish',
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  })
}

export default async (req: Request) => {
  if (req.method !== 'POST') return json(405, { message: 'Use the Publish page.' })
  if (!env('PUBLISH_PASSWORD') || !env('GITHUB_TOKEN') || !REPO)
    return json(500, { message: `Publishing isn't set up yet. ${CONTACT}` })

  let body: { password?: unknown; action?: unknown }
  try {
    body = await req.json()
  } catch {
    return json(400, { message: 'Bad request.' })
  }

  if (!passwordOk(body.password)) {
    // A short pause makes guessing the password slow.
    await new Promise((r) => setTimeout(r, 1000))
    return json(401, { message: 'That password isn’t right.' })
  }

  const usedCount = await used()
  if (body.action !== 'publish') return json(200, status(usedCount))

  if (usedCount >= cap()) return json(429, { ...status(usedCount), message: `Monthly publishes used. ${CONTACT}` })

  const merge = await github('/merges', {
    base: LIVE,
    head: EDITS,
    commit_message: `Publish client edits from "${EDITS}"`,
  })

  if (merge.status === 204)
    return json(200, { ...status(usedCount), message: 'Nothing new to publish: the live site is already up to date.' })
  // Never force a clash: a person sorts it out.
  if (merge.status === 409) return json(409, { ...status(usedCount), message: `Ask ${WHO} to publish this one.` })
  if (merge.status !== 201) {
    console.error('GitHub merge failed', merge.status, await merge.text())
    return json(502, { ...status(usedCount), message: `Publishing didn’t work this time. ${CONTACT}` })
  }

  const newCount = await countOne()

  // Bring "edits" up to date with "main", so the preview shows any design changes made since.
  // Failing here doesn't matter for the publish, so it's only logged.
  const sync = await github('/merges', { base: EDITS, head: LIVE, commit_message: `Update "${EDITS}" from "${LIVE}"` })
  if (![201, 204].includes(sync.status)) console.error('Could not update edits from main', sync.status)

  return json(200, { ...status(newCount), message: 'Published. The live site updates in a couple of minutes.' })
}

export const config = { path: '/api/publish' }
