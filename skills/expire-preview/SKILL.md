---
name: expire-preview
description: Switch off a prospect's preview website so the link they were sent stops working. Use when the user says "expire preview", "disable the preview", "take the preview down", "they said no", "the prospect has seen it" or wants a pitched site hidden. Also use to bring a preview back ("reopen the preview"). Applies to sites built from the site-template repo.
---

# Expire or reopen a preview

Sites built from `site-template` have `preview.mode` in `site.config.ts`:

- `locked`: password page, then the site
- `expired`: every address shows "This preview is no longer available"
- `off`: public site

## Expire

1. On `dev`, change `preview.mode` to `'expired'`. Keep the line's layout exactly; the
   build-skip rule in `netlify.toml` reads it.
2. Commit and push to `dev`. The build is free.
3. When the build finishes, load `https://dev--<site>.netlify.app` and confirm it shows the
   expired page (HTTP 410). Tell the user it is down.

Do not delete the repo or the Netlify project unless the user asks for that separately;
expiring keeps the work in case the prospect comes back.

## Reopen

Set `preview.mode` back to `'locked'`, push to `dev`, and confirm the password page is back.
If the user wants a new password, they change `PREVIEW_PASSWORD` in the Netlify project's
environment variables (or with `netlify env:set` on their Mac) and trigger a deploy; never
ask for or print the password in chat.

## Older sites

A site without `preview.mode` was not built from the template. Say so, and offer the
manual route: turn on password protection or stop builds in the Netlify project.
