---
name: fullstack-production-rules
description: Mandatory production standards for web application architectures. Enforces: 1) 0 to 100% end-to-end execution without stopping halfway; 2) Strict separation between Customer URL (root) and Staff/Admin portals (/admin, /pos, /kds); 3) Mandatory Authentication Gate on all staff routes; 4) Strict Role Quarantine (Kasir cannot access KDS/Admin, KDS cannot access Kasir/Admin); 5) Mandatory Real-Time Cross-Portal Sync (Customer orders immediately push to Kasir and KDS).
---

# Fullstack Production Standards & Role Isolation Rules

When building web applications, POS systems, restaurant ordering platforms, or multi-portal systems, NEVER violate these rules:

## Rule 1: 0-to-100% Autonomous Execution
Execute complete, working code from backend to frontend. Never pause midway for unnecessary questions.

## Rule 2: Strict Portal Separation
- Root URL (`/`): Pure customer experience. Zero staff or admin UI elements.
- Staff Portals: Dedicated routes (`/admin`, `/pos`, `/kds`).

## Rule 3: Mandatory Authentication Gate
All staff portals must require username & password. No unauthenticated backdoor access. Prominent Logout button must be present.

## Rule 4: STRICT ZERO CROSS-ROLE BLEED (ROLE QUARANTINE - STRICTLY FORBIDDEN)
- **Kasir DILARANG KERAS bisa membuka menu Dapur atau Admin!**
- **Dapur DILARANG KERAS bisa membuka menu Kasir atau Admin!**
- Di header portal Kasir: HANYA menampilkan identitas Kasir dan tombol Keluar. Sama sekali TIDAK BOLEH ada tombol/navigasi untuk pindah ke Dapur atau Admin.
- Di header portal Dapur: HANYA menampilkan identitas Dapur dan tombol Keluar. Sama sekali TIDAK BOLEH ada tombol/navigasi untuk pindah ke Kasir atau Admin.
- Jika pengguna mencoba mengetik URL secara manual (misal Kasir buka `#/kds` atau `#/admin`), sistem WAJIB menampilkan layar blokir **403 Forbidden (Akses Dilarang)** dengan tombol kembali ke portalnya sendiri.

## Rule 5: MANDATORY REAL-TIME CROSS-PORTAL SYNCHRONIZATION (WAJIB SALING SINKRON)
- Setiap pesanan yang dikirim oleh pelanggan **WAJIB LANGSUNG MUNCUL** seketika itu juga di portal Kasir (`/pos`) dan portal Dapur (`/kds`).
- Sistem harus mengimplementasikan:
  1. `BroadcastChannel` (0ms delay antar-tab browser).
  2. `window.addEventListener('storage')` (fallback lintas jendela).
  3. Serverless Cloud KV API / WebSocket / Realtime (lintas perangkat, misal pembeli di HP dan kasir di PC).
  4. Audio chime (`soundNotifier.playNewOrderChime()`) dan floating banner toast saat ada pesanan baru masuk.
  5. Perubahan status pengerjaan oleh Dapur (Sedang Dimasak / Siap Disajikan) dan status pembayaran oleh Kasir (Lunas) harus langsung terupdate di layar pelanggan secara real-time.


## Rule 6: Absolute Credential Confidentiality on Auth Screens
- **DILARANG KERAS** menampilkan password, tombol quick-login, atau kredensial default secara terang-terangan (plaintext) di halaman login aplikasi!
- Halaman login harus profesional, aman, dan privasi: input password wajib bertipe `password` (tersembunyi `••••••••`) tanpa membocorkan kata sandi akun apa pun ke publik.
