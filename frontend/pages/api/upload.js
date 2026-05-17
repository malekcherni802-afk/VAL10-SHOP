/**
 * Secure Cloudinary Upload API Route
 * Cloudinary credentials stay server-side only — never exposed to client.
 * POST /api/upload  →  { url, public_id }
 */

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const cloudName  = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey     = process.env.CLOUDINARY_API_KEY;
  const apiSecret  = process.env.CLOUDINARY_API_SECRET;

  console.log('[upload] Cloudinary config check:', {
    cloudName: cloudName ? `SET (${cloudName.length} chars)` : 'MISSING',
    apiKey:    apiKey    ? `SET (${apiKey.length} chars)`    : 'MISSING',
    apiSecret: apiSecret ? `SET (${apiSecret.length} chars)` : 'MISSING',
  });

  if (!cloudName || !apiKey || !apiSecret) {
    const missing = [];
    if (!cloudName) missing.push('CLOUDINARY_CLOUD_NAME');
    if (!apiKey)    missing.push('CLOUDINARY_API_KEY');
    if (!apiSecret) missing.push('CLOUDINARY_API_SECRET');
    console.error('[upload] Missing env vars:', missing.join(', '));
    return res.status(500).json({
      error: `Cloudinary not configured. Missing: ${missing.join(', ')}`,
      missing,
    });
  }

  try {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const buffer = Buffer.concat(chunks);

    if (buffer.length === 0) {
      console.error('[upload] Empty request body');
      return res.status(400).json({ error: 'Empty request body' });
    }

    const contentType = req.headers['content-type'] || '';
    const boundaryMatch = contentType.match(/boundary=(.+)$/);
    if (!boundaryMatch) {
      console.error('[upload] No boundary in Content-Type:', contentType);
      return res.status(400).json({ error: 'No boundary found in Content-Type' });
    }
    const boundary = boundaryMatch[1];

    const parts = buffer.toString('binary').split(`--${boundary}`);
    let fileData = null;
    let fileName = 'upload';
    let fileMime = 'image/jpeg';

    for (const part of parts) {
      if (part.includes('Content-Disposition') && part.includes('filename')) {
        const nameMatch = part.match(/filename="([^"]+)"/);
        if (nameMatch) fileName = nameMatch[1];
        const mimeMatch = part.match(/Content-Type: ([^\r\n]+)/);
        if (mimeMatch) fileMime = mimeMatch[1].trim();
        const bodyStart = part.indexOf('\r\n\r\n') + 4;
        const bodyEnd   = part.lastIndexOf('\r\n');
        if (bodyStart > 4 && bodyEnd > bodyStart) {
          fileData = Buffer.from(part.slice(bodyStart, bodyEnd), 'binary');
        }
      }
    }

    if (!fileData) {
      console.error('[upload] No file data found in multipart body');
      return res.status(400).json({ error: 'No file found in request' });
    }

    console.log('[upload] File parsed:', { fileName, fileMime, size: fileData.length });

    const timestamp = Math.round(Date.now() / 1000);
    const folder    = 'valio';

    const crypto = await import('crypto');
    const signStr = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto
      .createHash('sha1')
      .update(signStr)
      .digest('hex');

    const form = new FormData();
    const blob = new Blob([fileData], { type: fileMime });
    form.append('file', blob, fileName);
    form.append('api_key', apiKey);
    form.append('timestamp', String(timestamp));
    form.append('signature', signature);
    form.append('folder', folder);

    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
    console.log('[upload] Sending to Cloudinary:', uploadUrl);

    const uploadRes = await fetch(uploadUrl, { method: 'POST', body: form });

    if (!uploadRes.ok) {
      const errText = await uploadRes.text();
      console.error('[upload] Cloudinary API error:', uploadRes.status, errText);
      return res.status(502).json({
        error: 'Cloudinary upload failed',
        status: uploadRes.status,
        detail: errText,
      });
    }

    const data = await uploadRes.json();
    console.log('[upload] Upload successful:', data.secure_url);
    return res.status(200).json({
      url:       data.secure_url,
      public_id: data.public_id,
    });
  } catch (err) {
    console.error('[upload] Unhandled error:', err);
    return res.status(500).json({
      error: 'Internal server error',
      detail: err.message,
    });
  }
}
