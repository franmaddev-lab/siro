---
name: new-site
description: Create a new client website from the owner's site-template repo. Use when the user says "new site", "new website for a business", "set up a site for", "build a site for a prospect", or names a business they want to pitch a website to. Runs a fixed intake interview first so the user never has to remember what to provide, then creates the repo and Netlify project, fills in the site config, and returns the password-protected preview link.
---

# New site

The owner builds showcase websites for small businesses and uses the preview site as the
sales pitch. They do not want to remember what information is needed: you ask for all of it.

Work from a session on the `franmaddev-lab/site-template` repo and read its `CLAUDE.md`
first; it holds the current rules and overrides anything here that has gone stale.

## 1. Intake: ask every question, every time

Ask these before creating anything. Ask them in one or two batches, not one at a time, and
offer sensible defaults where marked. Do not skip a question because the answer seems
obvious; "none" or "not yet" are fine answers.

1. **Showcase site or app?** A showcase site promotes the business (pages, contact,
   add-ons). An app has accounts, a cart or a checkout. An app does not use this template:
   stop and say it needs a Next.js build instead.
2. **Business name**, what they do, and the town or area they serve.
3. **Links and look**: Facebook, Instagram or other pages; screenshots or photos for the
   look and feel. Ask the user to attach screenshots, since social pages often block reading.
4. **Contact details**: phone, WhatsApp number (with country code), email, address, opening
   hours.
5. **Sections and add-ons**: which of contact form, booking, price list, gallery, reviews,
   map, and for each one demo or live. Default for a pitch: all relevant ones in demo.
6. **Tone**: how the copy should sound, and anything that must or must not be said.
7. **Pitch or swap?** Selling the site, or offering it in exchange for a discount on a
   service. This changes the outreach message, not the site.
8. **Site name**: the short name for the repo and address, e.g. `janes-bakery` gives
   `https://dev--janes-bakery.netlify.app`. Suggest one.
9. **Outreach**: should you draft the email or message to send with the link?

Never invent facts about the business (prices, years trading, qualifications, reviews).
Use only what the user gives you or what their pages show. Sample content in demo add-ons
is fine because it is labelled "Demo".

## 2. Create the site

Creating the Netlify project needs the Netlify login, which exists only on the owner's Mac
(or in a cloud environment where they have added a Netlify token). Check with
`netlify api getCurrentUser`. If it fails, say so and stop; do not ask for a token in chat.

Run from the site-template repo:

```bash
scripts/new-site.sh <site-name>
```

It creates the private repo with `main` and `dev`, sets the safe git identity, switches on
Dependabot and the secret check, creates the Netlify project with a `dev` preview, and sets
a generated preview password. It prints where the password is saved; never print the
password itself in chat. Tell the user the file path so they can read it.

## 3. Fill it in

In the new clone, on `dev`:

- Edit `site.config.ts` only: name, tagline, description, theme colours and fonts taken
  from their branding, contact details, hero, services, about, add-ons.
- Put images in `public/` and reference them from the config. Use only images the user
  supplied or that the business clearly owns; compress them first.
- Leave `preview.mode` as `locked` and `clarity.liveId` empty.
- Run `npm install && npm run build` before pushing, so a broken build is caught locally.
- Commit and push to `dev`. That build is free.

Check the result at 375px and 1280px wide before telling the user it is ready.

## 4. Hand over

Give the user:

- the preview link `https://dev--<site-name>.netlify.app`
- the path of the file holding the password
- a reminder that their phone gets a notification when the prospect unlocks the preview,
  and that Clarity shows what they did only if they accept cookies
- the outreach draft, if they asked for one: short, plain, specific to this business, with
  the link and password on separate lines

Then stop. Going live (their own Clarity project, a domain, `preview.mode: 'off'`, a
release) happens only when the user says the client has agreed.
