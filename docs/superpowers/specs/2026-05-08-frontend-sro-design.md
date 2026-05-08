# Design Specification: Frontend Smart Resource Optimizer (SRO)

**Date:** 2026-05-08
**Status:** Approved
**Stack:** Next.js (App Router), Tailwind CSS, Axios, Lucide React (Icons), Leaflet (Maps)

## 1. Objective
Membangun antarmuka pengguna (Frontend) yang responsif, intuitif, dan fungsional untuk platform SRO, yang terhubung dengan Laravel API yang sudah ada. Fokus utama adalah pada kemudahan akses marketplace (peta & daftar) dan alur kerja verifikasi pengguna.

## 2. User Roles & Experiences
### A. Guest (Public)
- **Landing Page:** Informasi tentang misi SRO dan statistik distribusi makanan.
- **Marketplace Discovery:** Melihat daftar makanan yang tersedia (Read-only). Klik detail/klaim akan mengarahkan ke halaman Login.

### B. Restaurant (Verified/Pending)
- **Dashboard:** Ringkasan statistik (makanan yang didonasikan, klaim aktif).
- **Food Management:** Form untuk memposting makanan baru (Gambar, Deskripsi, Jumlah, Expired At).
- **Verification Status:** Notifikasi jika akun masih dalam status `pending`. Fitur posting terkunci jika belum `verified`.

### C. Community (Verified/Pending)
- **Marketplace Hybrid View:** Tampilan split-screen (Daftar kartu di kiri, Peta interaktif di kanan).
- **Claim System:** Tombol klaim makanan yang hanya aktif jika status pengguna sudah `verified`.
- **My Claims:** Daftar histori makanan yang pernah diklaim dan status pengambilannya.

### D. Admin
- **Verification Dashboard:** Daftar pengguna dengan status `pending` untuk ditinjau dokumennya.
- **System Analytics:** Pantauan aktivitas seluruh platform.

## 3. Technical Architecture
### Data Fetching & Auth
- **Auth:** Laravel Sanctum (Token-based). Token disimpan di `localStorage` atau `HttpOnly Cookie`.
- **Axios Instance:** Konfigurasi base URL ke API Laravel dan penanganan otomatis header `Authorization`.

### Component Structure
- `Navbar`: Dinamis berdasarkan status login dan role.
- `FoodCard`: Komponen kartu untuk marketplace.
- `MapView`: Integrasi peta menggunakan Leaflet.js.
- `VerificationBanner`: Alert global untuk pengguna `pending`.

### Routing Structure
- `/` - Landing Page
- `/marketplace` - Public/Private Marketplace
- `/login` & `/register` - Authentication
- `/dashboard/restaurant` - Restaurant Dashboard
- `/dashboard/community` - Community Dashboard
- `/dashboard/admin` - Admin Dashboard

## 4. UI/UX Principles
- **Clean & Modern:** Dominasi warna hijau (alam/segar) dan putih.
- **Mobile First:** Marketplace harus tetap nyaman digunakan melalui smartphone.
- **Interactive Feedback:** Loading states (skeletons), toast notifications untuk error/sukses.

## 5. Security
- **Next.js Middleware:** Melindungi route dashboard dari akses tanpa login.
- **Role Guards:** Memastikan pengguna tidak bisa mengakses dashboard role lain melalui URL.
