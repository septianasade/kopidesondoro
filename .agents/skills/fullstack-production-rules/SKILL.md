---
name: fullstack-production-rules
description: Mandatory production standards for web application architectures. Enforces: 1) 0 to 100% end-to-end execution without stopping halfway; 2) Strict separation between Customer URL (root) and Staff/Admin portals (/admin, /pos, /kitchen); 3) Mandatory Multi-Tier Authentication Gate (Admin Email+Password, Terminal 6-digit PIN Pad, Customer Zero-Login); 4) Strict Role Quarantine (Kasir cannot access KDS/Admin, KDS cannot access Kasir/Admin); 5) Mandatory Real-Time Cross-Portal Sync (Customer orders immediately push to Kasir and KDS); 6) Tactile Hardware POS UI style.
---

# Fullstack Production Standards & Role Isolation Rules

When building web applications, POS systems, restaurant ordering platforms, or multi-portal systems, NEVER violate these rules:

## Rule 1: 0-to-100% Autonomous Execution
Execute complete, working code from backend to frontend. Never pause midway for unnecessary questions. Build the real database schema, backend logic, UI, routing, and verify with a clean production build (`npm run build`).

## Rule 2: Strict Portal Separation
- Root URL (`/` or `/order`): Pure customer self-ordering experience. Zero staff or admin UI elements.
- Staff Portals: Dedicated routes (`/admin`, `/pos`, `/kitchen`).

## Rule 3: Multi-Tier 3-Jalur Authentication (Toast/Moka Standard)
- **Jalur 1: Admin Back-Office (`/login-admin` -> `/admin`)**:
  - Email + Password login.
  - Access to menu management, sales reports, table QR generator, and **Manajemen Staf** (add Kasir/Dapur, assign unique 6-digit PIN).
  - Quick supervisor buttons inside `/admin` to open POS or Kitchen screens directly for testing.
- **Jalur 2: Terminal Operasional Toko (`/terminal-login` -> `/pos` or `/kitchen`)**:
  - Touchscreen Numpad PIN Pad (6-digit PIN).
  - PIN validation:
    * `role === 'CASHIER'`: routes to `/pos`, pops up "Buka Shift" modal (input starting cash drawer) if no active shift. "Ganti Kasir / Lock Screen" button in top corner locks back to PIN Pad.
    * `role === 'KITCHEN'`: routes to `/kitchen` (KDS) with real-time queue and "Kunci Layar / Lock Screen" button.
- **Jalur 3: Pelanggan Self-Order (`/order?table=[nomor]&token=[kode_unik]`)**:
  - **Zero login/account**. Never ask customer to create an account or enter a password. Access via table query parameters (`table` & `token`). Checkout only asks for "Nama Pemesan" & "Catatan".

## Rule 4: STRICT ZERO CROSS-ROLE BLEED (ROLE QUARANTINE - STRICTLY FORBIDDEN)
- **Kasir DILARANG KERAS bisa membuka menu Dapur atau Admin!**
- **Dapur DILARANG KERAS bisa membuka menu Kasir atau Admin!**
- Di header portal Kasir: HANYA menampilkan identitas Kasir dan tombol Keluar/Lock. Sama sekali TIDAK BOLEH ada tombol/navigasi untuk pindah ke Dapur atau Admin.
- Di header portal Dapur: HANYA menampilkan identitas Dapur dan tombol Keluar/Lock. Sama sekali TIDAK BOLEH ada tombol/navigasi untuk pindah ke Kasir atau Admin.
- Jika pengguna mencoba mengetik URL secara manual (misal Kasir buka `#/kds` atau `#/admin`), sistem WAJIB menampilkan layar blokir **403 Forbidden (Akses Dilarang)** dengan tombol kembali ke portalnya sendiri atau ganti akun.

## Rule 5: MANDATORY REAL-TIME CROSS-PORTAL SYNCHRONIZATION (WAJIB SALING SINKRON)
- Setiap pesanan yang dikirim oleh pelanggan **WAJIB LANGSUNG MUNCUL** seketika itu juga di portal Kasir (`/pos`) dan portal Dapur (`/kitchen`).
- Sistem harus mengimplementasikan:
  1. `BroadcastChannel` (0ms delay antar-tab browser).
  2. `window.addEventListener('storage')` (fallback lintas jendela).
  3. Serverless Cloud KV API / WebSocket / Realtime (lintas perangkat, misal pembeli di HP dan kasir di PC).
  4. Audio chime (`soundNotifier.playNewOrderChime()`) dan floating banner toast saat ada pesanan baru masuk.
  5. Perubahan status pengerjaan oleh Dapur (Sedang Dimasak / Siap Disajikan) dan status pembayaran oleh Kasir (Lunas) harus langsung terupdate di layar pelanggan secara real-time.
  6. Pesanan yang telah disajikan di Dapur otomatis dipindahkan ke tab "Riwayat Selesai" agar antrean aktif dapur tidak menumpuk/mengganggu.

## Rule 6: Absolute Credential Confidentiality on Auth Screens
- **DILARANG KERAS** menampilkan password, tombol quick-login, atau kredensial default secara terang-terangan (plaintext) di halaman login aplikasi!
- Halaman login harus profesional, aman, dan privasi: input password wajib bertipe `password` (tersembunyi `••••••••`) tanpa membocorkan kata sandi akun apa pun ke publik.

## Rule 7: Tactile Hardware POS UI Style (Anti-AI Slop)
- Dilarang menggunakan gradasi ungu-biru neon atau template glassmorphism standar.
- Gaya Neo-Brutalist / Tactile Hardware UI (terinspirasi Square / Teenage Engineering):
  - Base: Warm Off-White (`#F4F1EA`) atau Carbon Dark (`#121212`)
  - Aksen Kontras Tinggi: Acid Green (`#CCFF00`), International Orange (`#FF4F00`)
  - Border tegas 2px solid, hard drop shadows (`shadow-[3px_3px_0px_#000]`), tombol mekanis (`active:translate-y-1 active:shadow-none`).
  - Font: `Space Grotesk` (headings/labels/buttons) dan `JetBrains Mono` (angka harga, PIN pad, nomor meja, antrean, struk).
