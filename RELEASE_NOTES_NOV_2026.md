# VAL10 — Admin analytics, paid shipping and motion update

## Admin dashboard
- Store overview for Today / 7 days / 30 days / All time.
- Delivered COD revenue (actual delivered date for newly updated orders), open COD order value, total orders, delivered, pending, confirmed, shipped and cancelled counts.
- Product revenue and delivery fee breakdown, average order, trend chart and best sellers.
- Expense register for production, delivery, advertising, packaging, operations and other costs.
- Cashflow after expenses = delivered cash collected minus expenses recorded in the selected reporting period. It is not accounting profit if product cost or other expenses are missing.

## Shipping
- Default fee is 8.00 TND per order in Tunisia.
- The server is authoritative and adds the fee to each order. Customer-submitted price data is not trusted.
- Set `SHIPPING_FEE_TND=8` in Render → Environment.
- Product page, checkout, home announcement, order confirmation and Shipping policy show the charge.

## Visual update
- Kept VAL10's near-black and lime palette, typography and product identity.
- Added a subtle rising particle field in the home hero and restrained floating/micro-interaction animations in the dashboard.
- Respects the device's reduced-motion preference.

## Deploy
Replace `server.js`, `package.json`, `public/` and the documentation in the root of the existing `VAL10-SHOP` repository. Keep the current MongoDB database and all Render secrets. Push to the same branch connected to Render.
