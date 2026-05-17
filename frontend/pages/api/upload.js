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

  if (!cloudName || !apiKey || !apiSecret) {
    return res.status(500).json({ error: 'Cloudinary not configured' });
  }

  try {
    // Parse multipart body without external parser
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const buffer = Buffer.concat(chunks);

    // Extract boundary from Content-Type header
    const contentType = req.headers['content-type'] || '';
    const boundaryMatch = contentType.match(/boundary=(.+)$/);
    if (!boundaryMatch) {
      return res.status(400).json({ error: 'No boundary found' });
    }
    const boundary = boundaryMatch[1];

    // Parse multipart manually
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
      return res.status(400).json({ error: 'No file found in request' });
    }

    // Build signed Cloudinary upload
    const timestamp = Math.round(Date.now() / 1000);
    const folder    = 'valio';

    // Generate HMAC-SHA1 signature
    const crypto = await import('crypto');
    const signStr = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto
      .createHash('sha1')
      .update(signStr)
      .digest('hex');

    // Build form for Cloudinary
    const form = new FormData();
    const blob = new Blob([fileData], { type: fileMime });
    form.append('file', blob, fileName);
    form.append('api_key', apiKey);
    form.append('timestamp', String(timestamp));
    form.append('signature', signature);
    form.append('folder', folder);

    const uploadRes = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: 'POST', body: form }
    );

    if (!uploadRes.ok) {
      const errText = await uploadRes.text();
      console.error('Cloudinary error:', errText);
      return res.status(500).json({ error: 'Cloudinary upload failed' });
    }

    const data = await uploadRes.json();
    return res.status(200).json({
      url:       data.secure_url,
      public_id: data.public_id,
    });
  } catch (err) {
    console.error('Upload error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
