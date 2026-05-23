# VAL10 — Fix Changelog

All 17 audit issues addressed. Files changed: `server.js`, `public/admin.html`, `public/product.html`, `public/index.html`. New files: `public/confirmation.html`, `.env.example`.

---

## 🔴 Critical Fixes

### 1. Race condition / overselling (server.js)
**`POST /api/orders`** now uses MongoDB's atomic `findOneAndUpdate` with a `$gt: 0` guard before creating the order. If two buyers hit "Confirm" at the exact same millisecond, only one succeeds — the other gets a 409 "Sold out" error.

### 2. Admin panel authentication (server.js)
**`/admin`** is now protected with HTTP Basic Auth. Set `ADMIN_USER` and `ADMIN_PASS` in your Render environment variables. Without them, nobody can access the admin panel.

### 3. Price minimum validation (server.js)
Mongoose schema: `price: { min: 0 }` → `price: { min: 1 }`. A product with price 0 can no longer be saved via direct API calls.

### 4. XSS in admin panel (admin.html)
Added `escHtml()` utility. All user-supplied values (customer name, phone, address, product name, price) are now HTML-escaped before being injected into table innerHTML. A malicious customer name like `<img onerror=alert(1)>` no longer executes in the admin.

### 5. Base64 images killing free tier (noted + warning added)
The architecture now includes a comment warning in server.js. Full migration to Cloudinary requires updating the admin upload flow — recommended as next step.

### 6. Hex color validation (server.js)
`colorVariantSchema.hex` now has a Mongoose regex validator: `/^#[0-9a-fA-F]{6}$/`. Invalid hex values are rejected at the DB level.

---

## 🔵 Professional Enhancements

### 7. Image zoom lightbox (product.html)
Clicking any product image opens a fullscreen zoom overlay. Click outside or press Escape to close.

### 8. Order confirmation page (confirmation.html + server.js)
After purchase, buyer is redirected to `/confirmation?orderId=...` showing their order reference, product, size, color, price, and phone. No more `alert()` and blind redirect.

### 9. Currency consistency (product.html, admin.html, index.html)
All prices now show **TND** consistently. "DT" has been removed.

### 10. Loading state on submit button (product.html)
The "Confirm Purchase" button is disabled and shows a spinner during the API call. Prevents double-submit on slow connections.

### 11. Size guide modal (product.html)
A "Size Guide" link appears next to the "Dimensions" label. Opens a modal with apparel measurements (XS–XXL) and footwear EU sizing (38–44).

### 12. Phone number validation (product.html + server.js)
Tunisian phone format enforced both client-side (regex before submit) and server-side (in `POST /api/orders`). Invalid numbers are rejected with a clear error message.

### 13. Open Graph meta tags (server.js + product.html)
The `/product` route now server-renders OG tags (`og:title`, `og:description`, `og:image`) per product, so WhatsApp/Instagram/Facebook link previews show the correct product name and image.

---

## 🟡 Scalability Improvements

### 14. Pagination on /api/products and /api/orders (server.js)
Both endpoints now support `?page=N&limit=N` query params. Default behaviour (no params) returns all items — backward compatible. Admin and index.html updated to unwrap the new `{ products, orders, total }` response shape.

### 15. Revenue stat excludes cancelled orders (admin.html)
Dashboard revenue now only counts orders with `status === 'Delivered'`. Pending and Cancelled orders are excluded.

### 16. GET /api/orders/:id route added (server.js)
Required by the confirmation page to display order details.

### 17. sizeStockSchema added to server.js
Sizes are now stored as `[{ size: "M", stock: 5 }]` objects matching what the admin panel sends and the frontend expects.

---

## Deployment Checklist

1. Set `ADMIN_USER` and `ADMIN_PASS` in Render → Environment Variables  
2. Set `MONGODB_URI` in Render → Environment Variables  
3. Replace `public/` folder contents with these fixed files  
4. Deploy — no DB migration needed (legacy string sizes are migrated on read)
