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

## 4. STRICT ZERO CROSS-ROLE BLEED (ROLE QUARANTINE - STRICTLY FORBIDDEN TO CROSS)
- **Kasir DILARANG KERAS bisa membuka menu Dapur atau Admin!**
- **Dapur DILARANG KERAS bisa membuka menu Kasir atau Admin!**
- Di header portal Kasir: HANYA menampilkan identitas Kasir dan tombol Keluar. Sama sekali TIDAK BOLEH ada tombol/navigasi untuk pindah ke Dapur atau Admin.
- Di header portal Dapur: HANYA menampilkan identitas Dapur dan tombol Keluar. Sama sekali TIDAK BOLEH ada tombol/navigasi untuk pindah ke Kasir atau Admin.
- Jika pengguna mencoba mengetik URL secara manual (misal Kasir buka `#/kds` atau `#/admin`), sistem WAJIB menampilkan layar blokir **403 Forbidden (Akses Dilarang)** dengan tombol kembali ke portalnya sendiri atau langsung redirect otomatis.

## 5. MANDATORY REAL-TIME CROSS-PORTAL SYNCHRONIZATION (WAJIB SALING SINKRON)
- Setiap pesanan yang dikirim oleh pelanggan (`CustomerOrderingView`) **WAJIB LANGSUNG MUNCUL** seketika itu juga di portal Kasir (`/pos`) dan portal Dapur (`/kds`).
- Sistem harus mengimplementasikan:
  1. `BroadcastChannel` (0ms delay antar-tab browser).
  2. `window.addEventListener('storage')` (fallback lintas jendela/window).
  3. Serverless Cloud KV API / WebSocket / Supabase Realtime (lintas perangkat, misal pembeli di HP dan kasir di PC).
  4. Suara lonceng/chime otomatis (`soundNotifier.playNewOrderChime()`) dan floating banner toast saat ada pesanan baru masuk.
  5. Perubahan status pengerjaan oleh Dapur (Sedang Dimasak / Siap Disajikan) dan status pembayaran oleh Kasir (Lunas) harus langsung terupdate di layar pelanggan secara real-time.

## 6. Cloudflare Pages SPA Routing
- Must always include `dist/_redirects` (`/* /index.html 200`) and support dual hash-routing (`#/admin`) to prevent 404 on refresh.
