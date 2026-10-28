---
name: cloudflare-pages-deployer
description: Deploys websites, webapps, and static builds directly to Cloudflare Pages with clean, permanent, branded URLs like `https://<project-name>.pages.dev` (e.g. `kopidesondoro.pages.dev`). Replaces temporary trycloudflare tunnels with permanent global CDN hosting, unlimited bandwidth, free automated SSL, and 1-click custom domain support.
---

# Cloudflare Pages Deployer (.pages.dev)

Use this skill whenever:
- The user wants their website, web application, landing page, or HTML5 game deployed with a clean, branded, and memorable URL (e.g., `https://kopidesondoro.pages.dev`).
- The user rejects ugly, temporary random tunnel hashes (like `trycloudflare.com`).
- The user asks to "deploy ke pages.dev", "online-kan website pake domain bersih", or "publish ke Cloudflare Pages".

## Core Principles & Advantages
1. **Permanent Clean URLs**: Outputs `https://<project-name>.pages.dev` directly. Never expires, unlike temporary tunnel links.
2. **Global CDN & Unlimited Bandwidth**: Hosted on Cloudflare's enterprise edge network across 330+ cities worldwide with 0 rupiah hosting fee.
3. **Automated SSL/TLS**: Instant HTTPS lock icon out-of-the-box.
4. **Instant Custom Domain Support**: The `.pages.dev` project can be mapped to a real custom domain (like `kopidesondoro.com` or `kopidesondoro.my.id`) with 1 click in the Cloudflare dashboard without changing any code.

## Helper Script & Runtime
Engine script:
`C:\Users\akunf\.gemini\config\skills\cloudflare-pages-deployer\scripts\deploy.py`
Python runtime:
`C:\Users\akunf\AppData\Local\hermes\venv\Scripts\python.exe`

## Usage Workflows

### 1. Deploy a WebApp / Website to `.pages.dev`
To deploy the current folder, a build folder (`dist/`), or an `index.html`:
```powershell
& "C:\Users\akunf\AppData\Local\hermes\venv\Scripts\python.exe" "C:\Users\akunf\.gemini\config\skills\cloudflare-pages-deployer\scripts\deploy.py" "<path_to_folder_or_file>" --project-name "<nama_project>"
```
Example for `kopidesondoro`:
```powershell
& "C:\Users\akunf\AppData\Local\hermes\venv\Scripts\python.exe" "C:\Users\akunf\.gemini\config\skills\cloudflare-pages-deployer\scripts\deploy.py" "." --project-name "kopidesondoro"
```
*(Produces: `https://kopidesondoro.pages.dev`)*

### 2. First-Time Authentication Setup
If Cloudflare reports that the user is not authenticated:
- Prompt the user to run:
  ```powershell
  npx wrangler login
  ```
- This opens the browser once to approve Cloudflare. After this one-time approval, all future deployments are fully automatic.

## Response Format in Chat
When deployment succeeds, always present:
- 🌟 **URL Resmi Bersih**: `https://<project-name>.pages.dev`
- 🔒 **Keamanan**: HTTPS (SSL Otomatis Aktif)
- ⚡ **Hosting**: Cloudflare Pages (100% Gratis & Unlimited Kuota)
- 📱 **QR Code**: (ASCII QR code rendered for instant mobile scanning)
- 🌐 **Upgrade ke Domain Pribadi**: Jelaskan bahwa jika user nanti beli `kopidesondoro.com` atau `kopidesondoro.my.id`, domain tersebut bisa langsung dihubungkan ke project ini dalam hitungan detik.
