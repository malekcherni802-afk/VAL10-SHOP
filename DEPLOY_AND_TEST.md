# VAL10 deployment checklist (updated)

This archive is designed to replace the files at the **root of the existing `VAL10-SHOP` GitHub repository**. Keep the existing MongoDB database and its data; do not delete or recreate the database.

## 1) Replace the app files

1. Download and extract this ZIP.
2. Copy `server.js`, `package.json`, `public/`, and the Markdown documentation into the root of the existing repository.
3. Commit and push to the same branch connected to Render (currently `main`).
4. Keep Render's Root Directory blank if the repository files are at the root.

Render settings:

- Build command: `npm install`
- Start command: `npm start` (equivalent to `node server.js`)
- Node: 20 or newer

## 2) Render Environment

Keep the existing working `MONGODB_URI`, `ADMIN_USER`, and `ADMIN_PASS` values in Render. Do not put secrets in GitHub or in this ZIP.

For phone push notifications, add all three variables:

- `VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`
- `VAPID_SUBJECT` = `mailto:your-real-admin-email@example.com`

Generate one key pair from the project folder using:

```bash
npm install
npx web-push generate-vapid-keys --json
```

Copy the generated public and private keys into Render. Keep the same pair permanently; do not generate a new pair on every deploy. If the pair changes, each phone/browser must subscribe again. `VAPID_PRIVATE_KEY` must stay secret.

Click **Save, rebuild, and deploy**.

## 3) Subscribe the actual phone

The subscription is per device. Enabling notifications on your laptop does not enable your phone.

- Android: open the live HTTPS site in Chrome on the phone, sign in at `/admin`, tap **Enable order alerts**, and Allow notifications.
- iPhone: use iOS/iPadOS 16.4 or later. In Safari open `/admin` → Share → Add to Home Screen. Launch VAL10 from its Home Screen icon, sign in, tap **Enable order alerts**, and Allow notifications.

When the phone has subscribed, the Admin top bar should show **Order alerts ON** and **Test notification**. Tap **Test notification** on the same phone and wait for the VAL10 system notification. Check device notification permissions, Focus/Do Not Disturb and Silent mode if it does not display or sound.

Only after the test notification appears should you place a real test order. Render Logs should say that the order push was accepted by the provider for the number of subscribed devices.

## 4) Sold Out and per-product promotion

- A sold-out item stays visible and its product detail page remains accessible. It shows **Sold Out** and disables purchase.
- For an item without size or colour variants, set its actual quantity in **Admin → Products → Edit Product → One-size stock**. A new or legacy item starts conservatively at quantity 1 if no quantity existed; check and update the number before taking orders.
- For products with sizes/colours, manage quantities in the matching variant rows.
- Set **Promotion (%)** on each product in the Admin editor. Use 0 to remove the discount; valid values are 0–90. The server calculates the discount and the order's charged price.

## 5) Limitation: `index3`

The repository commit used for the Render deployment and the supplied project ZIP contain `public/index.html` but do not contain `index3.html` or `public/index3.html`. This archive therefore keeps the current storefront design rather than guessing what the missing `index3` looks like. To reproduce that exact reference, add the actual `index3` file to the project or upload it so it can be compared and merged.

## Important test limitation

Syntax checks can be performed locally, but this package cannot prove push delivery or database transaction behaviour until it is deployed with your real Render environment, MongoDB Atlas cluster, and an opted-in phone.

## Shipping fee and reporting

New orders include a flat delivery fee of **8.00 TND** by default. You can override it in Render with `SHIPPING_FEE_TND`; leave it unset or set it to `8` for the current policy. Historical orders retain the shipping amount that was recorded at purchase time (older orders without a shipping field are treated as having 0 TND shipping). Admin → Dashboard now reports delivered/collected revenue separately from pending, confirmed and shipped COD value, plus a trend, status breakdown and best sellers.

## Expenses and net cashflow

The Admin Dashboard includes an Expenses area to record production, delivery, advertising, packaging and operating expenses. The dashboard reports collected COD revenue minus those recorded expenses as cashflow after expenses. This is not a full accounting profit figure unless all relevant costs (including product cost and other operating expenses) are entered.
