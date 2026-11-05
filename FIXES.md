# VAL10 — security and production-readiness changes

This revision keeps the existing VAL10 storefront identity and the current order flow, while hardening the backend and fixing the highest-risk behaviour found in the uploaded project.

## Backend and security

- **Admin authentication now protects the whole management surface.** Admin pages and all management APIs live under `/admin`; product CRUD, order listing/status/deletion, banner editing and push-subscription management require HTTP Basic Auth.
- **No default admin credentials.** The server refuses to start unless `ADMIN_USER` and `ADMIN_PASS` are configured. Password must contain at least 16 characters.
- **Admin write requests are same-origin checked** to reduce CSRF risk.
- **Private order data is no longer exposed publicly.** `GET /api/orders/:id` returns only the order confirmation fields; the customer phone/address and all-order listing are available only via authenticated admin APIs.
- **Order creation is server-authoritative.** Product name, price and colour name are loaded from MongoDB; client-supplied prices and product names are ignored.
- **Inventory changes and order creation share a MongoDB transaction.** Colour and size stock are both validated and decremented atomically. A failed order does not leave stock decremented.
- **Order submission is JSON-only and rate-limited** to reduce scripted and cross-site abuse.
- **Product and banner writes are allow-listed and validated.** Prices, stock, sizes, colours, hex values, image source types and banner links are checked; unknown MongoDB fields/operators are not passed through.
- **Security headers and request-size limits** are applied; open CORS has been removed because the storefront and API are served from the same origin. Dependencies were updated to Express 4.22.3, Mongoose 8.24.8 and dotenv 18.0.9.
- **Public product and banner responses are sanitized** before being rendered.

## Storefront and admin UX

- Fixed sold-out logic so a product with both size and colour variants is unavailable when either required dimension has no stock.
- Homepage prices consistently display `TND`.
- Confirmation page no longer exposes customer phone details through a public order lookup.
- Removed the public Admin footer link. Admin access is available at `/admin` and is password protected.
- Replaced dead social/contact placeholders with optional links configured through Render environment variables.
- Added working Privacy, Terms and Shipping information pages. These pages include owner-review notes where the store's exact legal/business details still need confirmation.
- Admin product, order and banner API calls now use authenticated `/admin/api/...` routes.
- Escaped user-managed content in admin/storefront HTML rendering and changed admin toast rendering to text nodes. Colour variants are tracked by their exact index so duplicate colour names cannot decrement the wrong variant.

## Push notifications

- Existing Web Push functionality is retained under the authenticated Admin API.
- New-order push messages are sent only after the order transaction commits.
- Expired subscriptions (HTTP 404/410) are removed.

## Important platform requirement

Order creation uses MongoDB transactions. Use MongoDB Atlas or another MongoDB deployment configured as a replica set / transaction-capable cluster. The example connection string is for MongoDB Atlas.

## Verification performed in this revision

- `node --check server.js` — passed.
- `node --check public/service-worker.js` — passed.
- Inline JavaScript syntax checks for `index.html`, `product.html`, `admin.html` and `confirmation.html` — passed.
- A live Render/MongoDB checkout and real push delivery test has **not** been run from this environment. Those require the owner's Render environment variables, database and an opted-in browser device.
