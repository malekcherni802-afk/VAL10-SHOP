# VAL10 — Render deployment and order push alerts

## 1. Render service settings

Create/use a **Node Web Service** for this project.

- Build command: `npm install`
- Start command: `npm start`
- Node runtime: 20 or newer
- The service must be served over HTTPS (Render's HTTPS URL is suitable).
- The ZIP contains a `val10-fixed/` project folder. Set Render's **Root Directory** to `val10-fixed`, or move that folder's contents to the repository root and leave Root Directory blank.

## 2. Required Render environment variables

Add these under **Render → your service → Environment**:

| Variable | Value |
|---|---|
| `NODE_ENV` | `production` |
| `MONGODB_URI` | Your MongoDB Atlas connection string |
| `ADMIN_USER` | A private admin username |
| `ADMIN_PASS` | A unique random password of at least 16 characters; 20+ recommended |

Do not use the sample text from `.env.example` as a real password. The server will refuse to start if the admin credentials are missing or the password is too short.

**MongoDB note:** the order checkout now uses a transaction to update inventory and save the order together. Use MongoDB Atlas or another MongoDB deployment configured as a replica set / transaction-capable cluster. Ensure your database user has read/write access and the deployment can accept connections from Render. After first deploy, open Admin → Products and verify the stock numbers: legacy string-only sizes are migrated with an initial stock of 1 per size because the old records did not contain a quantity. Set the real quantities manually before accepting orders.

## 3. Generate Web Push keys once

Run locally from the project folder:

```bash
npm install
npx web-push generate-vapid-keys --json
```

Add the generated keys to Render:

| Variable | Value |
|---|---|
| `VAPID_PUBLIC_KEY` | Generated public key |
| `VAPID_PRIVATE_KEY` | Generated private key — keep secret |
| `VAPID_SUBJECT` | `mailto:your-real-admin-email@example.com` |

Never expose or commit `VAPID_PRIVATE_KEY`. Keep the same key pair after deployment; changing it means each device must subscribe again.

## 4. Optional store links

Set these only when the final links are ready. Unconfigured links stay hidden rather than pointing to dead `#` placeholders.

- `STORE_INSTAGRAM_URL` — full `https://...` Instagram profile URL
- `STORE_TIKTOK_URL` — full `https://...` TikTok profile URL
- `STORE_CONTACT_EMAIL` — public customer-service email address

## 5. Deploy and enable alerts

1. Extract the ZIP, copy the project folder into the Git repository connected to Render, then commit and push the updated files. Do not replace the live database or delete existing MongoDB data.
2. Confirm all environment variables are saved, then deploy/redeploy.
3. Open `https://YOUR-SITE/admin` and enter the admin credentials.
4. Click **Enable order alerts** and allow browser notifications.
5. Repeat on every browser/device that should receive order notifications. Each device needs its own opt-in; enabling alerts on your PC does not subscribe your phone.
6. Once the phone shows **Order alerts ON**, tap **Test notification** in the Admin top bar. The server reports whether it has any subscribed devices and whether the push provider accepted the message.
7. Only after the test notification arrives on the phone, place a real test order. In Render Logs, expect `Order push accepted by provider for 1/1 device(s)` (or matching device count).

### iPhone / iPad

Web Push requires iOS/iPadOS 16.4 or later and the website added to the Home Screen. In Safari, open `/admin`, choose **Share → Add to Home Screen**, open VAL10 from its new Home Screen icon, sign in, then enable order alerts from that iPhone. Do not enable only from a desktop browser. Also check iPhone Settings → Notifications → VAL10 (or the installed web app) and make sure notifications and sounds are allowed.

## 6. Test the real flow

After at least one device is subscribed, place a small test order from the public storefront. Confirm that:

- the order appears in the Admin Orders section;
- the selected size and colour stocks each decrease by one (where applicable);
- a new-order notification arrives on every subscribed device;
- tapping the notification opens the protected Admin Orders section.

Device Focus/Do Not Disturb settings, Silent mode, battery saver and browser notification settings may silence or delay alerts. A website cannot force an Instagram-specific notification sound. If the VAPID pair was changed after a device had subscribed, the device must unsubscribe and subscribe again; the Admin page detects a key mismatch when the browser exposes the existing key.

## Diagnose a notification that never arrives

- If the Admin button says **Set up push keys**, one or more VAPID variables are missing or invalid. Add all three variables and redeploy.
- If it says **Enable order alerts**, that browser/device has not subscribed yet. Do this on the phone itself.
- After enabling, **Test notification** must be visible. Tap it. A `No device is subscribed yet` response means the phone subscription was not saved.
- A provider status `401` or `403` commonly means the VAPID key pair does not match the subscription or was changed. Keep one stable key pair and subscribe again on each device.
- A provider status `404` or `410` means that subscription endpoint has expired; the server removes expired endpoints, then subscribe again on that device.
- If the test notification arrives but a real order notification does not, inspect Render Logs for `Order push accepted by provider` or `Order push was skipped`. The push is sent only after the order transaction commits.

## Security / owner checks before launch

- Set a unique admin username and long random password in Render.
- Keep the MongoDB URI and VAPID private key out of Git and public files.
- Review the Privacy, Terms and Shipping pages and confirm the business details, delivery coverage, return/exchange terms and customer-service channel. The current pages are baseline copy, not a substitute for legal review.
- Confirm your social links/contact email appear after setting the optional environment variables.
- Run an end-to-end test on the live Render deployment; syntax checks alone cannot prove database transactions or push delivery.

## Shipping price

The site currently charges **8.00 TND** per order for delivery in Tunisia. The backend is authoritative. To change it, set Render environment variable `SHIPPING_FEE_TND` and redeploy; if omitted, the default is 8.

## Expenses and net cashflow

The Admin Dashboard includes an Expenses area to record production, delivery, advertising, packaging and operating expenses. The dashboard reports collected COD revenue minus those recorded expenses as cashflow after expenses. This is not a full accounting profit figure unless all relevant costs (including product cost and other operating expenses) are entered.
