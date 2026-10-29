---
name: cloudflare-pages-deployer
description: Deploys websites and static builds directly to Cloudflare Pages with permanent .pages.dev URLs (e.g. kopidesondoro.pages.dev) autonomously using Cloudflare API Token.
---

# Cloudflare Pages Autonomous Deployer

Deploy full-stack web applications and static builds directly to Cloudflare Pages with clean, permanent, unblocked URLs (`https://<project-name>.pages.dev`).

## Environment Configuration
Store credentials in `.env`:
```env
CLOUDFLARE_API_TOKEN=your-token-here
CLOUDFLARE_ACCOUNT_ID=619a0c0dfc9779833f3887746c94cb5a
```

## Standard Autonomous Deployment Command
```powershell
$env:CLOUDFLARE_API_TOKEN=$env:CLOUDFLARE_API_TOKEN
$env:CLOUDFLARE_ACCOUNT_ID="619a0c0dfc9779833f3887746c94cb5a"

# If project does not exist yet:
npx wrangler pages project create <project-name> --production-branch main --force

# Deploy dist:
npx wrangler pages deploy dist --project-name <project-name> --branch main --commit-dirty=true
```

## SPA Routing Fallback
Always include `dist/_redirects`:
```text
/* /index.html 200
```
This guarantees `/admin`, `/pos`, and `/kds` routes do not 404 on hard refresh.
