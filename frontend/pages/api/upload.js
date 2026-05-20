/**
 * VALIO v4 — /api/upload
 *
 * Server-side Next.js API route that:
 *  1. Verifies the admin JWT (passed as Authorization header)
 *  2. Receives a file as base64 encoded JSON body (avoids multipart complexity in serverless)
 *  3. Uploads to Cloudinary using the REST Upload API (no SDK dependency in frontend)
 *  4. Returns { secure_url, public_id }
 *
 * The Cloudinary API secret NEVER reaches the browser.
 */

import { verifyToken } from '../../lib/api';

export const config = { api: { bodyParser: { sizeLimit: '15mb' } } };

const CLOUD_NAME  = process.env.CLOUDINARY_CLOUD_NAME;
const API_KEY     = process.env.CLOUDINARY_API_KEY;
const API_SECRET  = process.env.CLOUDINARY_API_SECRET;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  /* ── Auth ── */
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const token  = authHeader.split(' ')[1];
  const verify = await verifyToken(token).catch(() => ({ valid: false }));
  if (!verify.valid) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  /* ── Cloudinary config check ── */
  if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
    return res.status(500).json({
      error: 'Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in .env.local',
    });
  }

  /* ── Parse body ── */
  const { data: base64Data, folder = 'valio', resource_type = 'image' } = req.body;
  if (!base64Data) {
    return res.status(400).json({ error: 'No file data provided (expected { data: "base64..." })' });
  }

  /* ── Build signature ── */
  const timestamp = Math.floor(Date.now() / 1000);
  const params    = { folder, timestamp };

  // Deterministic param string for signature
  const paramStr  = Object.keys(params)
    .sort()
    .map(k => `${k}=${params[k]}`)
    .join('&');

  // SHA-1 HMAC via Node crypto (built-in, no extra dep)
  const crypto    = await import('crypto');
  const signature = crypto
    .createHash('sha1')
    .update(paramStr + API_SECRET)
    .digest('hex');

  /* ── Upload to Cloudinary ── */
  const formBody = new URLSearchParams({
    file:       base64Data,
    api_key:    API_KEY,
    timestamp:  String(timestamp),
    folder,
    signature,
  });

  const cloudRes = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resource_type}/upload`,
    {
      method:  'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body:    formBody.toString(),
    }
  );

  const cloudData = await cloudRes.json();

  if (!cloudRes.ok) {
    console.error('[upload] Cloudinary error:', cloudData);
    return res.status(cloudRes.status).json({
      error: cloudData?.error?.message || 'Cloudinary upload failed',
    });
  }

  return res.status(200).json({
    secure_url: cloudData.secure_url,
    public_id:  cloudData.public_id,
    width:      cloudData.width,
    height:     cloudData.height,
    format:     cloudData.format,
  });
}
