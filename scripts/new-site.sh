#!/usr/bin/env bash
# Creates a new client site from this template:
#   private GitHub repo with main + dev, safe git identity, Dependabot, secret check,
#   a Netlify project linked to the repo with a dev preview, and a locked preview password.
#
# Usage: scripts/new-site.sh <site-name>
#   <site-name> is lowercase letters, numbers and dashes. It becomes the repo name, the
#   Netlify project name and the address https://dev--<site-name>.netlify.app
#
# Needs: gh and netlify logged in on this machine. Optional: ~/.config/site-template/env
# with PREVIEW_NOTIFY_URL=... for "preview opened" alerts.
set -euo pipefail

NAME="${1:-}"
OWNER="franmaddev-lab"
TEMPLATE="$OWNER/site-template"
GIT_NAME="franmaddev-lab"
GIT_EMAIL="325382883+franmaddev-lab@users.noreply.github.com"
SITES_DIR="${SITES_DIR:-$HOME/sites}"
CONF_DIR="$HOME/.config/site-template"

die() { echo "Error: $*" >&2; exit 1; }
step() { echo; echo "== $*"; }

[[ "$NAME" =~ ^[a-z0-9][a-z0-9-]{1,40}$ ]] || die "site name must be lowercase letters, numbers and dashes, e.g. janes-bakery"
command -v gh >/dev/null || die "gh is not installed"
command -v netlify >/dev/null || die "netlify is not installed (npm install -g netlify-cli)"
gh auth status >/dev/null 2>&1 || die "gh is not logged in (gh auth login)"
netlify api getCurrentUser >/dev/null 2>&1 || die "netlify is not logged in (netlify login)"
gh repo view "$OWNER/$NAME" >/dev/null 2>&1 && die "the repo $OWNER/$NAME already exists"
[ -e "$SITES_DIR/$NAME" ] && die "$SITES_DIR/$NAME already exists"
netlify api getSite --data "{\"site_id\":\"$NAME.netlify.app\"}" >/dev/null 2>&1 && die "the Netlify name $NAME is taken; pick another site name"

step "Creating the private repo $OWNER/$NAME from the template"
gh repo create "$OWNER/$NAME" --private --template "$TEMPLATE" >/dev/null
mkdir -p "$SITES_DIR"
# The template copy can take a few seconds to appear.
for _ in 1 2 3 4 5 6 7 8 9 10; do
  gh api "repos/$OWNER/$NAME/branches/main" >/dev/null 2>&1 && break
  sleep 3
done
gh repo clone "$OWNER/$NAME" "$SITES_DIR/$NAME" -- -q
cd "$SITES_DIR/$NAME"
git config user.name "$GIT_NAME"
git config user.email "$GIT_EMAIL"
git config core.hooksPath .githooks

step "Switching on Dependabot"
gh api -X PUT "repos/$OWNER/$NAME/vulnerability-alerts" >/dev/null
gh api -X PUT "repos/$OWNER/$NAME/automated-security-fixes" >/dev/null

step "Preparing the dev branch"
git checkout -q -b dev
# Template-only files do not belong in a client site.
git rm -rq --ignore-unmatch skills scripts
cat > CLAUDE.md <<MD
# $NAME website

Astro showcase site built from the \`site-template\` repo, hosted on Netlify.
Everything specific to this business is in \`site.config.ts\` and \`public/\`. See README.md.

## Netlify

- Netlify site name: \`$NAME\`
- Preview of \`dev\`: https://dev--$NAME.netlify.app
- Feature previews: https://deploy-preview-<PR number>--$NAME.netlify.app
- Deploy rules come from the shared \`netlify-credits\` skill on the owner's claude.ai
  account. Work on \`dev\`; \`main\` changes only when the owner says "release".
- While \`preview.mode\` in \`site.config.ts\` is not \`off\`, production builds are skipped on
  purpose, so the live address shows nothing. Going live means setting it to \`off\` on
  \`dev\` and releasing.

## Rules

- Commits use the identity already set in this clone. Never use a real name or work email.
- Never force-push or delete \`main\`.
- No secrets in the repo. The preview password lives only in Netlify environment variables.
MD
# A change to a real site file, so the first dev push is never skipped as "docs only".
python3 - "$NAME" <<'PY'
import sys
p = 'site.config.ts'
s = open(p).read()
title = sys.argv[1].replace('-', ' ').title()
open(p, 'w').write(s.replace("name: 'Example Business',", "name: '" + title + "',", 1))
PY
git add -A
git commit -qm "Set up $NAME from the site template"

step "Creating the Netlify project $NAME"
ACCOUNT="$(netlify api listAccountsForUser | python3 -c 'import json,sys; print(json.load(sys.stdin)[0]["slug"])')"
INSTALL_ID="$(netlify api listSites --data '{"filter":"all"}' | python3 -c '
import json,sys
for s in json.load(sys.stdin):
    i=(s.get("build_settings") or {}).get("installation_id")
    if i: print(i); break')"
[ -n "$INSTALL_ID" ] || die "could not find Netlify's GitHub connection on an existing project"
REPO_ID="$(gh api "repos/$OWNER/$NAME" --jq .id)"
netlify api createSiteInTeam --data "$(python3 - "$ACCOUNT" "$NAME" "$OWNER" "$INSTALL_ID" "$REPO_ID" <<'PY'
import json,sys
account,name,owner,install,repo_id=sys.argv[1:6]
print(json.dumps({"account_slug":account,"body":{"name":name,"repo":{
  "provider":"github","repo":f"{owner}/{name}","id":int(repo_id),"private":True,"branch":"main",
  "cmd":"npm run build","dir":"dist","installation_id":int(install),
  "allowed_branches":["main","dev"],
  # Netlify builds main the moment a project is created, and that first build is a paid
  # production deploy the skip rule cannot stop. Builds stay off until the password is set.
  "stop_builds":True}}}))
PY
)" >/dev/null || die "Netlify could not create the project. If Netlify's GitHub app only has access to selected repos, add $NAME to it on GitHub (Settings → Applications → Netlify → Configure), then create the project in Netlify by hand."
netlify link --name "$NAME" >/dev/null

step "Setting the preview password"
mkdir -p "$CONF_DIR/sites"
PASSWORD="$(python3 -c 'import secrets; w=secrets.token_hex(2); print(f"preview-{secrets.token_urlsafe(6)}-{w}")')"
umask 077
printf 'PREVIEW_PASSWORD=%s\n' "$PASSWORD" > "$CONF_DIR/sites/$NAME.env"
netlify env:set PREVIEW_PASSWORD "$PASSWORD" >/dev/null
if [ -f "$CONF_DIR/env" ]; then
  # shellcheck disable=SC1091
  . "$CONF_DIR/env"
  [ -n "${PREVIEW_NOTIFY_URL:-}" ] && netlify env:set PREVIEW_NOTIFY_URL "$PREVIEW_NOTIFY_URL" >/dev/null
fi

step "Switching builds on"
netlify api updateSite --data "{\"site_id\":\"$NAME.netlify.app\",\"body\":{\"build_settings\":{\"stop_builds\":false}}}" >/dev/null

step "Pushing dev (this starts the free preview build)"
git push -q -u origin dev

cat <<DONE

Done.
  Repo:      https://github.com/$OWNER/$NAME
  Local:     $SITES_DIR/$NAME
  Preview:   https://dev--$NAME.netlify.app  (ready in a minute or two)
  Password:  saved in $CONF_DIR/sites/$NAME.env (not printed here)
Next: fill in site.config.ts and public/, commit to dev, push.

One manual step: this Netlify team puts its own login in front of new projects, which a
prospect cannot pass. In Netlify open the project, go to Project configuration, Access &
security, and switch that protection off. The preview password page then takes over.
DONE
