# 🐄 Cattle Catalog Web Application

Katalog dan monitoring sapi dengan informasi lengkap, transparan, dan riwayat pertumbuhan yang terdokumentasi.

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue?style=flat-square&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?style=flat-square&logo=prisma)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat-square&logo=tailwind-css)

## ✨ Fitur

### Public
- Katalog sapi dengan filter dan search
- Halaman detail sapi
- Grafik perkembangan bobot
- Riwayat kesehatan dan pakan
- QR Code untuk setiap sapi
- Responsif (mobile-first)

### Admin
- Dashboard dengan statistik
- CRUD sapi lengkap
- Manajemen data timbang
- Manajemen kesehatan
- Manajemen pakan
- Upload dokumentasi

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm atau yarn
- PostgreSQL database

### 1. Clone & Install

```bash
git clone <repo-url>
cd cattle-catalog
npm install
```

### 2. Setup Environment

```bash
cp .env.example .env
```

Edit `.env`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/cattle_catalog"
JWT_SECRET="generate-a-random-secret-key"
JWT_EXPIRES_IN="24h"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Database Setup

```bash
# Push schema ke database
npm run db:push

# Seed dengan data sample
npm run db:seed
```

### 4. Run Development Server

```bash
npm run dev
```

Buka http://localhost:3000

### 5. Admin Login

```
Email:    admin@sapikatalog.com
Password: admin123
```

---

## 🐳 Docker Setup (Optional)

### Development dengan Docker

```bash
# Start containers
docker-compose up -d

# Setup database
docker-compose exec app npx prisma db push
docker-compose exec app npm run db:seed

# Buka http://localhost:3000
```

### Useful Commands

```bash
# View logs
docker-compose logs -f

# Stop containers
docker-compose down

# Stop + hapus data
docker-compose down -v

# Restart
docker-compose restart
```

---

## 🌐 Deployment ke Vercel

### Prerequisites

1. Akun Vercel (https://vercel.com)
2. PostgreSQL database

### Step 1: Buat PostgreSQL Database

**Opsi A: Vercel Postgres (Recommended)**
1. Buka https://vercel.com/dashboard
2. New Project → Add Integration → Vercel Postgres
3. Pilih project atau create new database
4. Copy connection string

**Opsi B: External Database**
- Supabase
- Railway
- Neon
- Atau PostgreSQL server lain

### Step 2: Deploy ke Vercel

**Opsi A: Via GitHub (Recommended)**

1. Push code ke GitHub repository
2. Buka https://vercel.com/new
3. Import repository
4. Configure environment variables

**Opsi B: Via Vercel CLI**

```bash
npm i -g vercel
vercel login
vercel
```

### Step 3: Setup Environment Variables di Vercel

Di Vercel Dashboard → Project Settings → Environment Variables:

```env
# Database
DATABASE_URL=postgresql://xxx:xxx@aws-xxx.supabase.co:5432/postgres

# JWT (generate random string)
JWT_SECRET=your-super-secret-random-key-at-least-32-chars

# App URL (ganti dengan domain Vercel Anda)
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### Step 4: Deploy

1. Klik Deploy
2. Tunggu build selesai
3. Setup selesai!

### Step 5: Setup Database di Production

Setelah deploy berhasil:

1. Buka Vercel Postgres di dashboard, atau
2. Gunakan CLI:
```bash
vercel env pull .env.production.local
npm run db:push
npm run db:seed
```

---

## 📁 Project Structure

```
cattle-catalog/
├── src/
│   ├── app/
│   │   ├── (public)/          # Public pages
│   │   │   ├── page.tsx       # Homepage
│   │   │   └── sapi/[code]/   # Cattle detail
│   │   ├── admin/             # Admin pages
│   │   │   ├── dashboard/
│   │   │   ├── cattle/
│   │   │   └── login/
│   │   └── api/               # API routes
│   │       ├── cattle/
│   │       └── admin/
│   ├── components/
│   │   ├── ui/               # shadcn/ui components
│   │   ├── catalog/           # Catalog components
│   │   ├── cattle/           # Cattle detail components
│   │   └── admin/            # Admin components
│   ├── lib/
│   │   ├── auth/             # JWT authentication
│   │   ├── db/              # Prisma client
│   │   └── utils/           # Utilities
│   └── types/               # TypeScript types
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── seed.ts              # Seed data
├── public/
│   └── uploads/             # Uploaded files
├── Dockerfile
├── docker-compose.yml
└── package.json
```

---

## 🔧 API Endpoints

### Public API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cattle` | List cattle (pagination, filters) |
| GET | `/api/cattle/[code]` | Get cattle detail |

### Admin API

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/auth/login` | Admin login |
| POST | `/api/admin/auth/logout` | Admin logout |
| GET | `/api/admin/cattle` | List all cattle |
| POST | `/api/admin/cattle` | Create cattle |
| PUT | `/api/admin/cattle/[id]` | Update cattle |
| DELETE | `/api/admin/cattle/[id]` | Delete cattle |
| POST | `/api/admin/cattle/[id]/weights` | Add weight |
| POST | `/api/admin/cattle/[id]/health` | Add health record |
| POST | `/api/admin/cattle/[id]/feed` | Add feed record |
| POST | `/api/admin/cattle/[id]/media` | Upload media |

---

## 🗄️ Database Schema

### Tables

- `Cattle` - Data utama sapi
- `CattleWeight` - Riwayat timbang
- `CattleWeightMedia` - Media timbang
- `CattleHealthRecord` - Riwayat kesehatan
- `CattleHealthMedia` - Media kesehatan
- `CattleFeedRecord` - Riwayat pakan
- `CattleMedia` - Dokumentasi umum
- `Admin` - User admin

---

## 🎨 Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript (strict)
- **Styling:** Tailwind CSS + shadcn/ui
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Auth:** JWT
- **Charts:** Recharts
- **QR Code:** qrcode.react
- **Deployment:** Vercel / Docker

---

## 📝 License

MIT License

---

## 🤝 Contributing

1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open Pull Request

---

Made with ❤️ for cattle farmers 🐄
