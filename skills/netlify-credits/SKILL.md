---
name: netlify-credits
description: Keep Netlify credit usage low on a credit-based plan (Personal 1,000 credits/month, where every production deploy costs 15). Use whenever a repo deploys on Netlify and you are about to push, merge or deploy anything, set up or edit netlify.toml, add pages that run on every visit, or when the user mentions Netlify credits, usage, billing, credits running out, previews, or "how do I see changes without deploying". Also use when moving a site to Netlify.
---

# Netlify credits

On Netlify's credit plans the expensive thing is the number of times the live site is
rebuilt, not the traffic. A small site's visits cost a few credits a month, but each
production deploy (each push or merge to the production branch) costs 15. Ten small pushes
use 150 credits; the same ten changes merged together use 15. Everything below comes from
that.

Rates change, so check https://www.netlify.com/pricing/ if exact numbers matter. At the time
of writing they were: production deploy 15 credits, compute 10 per GB-hour, bandwidth 20 per
GB, web requests 2 per 10,000. Deploy Previews and branch deploys are free to build; only the
visits to them count.

The owner's team is on the **Personal** plan: about $9 a month for 1,000 credits, extra 500
credits for $5. Keep auto recharge on, so a busy month buys more credits instead of pausing
the sites. (Free is 300 credits as a hard limit: when they run out, every site on the team is
paused until next month. Pro is $20 for 3,000.) Running out is now a cost, not an outage, but
the habits below still keep the bill at the base price. As a guide, 1,000 credits is about 60
production deploys a month across all sites, before traffic.

## 1. Work preview-first: main, dev, feature

Throughout, `<site>` is the Netlify site name. Read it from the repo's `CLAUDE.md` or
`README.md`; if it isn't there, ask the user once and write it into `CLAUDE.md`.

Three levels of branch, so only the rare release costs credits:

- **`main`**: the live site. Each merge here is one paid production deploy. It changes only
  when the user says **"release"**.
- **`dev`**: the shared preview and the default place to work. Netlify builds it as a branch
  deploy at `https://dev--<site>.netlify.app`, which costs no deploy credits.
- **feature branches**: only for a big feature, or when the user asks for one. Each has a
  pull request into `dev` (never into `main`), and Netlify builds a Deploy Preview for it at
  `https://deploy-preview-<PR number>--<site>.netlify.app`.

The flow:

1. For ordinary changes, commit to `dev`, push, and give the user the `dev` link.
2. For a big feature, commit to a feature branch and open a pull request with base **`dev`**.
   Read the Netlify bot's PR comment, or the commit status
   `netlify/<site>/deploy-preview`, and give the user the preview link so they don't have to
   open GitHub. Further pushes to the branch refresh the same link. When the user is happy,
   merge it into `dev`. Free.
3. When the user says "release", open one pull request from `dev` into `main` and merge it.
   That's the only paid deploy, however many changes it carries. Say it uses one deploy.

If the repo has no `dev` branch yet, create it from `main`. The `dev` branch deploy has to be
switched on once in Netlify: Site configuration → Build & deploy → Branches and deploy
contexts → Branch deploys → "Let me add individual branches" → `dev`. Leave the production
branch as `main`. Without that, `dev` has no live preview address of its own.

### Sites with client editing

Some sites let the client edit content (see the `client-editing` skill). Then there is a
fourth branch:

- **`edits`**: the client's saves from Pages CMS. A free branch deploy at
  `https://edits--<site>.netlify.app`; add `edits` to the individual branch deploys next to
  `dev`. The client's Publish button merges it into `main`: one paid deploy per publish,
  capped per month (default 10, so up to 150 credits a site). Count that when adding sites.

Because `main` then gets changes that aren't in `dev`, a release always merges `main` into
`dev` first (so the client's edits are kept), builds, and only then merges `dev` into
`main`. After the release, merge `main` into `edits` so the client edits the latest site.
Never merge `dev` into `edits`: unreleased work would go live with the client's next publish.

Never push or merge to `main` to "see what it looks like", and never force-push or delete
`main`. Point out to the user that editing files directly on `main` on GitHub (the pencil
icon) is a paid deploy each time. Edit on `dev` instead.

## 2. Batch merges

Merges into `dev` are free, so merge those whenever a feature is ready. The batching happens
at the `dev` → `main` release: suggest releasing when there's a meaningful bundle, not after
every feature, and say what it saves ("one deploy instead of three, 15 credits instead of
45").

Squash-merging a PR counts as one deploy, however many commits it had.

## 3. Skip builds that change nothing on the site

Add an `ignore` command so pushes that only touch docs, skills or editor config don't build.
Netlify runs it before building: exit code 0 cancels the build, anything else builds.

```toml
[build]
  # Skip the build when only docs, Claude skills or editor files changed.
  # A manual "Trigger deploy" reuses the same commit, so equal refs always build (otherwise
  # Netlify would cancel it); FORCE_BUILD=1 as an environment variable also always builds.
  ignore = """
    [ -n "$FORCE_BUILD" ] && exit 1
    [ -z "$CACHED_COMMIT_REF" ] || [ "$CACHED_COMMIT_REF" = "$COMMIT_REF" ] && exit 1
    git diff --quiet "$CACHED_COMMIT_REF" "$COMMIT_REF" -- . ':(exclude)*.md' ':(exclude).claude/' ':(exclude).vscode/' ':(exclude).github/'
  """
```

Adjust the exclude list to the repo: only exclude paths that really can't change the built
site. If the repo has a monorepo `base` directory, diff that directory instead of `.`.

Tell the user about the catch: after changing an environment variable in Netlify, they need
"Trigger deploy" (which the rule above lets through), and if a deploy is ever cancelled when
it shouldn't be, adding `FORCE_BUILD=1` forces it.

## 4. Make sure it's set up right first

A misconfigured site burns a deploy and still shows nothing. Match `netlify.toml` to how the
site is built:

| Site | `command` | `publish` | Plugin |
| --- | --- | --- | --- |
| Plain HTML, no build | none | `.` | none |
| Astro, static | `npm run build` | `dist` | none |
| Next.js static export (`output: 'export'`) | `npm run build` | `out` | none; adding it breaks the deploy |
| Next.js with server-rendered pages | `npm run build` | `.next` | `@netlify/plugin-nextjs` |

Signs it's wrong, from the deploy log: "No build steps found" (no build command on a site
that needs one), or "0 new function(s) to upload" on a Next.js site with server-rendered
pages (adapter not running, every page 404s). Run the build locally (`npm run build`) before
pushing, so a failed build doesn't cost a deploy.

## 5. Cut compute on busy pages (only once traffic grows)

Pages that render on every visit (in Next.js, `ƒ (Dynamic)` in the build output) run a
server function each time and use compute credits. If a page only needs data that's a few
minutes old, cache it instead:

- Next.js without Cache Components: `export const revalidate = 300` in the page, and remove
  anything that forces it dynamic for no reason (`await connection()`, reading cookies or
  headers when it doesn't need them). Pages that read `searchParams` stay dynamic; cache the
  data call instead with `unstable_cache(fn, [key], { revalidate: 300 })`.
- Next.js 16 with Cache Components: use `'use cache'` with `cacheLife('minutes')`.
- Read the version's own docs in `node_modules/next/dist/docs/` first, since the caching API
  has changed between versions.

Don't do this for pages that must be live per visitor (cart, checkout, anything personal).
At low traffic it saves little, so mention it rather than doing it unasked.

## 6. Other small things

- Serve images as compressed WebP/AVIF at the size they're shown; bandwidth is 20 credits/GB.
- Turn off branch deploys for branches nobody looks at, under Site configuration → Build &
  deploy → Branches and deploy contexts. Keep `dev`, and `edits` on sites with client editing.
- If the site lives somewhere else for now, stop Netlify builds under
  Build & deploy → Continuous deployment → Stop builds. Previews stop too.
- Check Team → Usage & billing after a week to see where credits actually go.

## How to talk to the user

The user may be non-technical and on their phone. Keep it to what they need to do and what it
saves, and send the preview link directly. Work on `dev` is free; only a "release" into `main`
costs a deploy, and say so when you do it. Never push to `main` without being asked.
