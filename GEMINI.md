# WORKSPACE PERMANENT RULES & ARCHITECTURE SPECIFICATIONS

## 1. Zero-to-100% Autonomous Execution (No Mid-way Stopping)
- When requested to build any website, webapp, POS, or full-stack system: **execute the complete solution from 0 to 100% immediately**.
- Do not stop halfway to ask "mau lanjut?", do not stop at wireframes or mockups. Build the real database schema, backend logic, UI, routing, and verify with a clean production build (`npm run build`).

## 2. Strict Portal & URL Separation
The customer website and staff portals MUST NEVER be mixed into one view:
- **Customer View (Root URL `/` or `https://<domain>.pages.dev/`)**:
  - ONLY displays customer-facing menu, category filters, cart, checkout, and live order tracking.
  - Absolutely NO admin navigation bar, NO role switcher tabs, NO cashier tools visible to the dining public.
- **Admin & Staff Portals (Dedicated Sub-Routes)**:
  - `/admin` (or `#/admin`) ➔ Owner & Management Dashboard
  - `/pos` (or `#/pos`) ➔ Cashier POS Terminal
  - `/kds` (or `#/kds`) ➔ Kitchen Display System

## 3. Mandatory Authentication Gate (Username & Password)
- All staff routes (`/admin`, `/pos`, `/kds`) MUST be gated behind an Authentication Screen (`StaffLoginPage`).
- Visitors must enter valid credentials.
- Default test accounts provided:
  - **Admin / Owner**: `admin@sondoro.com` / `admin123`
  - **Kasir**: `kasir@sondoro.com` / `kasir123`
  - **Dapur**: `dapur@sondoro.com` / `dapur123`
- A prominent **Keluar / Logout** button must be present in the staff header to lock the portal.

## 4. Cloudflare Pages SPA Routing
- Must always include `public/_redirects` (`/* /index.html 200`) and support dual hash-routing (`#/admin`) to prevent 404 on refresh.
