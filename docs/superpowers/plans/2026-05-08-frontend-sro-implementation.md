# Frontend SRO Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Membangun Frontend SRO menggunakan Next.js yang terintegrasi dengan Laravel API dalam struktur monorepo (`backend/` dan `frontend/`).

**Architecture:** Next.js App Router dengan Tailwind CSS di folder `frontend/`. Laravel API di folder `backend/`.

**Tech Stack:** Next.js 14+, Tailwind CSS, Axios, Lucide React, Leaflet.js.

---

### Task 0: Project Restructuring (DONE)
*Sudah dilakukan: Memindahkan Laravel ke folder `backend/`.*

---

### Task 1: Initialize Next.js Project (in frontend/ folder)

**Files:**
- Create: `frontend/package.json`
- Create: `frontend/tailwind.config.ts`

- [ ] **Step 1: Scaffolding Next.js**
Jalankan: `npx create-next-app@latest frontend --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-git`
*Catatan: Dijalankan dari root, akan membuat folder `frontend/`.*

- [ ] **Step 2: Install Dependencies tambahan**
Jalankan: `cd frontend; npm install axios lucide-react leaflet react-leaflet clsx tailwind-merge`
Jalankan dev: `cd frontend; npm install -D @types/leaflet`

- [ ] **Step 3: Verify Setup**
Jalankan: `cd frontend; npm run dev`
Pastikan server berjalan di `http://localhost:3000`.

- [ ] **Step 4: Commit**
```bash
git add .
git commit -m "chore: initialize next.js frontend project in frontend/ folder"
```

---

### Task 2: API Service & Auth Provider

**Files:**
- Create: `frontend/src/lib/axios.ts`
- Create: `frontend/src/context/AuthContext.tsx`
- Create: `frontend/src/services/authService.ts`

- [ ] **Step 1: Setup Axios Instance**
Konfigurasi Base URL ke Laravel API (http://localhost:8000/api).

- [ ] **Step 2: Implement AuthContext**
Buat provider untuk menyimpan `user` data dan `token`. Sediakan fungsi `login`, `logout`, dan `checkAuth`.

- [ ] **Step 3: Implement authService**
Buat fungsi `register` dan `login` yang memanggil endpoint Laravel.

- [ ] **Step 4: Commit**
```bash
git add .
git commit -m "feat: setup axios and auth context"
```

---

### Task 3: Base Layout & Navigation

**Files:**
- Create: `frontend/src/components/layout/Navbar.tsx`
- Modify: `frontend/src/app/layout.tsx`

- [ ] **Step 1: Create Navbar Component**
Tampilkan Logo, Link "Marketplace", dan tombol "Login/Register". Jika sudah login, tampilkan "Dashboard" dan "Logout".

- [ ] **Step 2: Update Root Layout**
Bungkus aplikasi dengan `AuthProvider` dan masukkan `Navbar`.

- [ ] **Step 3: Commit**
```bash
git add .
git commit -m "feat: add navbar and auth provider to layout"
```

---

### Task 4: Authentication Pages (Login & Register)

**Files:**
- Create: `frontend/src/app/login/page.tsx`
- Create: `frontend/src/app/register/page.tsx`

- [ ] **Step 1: Implement Login Page**
Form email & password. Panggil `authService.login` dan simpan token.

- [ ] **Step 2: Implement Register Page**
Multi-step form: Akun (email, pass) -> Profil (name, role, address).

- [ ] **Step 3: Verify Integration**
Tes registrasi user baru dan pastikan data masuk ke database Laravel (via `php artisan tinker` atau cek DB).

- [ ] **Step 4: Commit**
```bash
git add .
git commit -m "feat: implement login and registration pages"
```

---

### Task 5: Middleware & Dashboard Protection

**Files:**
- Create: `frontend/src/middleware.ts`

- [ ] **Step 1: Implement Route Guard**
Cegah akses ke `/dashboard/*` jika token tidak ada. Redirect ke `/login`.

- [ ] **Step 2: Role-based Redirect**
Arahkan user ke dashboard yang sesuai (`/dashboard/restaurant`, `/dashboard/community`, atau `/dashboard/admin`) setelah login.

- [ ] **Step 3: Commit**
```bash
git add .
git commit -m "feat: implement route protection middleware"
```

---

### Task 6: Marketplace Hybrid View

**Files:**
- Create: `frontend/src/app/marketplace/page.tsx`
- Create: `frontend/src/components/marketplace/FoodCard.tsx`
- Create: `frontend/src/components/marketplace/MapView.tsx`

- [ ] **Step 1: Implement Split-Screen Layout**
Kiri (List): Grid kartu makanan. Kanan (Map): Peta interaktif.

- [ ] **Step 2: Create FoodCard Component**
Tampilkan info makanan: Nama, Restoran, Jarak, Expired In.

- [ ] **Step 3: Integrate Leaflet Map**
Tampilkan pin lokasi berdasarkan data `lat` & `long` dari API.

- [ ] **Step 4: Commit**
```bash
git add .
git commit -m "feat: implement hybrid marketplace view"
```
