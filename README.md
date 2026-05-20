# VALIO v4 — Luxury Algerian Streetwear

Full-stack e-commerce site. Next.js 14 frontend + Express/MongoDB backend.
Images hosted on Cloudinary. Admin panel at `/secret-control-panel`.

---

## Stack

| Layer     | Technology                            |
|-----------|---------------------------------------|
| Frontend  | Next.js 14, React 18, Tailwind CSS 3  |
| Backend   | Express 4, Mongoose 8, JWT            |
| Database  | MongoDB Atlas (or local)              |
| Media     | Cloudinary (secure server-side upload)|
| Hosting   | Vercel (frontend) + Railway (backend) |

---

## Quick Start

### 1. Clone & install

```bash
git clone <your-repo>

# Backend
cd backend
npm install
cp .env.example .env
# → fill in MONGODB_URI, JWT_SECRET, ADMIN_PASSWORD

# Frontend
cd ../frontend
npm install
cp .env.local.example .env.local
# → fill in NEXT_PUBLIC_API_URL, CLOUDINARY_*
```

### 2. Seed the database

```bash
cd backend
npm run seed
```

### 3. Run in development

```bash
# Terminal 1 — backend (port 5000)
cd backend && npm run dev

# Terminal 2 — frontend (port 3000)
cd frontend && npm run dev
```

Visit `http://localhost:3000`
Admin panel: `http://localhost:3000/secret-control-panel`

---

## Environment Variables

### Backend (`backend/.env`)

| Variable          | Description                              | Example                          |
|-------------------|------------------------------------------|----------------------------------|
| `PORT`            | Port to listen on                        | `5000`                           |
| `MONGODB_URI`     | MongoDB connection string                | `mongodb+srv://...`              |
| `JWT_SECRET`      | Long random string for signing JWTs      | `some-64-char-random-string`     |
| `ADMIN_PASSWORD`  | Plain-text admin password (hashed on startup) | `mySecurePassword123`       |
| `CORS_ORIGIN`     | Comma-separated allowed origins          | `https://valio.vercel.app`       |

### Frontend (`frontend/.env.local`)

| Variable                  | Description                          |
|---------------------------|--------------------------------------|
| `NEXT_PUBLIC_API_URL`     | Full URL of backend API              |
| `CLOUDINARY_CLOUD_NAME`   | Your Cloudinary cloud name           |
| `CLOUDINARY_API_KEY`      | Cloudinary API key                   |
| `CLOUDINARY_API_SECRET`   | Cloudinary API secret (server-only!) |

---

## Cloudinary Setup

1. Create a free account at [cloudinary.com](https://cloudinary.com)
2. From your dashboard copy: **Cloud Name**, **API Key**, **API Secret**
3. Paste into `frontend/.env.local`
4. The upload route (`/api/upload`) signs requests server-side — the secret is never exposed to the browser.

---

## Deployment

### Frontend → Vercel

```bash
cd frontend
vercel --prod
```

Set environment variables in Vercel dashboard under Project → Settings → Environment Variables.

### Backend → Railway / Render

1. Push `backend/` to a repo
2. Set env vars in the Railway/Render dashboard
3. Set `CORS_ORIGIN` to your Vercel frontend URL

---

## Folder Structure

```
valio/
├── backend/
│   ├── database/
│   │   └── seed.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── Background.js
│   │   ├── Order.js
│   │   ├── Product.js
│   │   └── Settings.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── backgrounds.js
│   │   ├── orders.js
│   │   ├── products.js
│   │   └── settings.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
└── frontend/
    ├── components/
    │   └── ui/
    │       ├── CartDrawer.js
    │       ├── CloudinaryUploader.js
    │       ├── CustomCursor.js
    │       ├── Navbar.js
    │       └── ProductCard.js
    ├── lib/
    │   └── api.js
    ├── pages/
    │   ├── api/
    │   │   └── upload.js        ← Cloudinary server route
    │   ├── product/
    │   │   └── [id].js
    │   ├── secret-control-panel/
    │   │   └── index.js         ← Admin panel
    │   ├── _app.js
    │   ├── _document.js
    │   ├── 404.js
    │   ├── 500.js
    │   ├── about.js
    │   ├── contact.js
    │   ├── index.js
    │   ├── lookbook.js
    │   └── shop.js
    ├── styles/
    │   └── globals.css
    ├── .env.local.example
    ├── .eslintrc.json
    ├── next.config.js
    ├── package.json
    ├── postcss.config.js
    └── tailwind.config.js
```

---

## Admin Panel

URL: `/secret-control-panel`

| Tab          | Features                                                   |
|--------------|------------------------------------------------------------|
| Overview     | Order stats, revenue summary                               |
| Products     | Create / edit / delete, image upload, feature / hide       |
| Orders       | View all orders, update status, expand details, delete     |
| Backgrounds  | Upload & manage hero slider images                         |
| Settings     | Site name, tagline, contact email, announcement bar        |

---

## API Reference (summary)

| Method | Path                        | Auth? | Description                 |
|--------|-----------------------------|-------|-----------------------------|
| GET    | `/api/health`               | ✗     | Health check                |
| POST   | `/api/auth/login`           | ✗     | Admin login → JWT           |
| POST   | `/api/auth/verify`          | ✗     | Verify token validity       |
| POST   | `/api/auth/refresh`         | ✓     | Extend token                |
| GET    | `/api/products`             | ✗     | Public product list         |
| GET    | `/api/products/all`         | ✓     | Admin product list (all)    |
| GET    | `/api/products/:id`         | ✗     | Single product              |
| POST   | `/api/products`             | ✓     | Create product              |
| PATCH  | `/api/products/:id`         | ✓     | Update product              |
| DELETE | `/api/products/:id`         | ✓     | Delete product              |
| GET    | `/api/backgrounds`          | ✗     | Active backgrounds          |
| GET    | `/api/backgrounds/all`      | ✓     | All backgrounds (admin)     |
| POST   | `/api/backgrounds`          | ✓     | Add background              |
| PATCH  | `/api/backgrounds/:id`      | ✓     | Update background           |
| DELETE | `/api/backgrounds/:id`      | ✓     | Delete background           |
| GET    | `/api/settings`             | ✗     | Public settings             |
| PUT    | `/api/settings`             | ✓     | Update settings             |
| POST   | `/api/orders`               | ✗     | Place order (public)        |
| GET    | `/api/orders`               | ✓     | All orders (admin)          |
| GET    | `/api/orders/stats`         | ✓     | Order stats (admin)         |
| GET    | `/api/orders/:id`           | ✓     | Single order (admin)        |
| PATCH  | `/api/orders/:id`           | ✓     | Update status (admin)       |
| DELETE | `/api/orders/:id`           | ✓     | Delete order (admin)        |
