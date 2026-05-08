# Design Specification: Smart Resource Optimizer (SRO)

**Date:** 2026-05-08
**Status:** Approved
**Stack:** Laravel 11 (API), Next.js (Frontend), MySQL 8.0, Redis

## 1. Executive Summary
Smart Resource Optimizer (SRO) adalah platform marketplace untuk mendistribusi makanan berlebih dari Restoran ke Komunitas. Platform ini menggunakan model klaim langsung dengan sistem verifikasi pengguna yang ketat dan dukungan logistik hybrid (pickup/pihak ketiga).

## 2. Architecture Overview
- **Backend**: Laravel 11 (Headless API)
    - Auth: Laravel Sanctum
    - Patterns: Service/Action Pattern for Business Logic
- **Frontend**: Next.js (App Router, Tailwind CSS)
    - Communication: Axios/Fetch to Laravel API
- **Database**: MySQL 8.0 (Spatial data for Geo-location)
- **Caching/Queue**: Redis

## 3. Database Schema
### Users & Profiles
- `users`: id, email, password, role (admin, restaurant, community)
- `profiles`: user_id, name, address, lat, long, verification_status (pending, verified, rejected), documents_url

### Inventory & Marketplace
- `food_posts`: id, restaurant_id, title, description, quantity, weight, expired_at, status (active, completed, expired), image_url

### Transactions & Logistics
- `transactions`: id, food_post_id, community_id, quantity, status (pending, approved, ongoing, completed, cancelled)
- `logistics`: transaction_id, method (pickup, third_party), tracking_number, status

## 4. Key Workflows
### A. User Verification
1. User mendaftar dan mengunggah dokumen legal.
2. Status default adalah `pending`.
3. Admin melakukan verifikasi manual melalui Dashboard Admin.
4. User hanya bisa mengakses fitur posting/klaim setelah status menjadi `verified`.

### B. Food Distribution
1. Restoran memposting makanan berlebih.
2. Komunitas mencari makanan berdasarkan lokasi terdekat.
3. Komunitas melakukan klaim.
4. Restoran menyetujui klaim.
5. Proses pengiriman dilakukan (Pickup atau Third-party).

## 5. API Endpoints (Highlights)
- `POST /api/auth/login`
- `GET /api/food-posts` (Search with Radius)
- `POST /api/food-posts` (Restaurant only)
- `POST /api/food-posts/{id}/claim` (Community only)
- `PATCH /api/admin/verify/{user_id}` (Admin only)

## 6. Security & Safety
- **Food Safety**: Validasi `expired_at` yang ketat.
- **Verification**: Mandatory manual review untuk mencegah penyalahgunaan.
- **Rate Limiting**: Melindungi API dari abuse.

## 7. Development Phases
1. **Phase 1**: Backend API - Auth, User Profile & Verification.
2. **Phase 2**: Backend API - Food Posting & Geolocation Search.
3. **Phase 3**: Backend API - Transaction & Logistics Logic.
4. **Phase 4**: Frontend Next.js - Integration & UI/UX.
