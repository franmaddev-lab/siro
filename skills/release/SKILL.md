---
name: release
description: Publish a site's dev branch to the live site. Use when the user says "release", "go live", "publish", "push it live", "make it live" or "deploy to production" for a website hosted on Netlify with a main/dev branch flow. Merges dev into main once, states the cost, and verifies the live site afterwards.
---

# Release

A release is the only step that costs Netlify credits (one production deploy, 15 credits), so do it once, deliberately, and say what it cost.

1. Read the repo's `CLAUDE.md` for the Netlify site name and any site-specific rules.
2. Check there is something to release: compare `main...dev`. If `dev` is not ahead, say so
   and stop.
3. Check `dev` is healthy: the latest `dev` preview built, and for a build-step site
   `npm run build` passes locally. Do not release a broken preview.
   If the site has client editing (an `edits` branch or `.pages.yml`), first merge `main`
   into `dev`, so the client's published edits are kept. Merge, don't rebase. On a conflict
   in `content/`, keep the client's version (from `main`) unless the owner says otherwise.
   Then build and push `dev` and check its preview.
4. Summarise for the user in two or three lines what will go live, and that it uses one
   deploy. If the user's message was already a clear instruction to release, carry on;
   otherwise wait for a yes.
5. Open one pull request from `dev` into `main` and merge it with a merge commit. Never
   push to `main` directly and never force-push.
6. If the site is still a prospect preview (`preview.mode` in `site.config.ts` is not
   `off`), production builds are skipped on purpose and nothing will go live. Say so and ask
   whether the user wants to make the site public first.
7. On a site with client editing, merge `main` into `edits` afterwards (a free branch
   deploy), so the client keeps editing the latest site. Never merge `dev` into `edits`.
8. Wait for the production deploy, then load the live address and confirm the change is
   there. Report the result plainly, including a failed or skipped deploy. "Skipped due to
   account credit usage exceeded" means the month's credits have run out.

If changes are only docs or Claude files, the build is skipped and costs nothing; say that
instead of claiming a deploy happened.
