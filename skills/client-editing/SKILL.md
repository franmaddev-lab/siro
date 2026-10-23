---
name: client-editing
description: Let a client edit their own site content (prices, photos, opening hours, events) without the owner. Use when adding self-editing, a CMS, or a publish button to a client site, or when the owner or client asks how editing, publishing or the edits branch works.
---

# Client editing

Clients change small things themselves (a price, a photo, a workshop date) instead of asking the owner. The owner keeps doing design and code changes. This skill is generic: no site names here. Per-site facts go in each site repo's `CLAUDE.md`.

The reusable files, the diagrams of the cycle and the owner's setup checklist live in `client-editing/` in the `site-template` repo. Read its `README.md` first; send the owner its diagrams when they ask how the cycle works.

## Who changes what

- **Client content** (prices, hours, menu, photos, events): edited by the client in Pages CMS. Saved to the `edits` branch, put live with the Publish button.
- **Owner work** (design, new sections, fixes): `dev` -> preview -> `main` on "release", as usual. Clients never use `dev`, so unfinished work never goes live with their edits.
- `edits` only ever receives work that is already live: never merge `dev` into `edits`.

## Findings behind this setup (checked October 2026)

- Netlify: each successful production deploy costs 15 credits. Branch deploys and Deploy Previews cost 0 credits (traffic to them is still metered).
- Netlify Free: 300 credits a month, hard limit. When they run out, every site on the team is paused ("Site not available") until next month. Never put client sites with self-editing on a free team.
- Netlify Personal: $9/month, 1,000 credits, extra 500 for $5. Pro: $20/month, 3,000 credits, extra 1,500 for $10. Turn on auto recharge so sites never pause.
- Pages CMS (pagescms.org): free, open source, form-based editor, config in `.pages.yml`. The owner signs in with GitHub; clients are invited by email and need no GitHub account. Edits are Git commits, so everything can be undone. `.pages.yml` cannot choose the branch: link people to `https://app.pagescms.org/<owner>/<repo>/edits`, which opens on `edits`.
- Decap CMS: free, but login is the weak point (Git Gateway deprecated for new setups). TinaCMS: free plan covers 2 users only. CloudCannon: from $55/month. Keystatic: needs an SSR adapter on Astro.
- Do not host commercial client sites on Vercel Hobby or GitHub Pages. Cloudflare Pages is a free fallback: 500 builds a month, commercial use allowed.

## Steps

1. **Read the site first.** It may be Astro, plain HTML or a Next.js static export. Adapt; keep the current design.
2. **Move editable content into data files**, e.g. `content/prices.json`, `content/gallery.json`, `content/events.json`. A CMS cannot safely edit `site.config.ts` or any code file. Images go in `public/uploads/`.
3. **Read and validate the data at build time.** Fail the build with a clear message on bad data, so Netlify keeps the last good deploy live. Filter past events at build time in server code (not in the browser) to avoid hydration mismatches.
4. **Add `.pages.yml`** from `client-editing/pages.yml.example`: prices are numbers with min/max, short max lengths, required alt text on images, date pickers, images-only media folder, `settings.hide: true`. Fixed items (like three packages) get a readonly id in a fixed-length list plus `settings.content.merge: true`.
5. **Add the Publish button**:
   - Copy `client-editing/publish.mts` unchanged to `netlify/functions/publish.mts`; add `@netlify/blobs` to the dependencies. All per-site settings are environment variables.
   - Build a `/publish` page in the site's style, `noindex`: password field with a show/hide eye button, the counter, a link to the `edits` preview, the Publish button. Keep the intro on one line when there's room.
   - Messages come from the function: "3 of 10 publishes left this month", "Monthly publishes used. Contact Over a Brew.", and on a conflict "Ask Over a Brew to publish this one" (never force).
6. **Update the site's `CLAUDE.md`**: the release steps (merge `main` into `dev` first, release, then merge `main` into `edits`), the `edits` preview address, the CMS link, the environment variables.
7. **Write `docs/editing-your-site.md`** from `client-editing/editing-your-site.md`: one page, plain English.
8. **Check before reporting done**: the build passes; the site works at 375px and 1280px (one element per row on mobile); branch pushed, preview link shared. Do not merge to `main` without the owner saying "release".
9. **Walk the owner through the one-time setup** in the README's checklist, one step at a time. They do the GitHub token and the Netlify settings themselves; never ask for the token or the password in chat. Then create `edits` from `main` after the release.

## Things that went wrong the first time

- Netlify doesn't list branches: the owner types `edits` under Branch deploys → "Let me add individual branches". Nothing builds until the next save on `edits`.
- Environment variables need **All scopes** (Functions included) and **Same value for all deploy contexts**, and only reach functions after a new deploy. Old previews say "Publishing isn't set up yet"; use the live domain's `/publish`.
- A secret `PUBLISH_PASSWORD` can't be read back. Suggest unticking "secret" for the password only.
- The fine-grained token page hides permissions behind a **+** button: add **Contents**, set **Read and write**.
- Merging an `edits` pull request by hand costs a deploy and GitHub offers "Delete branch", which removes `edits`. Leave "Automatically delete head branches" off; if `edits` disappears, recreate it from `main`.
- Branch protection on `main`: only "Restrict deletions" and "Block force pushes". "Require a pull request" blocks the Publish button. Private repos on GitHub Free can't use rules at all; the warning can be ignored.
- Pages CMS lists every branch; clients picked the wrong one. Give them the `/edits` link and delete merged `claude/` branches.

## Selling it

- "Edit your own prices, hours and photos" is included in every package.
- Care plans cover bigger changes, not small edits.
- Terms: self-edits included up to the monthly publish cap, extra publishes or owner-made changes charged.
- Optional: host each client on their own Netlify account so their usage never touches the owner's credits and they own the site outright.
