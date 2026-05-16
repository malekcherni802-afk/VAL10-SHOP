# VALIO — Gothic Luxury Fashion

> Dark. Cinematic. Immersive.

---

## Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | Next.js 14, Tailwind CSS, GSAP, Three.js, Lenis |
| Backend   | Node.js, Express.js, MongoDB        |
| Auth      | JWT (JSON Web Tokens)               |
| Storage   | Local (extendable to S3/Cloudinary) |
| Deploy    | Render (backend) + Vercel (frontend)|

---

## Project Structure

```
VALIO/
├── frontend/          # Next.js app
├── backend/           # Express API
├── admin/             # Admin dashboard (embedded in frontend /admin)
├── database/          # MongoDB seed data
├── render.yaml        # Render deployment config
├── .gitignore
└── README.md
```

---

## Local Development

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/valio.git
cd valio

# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Environment Variables

**backend/.env**
```env
PORT=5000
MONGODB_URI=mongodb+srv://USER:PASS@cluster.mongodb.net/valio
JWT_SECRET=your_super_secret_jwt_key_here
CORS_ORIGIN=http://localhost:3000
```

**frontend/.env.local**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_ADMIN_PASSWORD=valio_admin_2024
```

### 3. Run Development

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev
```

Open: http://localhost:3000

---

## Admin Panel

URL: `http://localhost:3000/admin`

Default credentials:
- Password: `valio_admin_2024`

Change via `NEXT_PUBLIC_ADMIN_PASSWORD` env variable.

---

## Deployment Guide

### Step 1 — GitHub

```bash
git init
git add .
git commit -m "Initial VALIO commit"
git remote add origin https://github.com/YOUR_USERNAME/valio.git
git push -u origin main
```

### Step 2 — MongoDB Atlas

1. Go to [https://cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a free cluster
3. Create database user
4. Whitelist IP: `0.0.0.0/0` (all — for Render)
5. Get connection string: `mongodb+srv://user:pass@cluster.mongodb.net/valio`

### Step 3 — Deploy Backend to Render

1. Go to [https://render.com](https://render.com)
2. New → Web Service
3. Connect your GitHub repo
4. Settings:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add Environment Variables:
   - `MONGODB_URI` = your Atlas URI
   - `JWT_SECRET` = random string
   - `CORS_ORIGIN` = your Vercel frontend URL
   - `PORT` = 5000

### Step 4 — Deploy Frontend to Vercel

1. Go to [https://vercel.com](https://vercel.com)
2. Import GitHub repo
3. Settings:
   - **Root Directory**: `frontend`
   - **Framework**: Next.js
4. Add Environment Variables:
   - `NEXT_PUBLIC_API_URL` = your Render backend URL
   - `NEXT_PUBLIC_ADMIN_PASSWORD` = your admin password

### Step 5 — Seed Database (optional)

```bash
cd backend
node database/seed.js
```

---

## Features

- 🎭 Cinematic smoke intro with logo reveal
- 🌀 Portal zoom transition (O letter → fullscreen)
- 🛍️ Gothic luxury shop with scroll animations
- 📦 3D product viewer (Three.js GLB support)
- 🔐 Protected admin dashboard
- ➕ Add/edit/delete products
- 📁 Image & 3D model upload
- 🎨 Theme color customization
- 📱 Fully responsive

---

*VALIO — Enter the darkness.*
