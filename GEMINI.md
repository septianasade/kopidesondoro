# WORKSPACE PERMANENT RULES & ARCHITECTURE SPECIFICATIONS

## 1. Zero-to-100% Autonomous Execution (No Mid-way Stopping)
- When requested to build any website, webapp, POS, or full-stack system: **execute the complete solution from 0 to 100% immediately**.
- Do not stop halfway to ask "mau lanjut?", do not stop at wireframes or mockups. Build the real database schema, backend logic, UI, routing, and verify with a clean production build (`npm run build`).

## 2. Strict Portal & URL Separation
The customer website and staff portals MUST NEVER be mixed into one view:
- **Customer View (Root URL `/` or `/order` or `https://<domain>.pages.dev/`)**:
  - ONLY displays customer-facing menu, category filters, cart, checkout, and live order tracking.
  - Absolutely NO admin navigation bar, NO role switcher tabs, NO cashier tools visible to the dining public.
- **Admin & Staff Portals (Dedicated Sub-Routes)**:
  - `/login-admin` (or `#/login-admin`) ➔ Admin Back-Office Login (Email + Password)
  - `/terminal-login` (or `#/terminal-login`) ➔ Store Hardware Terminal Login (6-Digit Touchscreen PIN Pad)
  - `/admin` (or `#/admin`) ➔ Owner & Management Dashboard & Staff Manager
  - `/pos` (or `#/pos`) ➔ Cashier POS Terminal (with shift drawer open/close)
  - `/kitchen` (or `#/kitchen` or `#/kds`) ➔ Kitchen Display System (KDS)

## 3. Mandatory Multi-Tier Authentication Architecture (Toast/Moka Enterprise POS Standard)
- **Jalur 1: Admin Back-Office (`/login-admin` -> `/admin`)**:
  - Login menggunakan Email + Password.
  - Khusus Owner & Admin untuk mengelola menu, laporan penjualan, generate QR Meja, dan Manajemen Staf.
  - Sediakan tombol cepat supervisor di dalam dashboard untuk "Buka Layar Kasir" dan "Buka Layar Dapur" untuk pengujian dan supervisi.
- **Jalur 2: Terminal Operasional Toko (`/terminal-login` -> `/pos` atau `/kitchen`)**:
  - Menggunakan sistem Touchscreen PIN Pad 6 digit angka cepat.
  - Memvalidasi 6 digit PIN:
    * Jika role === 'CASHIER' ➔ otomatis ke `/pos` dan memunculkan modal "Buka Shift" jika shift belum aktif.
    * Jika role === 'KITCHEN' ➔ otomatis ke `/kitchen` (KDS).
    * Di pojok layar Kasir & Dapur, sediakan tombol **"Ganti Kasir / Lock Screen"** atau **"Kunci Layar (Lock PIN)"** untuk kembali ke layar PIN seketika tanpa menghapus sesi perangkat toko.
- **Jalur 3: Pelanggan Self-Order (`/order?table=[nomor]&token=[kode_unik]`)**:
  - **TANPA LOGIN AKUN**. Dilarang meminta pelanggan membuat akun, login, atau memasukkan password.
  - Validasi meja via URL query parameter (`table` dan `token`).
  - Checkout hanya meminta "Nama Pemesan" dan "Catatan Tambahan".

## 4. STRICT ZERO CROSS-ROLE BLEED (ROLE QUARANTINE - STRICTLY FORBIDDEN TO CROSS)
- **Kasir DILARANG KERAS bisa membuka menu Dapur atau Admin!**
- **Dapur DILARANG KERAS bisa membuka menu Kasir atau Admin!**
- Di header portal Kasir: HANYA menampilkan identitas Kasir dan tombol Keluar / Lock. Sama sekali TIDAK BOLEH ada tombol/navigasi untuk pindah ke Dapur atau Admin.
- Di header portal Dapur: HANYA menampilkan identitas Dapur dan tombol Keluar / Lock. Sama sekali TIDAK BOLEH ada tombol/navigasi untuk pindah ke Kasir atau Admin.
- Jika pengguna mencoba mengetik URL secara manual (misal Kasir buka `#/kds` atau `#/admin`), sistem WAJIB menampilkan layar blokir **403 Forbidden (Akses Dilarang)** dengan tombol kembali ke portalnya sendiri atau ganti akun.

## 5. MANDATORY REAL-TIME CROSS-PORTAL SYNCHRONIZATION (WAJIB SALING SINKRON)
- Setiap pesanan yang dikirim oleh pelanggan (`CustomerOrderingView`) **WAJIB LANGSUNG MUNCUL** seketika itu juga di portal Kasir (`/pos`) dan portal Dapur (`/kitchen`).
- Sistem harus mengimplementasikan:
  1. `BroadcastChannel` (0ms delay antar-tab browser).
  2. `window.addEventListener('storage')` (fallback lintas jendela/window).
  3. Serverless Cloud KV API / WebSocket / Supabase Realtime (lintas perangkat, misal pembeli di HP dan kasir di PC).
  4. Suara lonceng/chime otomatis (`soundNotifier.playNewOrderChime()`) dan floating banner toast saat ada pesanan baru masuk.
  5. Perubahan status pengerjaan oleh Dapur (Sedang Dimasak / Siap Disajikan) dan status pembayaran oleh Kasir (Lunas) harus langsung terupdate di layar pelanggan secara real-time.
  6. Pesanan yang telah disajikan di Dapur otomatis dipindahkan ke tab "Riwayat Selesai" agar antrean aktif dapur tidak menumpuk/mengganggu.

## 6. Cloudflare Pages SPA Routing
- Must always include `dist/_redirects` and `public/_redirects` (`/* /index.html 200`) and support dual hash-routing (`#/admin`, `#/pos`, `#/kitchen`, `#/terminal-login`) to prevent 404 on refresh.

## 7. Absolute Credential Confidentiality on Auth Screens
- **DILARANG KERAS** menampilkan password, tombol quick-login, atau kredensial default secara terang-terangan (plaintext) di halaman login aplikasi!
- Halaman login harus profesional, aman, dan privasi: input password wajib bertipe `password` (tersembunyi `••••••••`).

## 8. Tactile Hardware POS UI Style (Anti-AI Slop)
- Dilarang menggunakan gradasi ungu-biru neon atau template glassmorphism standar.
- Gaya Neo-Brutalist / Tactile Hardware UI (terinspirasi Square / Teenage Engineering):
  - Base: Warm Off-White (`#F4F1EA`) atau Carbon Dark (`#121212`)
  - Aksen Kontras Tinggi: Acid Green (`#CCFF00`), International Orange (`#FF4F00`)
  - Border tegas 2px solid, hard drop shadows (`shadow-[3px_3px_0px_#000]`), tombol mekanis (`active:translate-y-1 active:shadow-none`).
  - Font: `Space Grotesk` (headings/labels/buttons) dan `JetBrains Mono` (angka harga, PIN pad, nomor meja, antrean, struk).

## 9. Standard Test Accounts & Seeder
- **Admin Back-Office**: `admin@toko.com` | Pass: `admin123` | PIN: `111111`
- **Kasir Toko**: `Budi Kasir` | PIN: `222222`
- **Kepala Dapur**: `Chef Dapur` | PIN: `333333`
- **Meja Contoh**: Meja 01 (`token: MEJA01`) s/d Meja 05 (`token: MEJA05`)
