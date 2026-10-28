---
name: fullstack-production-rules
description: Mandatory production standards for web application architectures. Enforces: 1) 0 to 100% end-to-end execution without stopping halfway; 2) Strict separation between Customer URL (root) and Staff/Admin portals (/admin, /pos, /kds); 3) Mandatory Authentication Gate (username & password) on all staff routes with Logout functionality.
---

# Full-Stack Production & Portal Separation Rules

These rules are permanent and mandatory for all web applications, POS systems, SaaS apps, and restaurant/store platforms.

## Rule 1: Zero-to-100% Autonomous Execution (No Mid-way Stopping)
- When prompted to create an application, POS, or system: **execute the complete solution from 0 to 100%**.
- Implement real backend/database schema, business logic, state management, forms, validations, and production builds (`npm run build`).
- Never stop at mockups, wireframes, partial simulations, or ask user permission for obvious next steps. Complete the build first.

## Rule 2: Strict Portal & URL Separation
Never mix customer and administrative interfaces into one messy view or place role-switcher tabs on customer screens!
- **Customer Facing (`/` or `https://<domain>.pages.dev/` or `/qr/:token`)**:
  - Must ONLY display customer-relevant content: Catalog, Menu, Customizers, Cart, Checkout, and Order Status Tracking.
  - Zero admin UI, zero KDS tabs, zero role dropdowns visible to public diners.
  - Place only a discreet, minimal staff link in the footer (`🔐 Login Staf`).
- **Staff Portals (Separate Dedicated Sub-Routes)**:
  - `/admin` (or `#/admin`): Executive Management, Menus, Tables, Sales Analytics, Settings.
  - `/pos` (or `#/pos`): Cashier Register, Transactions, Shift Reconciliation, Thermal Receipts.
  - `/kds` (or `#/kds`): Kitchen Display System, Production Timers, Audible chimes.

## Rule 3: Mandatory Authentication Gate (Username & Password)
- All staff routes (`/admin`, `/pos`, `/kds`) **MUST BE GATED** behind an Authentication Screen.
- An unauthenticated visitor navigating to `/admin` or `/pos` must be stopped by a Login Form asking for Email/Username and Password.
- Always provide standard pre-configured role accounts for testing and initial operation:
  - **Admin / Owner**: `admin@domain.com` / `admin123`
  - **Cashier**: `kasir@domain.com` / `kasir123`
  - **Kitchen / Bar**: `dapur@domain.com` / `dapur123`
- All staff portals must include a prominent **Keluar / Logout** button to terminate the session and re-lock the portal.

## Rule 4: Cloudflare Pages SPA Routing
- Always generate a `public/_redirects` file containing:
  ```text
  /*    /index.html   200
  ```
- Support both standard pathname routing (`/admin`) and hash routing (`#/admin`) so navigation never triggers 404 on direct browser refresh.
