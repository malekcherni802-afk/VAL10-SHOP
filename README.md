# VALIO v3 — Luxury Streetwear Platform

## What's new in this update (Bug Fixes)

### Fix 1 — Cloudinary Upload
- `pages/api/upload.js` fully rewritten with binary-safe multipart parsing
- Verbose `console.log` at every step so you see the exact error in Vercel logs
- Env vars validated on every request with clear error messages

### Fix 2 — Dynamic Shop Backgrounds
- New MongoDB collection: `backgrounds`
- Admin panel → **Shop Backgrounds** tab: upload, show/hide, delete
- Shop page fetches active backgrounds from API, falls back to built-in photos

### Fix 3 — Intro Settings (Opacity & Size)
- Admin panel → **Settings** tab: slider for opacity (default 60%), width, height fields
- Live preview swatch in the admin panel
- Saved to MongoDB, applied on every public page load without redeploy

---

## Quick Start

```bash
# 1. Backend
cd backend
cp .env.example .env          # fill in MONGODB_URI, JWT_SECRET
npm install
node database/seed.js         # seeds default settings
npm run dev                   # → http://localhost:5000

# 2. Frontend
cd frontend
cp .env.local.example .env.local   # fill in Cloudinary keys
npm install
npm run dev                   # → http://localhost:3000
```

## Environment Variables

### frontend/.env.local
```
NEXT_PUBLIC_API_URL=http://localhost:5000
CLOUDINARY_CLOUD_NAME=dcdgsmiyy
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### backend/.env
```
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=random_secret_string
ADMIN_PASSWORD=valio_admin_2024
CORS_ORIGIN=http://localhost:3000
```

## Admin Panel (Hidden URL)
```
http://localhost:3000/secret-control-panel
```
No link exists anywhere in the public UI.

## Cloudinary Debug Checklist
If you still get upload errors, check Vercel logs for `[upload]` lines:
1. `env check` — confirms all 3 env vars are SET
2. `raw body size` — confirms file was received
3. `file part` — confirms file was parsed from multipart
4. `Cloudinary status` + `body` — shows exact Cloudinary response

Common issues:
- Missing env vars in Vercel dashboard → add them under Project Settings → Environment Variables
- Wrong cloud name → verify at cloudinary.com/console
- API key / secret mismatch → regenerate at cloudinary.com/settings/api_keys

## API Routes
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/products | — | All products |
| POST | /api/products | ✅ | Create product |
| PATCH | /api/products/:id | ✅ | Update product |
| DELETE | /api/products/:id | ✅ | Delete product |
| GET | /api/backgrounds | — | Active backgrounds (public) |
| GET | /api/backgrounds/all | ✅ | All backgrounds (admin) |
| POST | /api/backgrounds | ✅ | Add background |
| PATCH | /api/backgrounds/:id | ✅ | Toggle active/hidden |
| DELETE | /api/backgrounds/:id | ✅ | Remove background |
| GET | /api/settings | — | All settings (public) |
| PUT | /api/settings | ✅ | Update settings |
| POST | /api/auth/login | — | Admin login |
