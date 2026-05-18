/**
 * VALIO — Secure Cloudinary Upload Route
 * POST /api/upload  →  { url, public_id }
 * Credentials 100% server-side via process.env.
 */

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey    = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  // Verbose env check so you can debug in Vercel logs
  console.log('[upload] env check:', {
    cloudName: cloudName || 'MISSING',
    apiKey:    apiKey    ? apiKey.slice(0, 6) + '...' : 'MISSING',
    apiSecret: apiSecret ? 'SET' : 'MISSING',
  });

  if (!cloudName || !apiKey || !apiSecret) {
    const missing = [
      !cloudName && 'CLOUDINARY_CLOUD_NAME',
      !apiKey    && 'CLOUDINARY_API_KEY',
      !apiSecret && 'CLOUDINARY_API_SECRET',
    ].filter(Boolean).join(', ');
    return res.status(500).json({ error: 'Missing env: ' + missing });
  }

  try {
    // 1. Collect raw request body
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const rawBody = Buffer.concat(chunks);
    console.log('[upload] raw body size:', rawBody.length);

    // 2. Extract boundary
    const ct = req.headers['content-type'] || '';
    const bm = ct.match(/boundary=(?:"([^"]+)"|([^\s;]+))/);
    if (!bm) return res.status(400).json({ error: 'No multipart boundary' });
    const boundary = bm[1] || bm[2];

    // 3. Parse parts (binary-safe via Buffer)
    let fileBuffer = null;
    let fileName   = 'upload.jpg';
    let fileMime   = 'image/jpeg';

    const delimFirst = Buffer.from('--' + boundary);
    const delimNext  = Buffer.from('\r\n--' + boundary);

    let pos = rawBody.indexOf(delimFirst);
    while (pos !== -1) {
      const hdrStart = pos + delimFirst.length + 2;          // skip \r\n
      const hdrEnd   = rawBody.indexOf(Buffer.from('\r\n\r\n'), hdrStart);
      if (hdrEnd === -1) break;

      const hdr      = rawBody.slice(hdrStart, hdrEnd).toString('utf8');
      const dataStart = hdrEnd + 4;
      const nextBound = rawBody.indexOf(delimNext, dataStart);
      const dataEnd   = nextBound !== -1 ? nextBound : rawBody.length;

      if (hdr.includes('filename=')) {
        const nm = hdr.match(/filename="([^"]+)"/);
        if (nm) fileName = nm[1];
        const mm = hdr.match(/Content-Type:\s*([^\r\n]+)/i);
        if (mm) fileMime = mm[1].trim();
        fileBuffer = rawBody.slice(dataStart, dataEnd);
        console.log('[upload] file part:', fileName, fileMime, fileBuffer.length, 'bytes');
      }

      pos = nextBound !== -1
        ? rawBody.indexOf(delimFirst, nextBound + delimNext.length)
        : -1;
    }

    if (!fileBuffer || fileBuffer.length === 0) {
      return res.status(400).json({ error: 'No file data in request' });
    }

    // 4. Build Cloudinary signed signature
    const crypto    = (await import('crypto')).default;
    const timestamp = Math.round(Date.now() / 1000);
    const folder    = 'valio';
    const sigString = `folder=${folder}&timestamp=${timestamp}` + apiSecret;
    const signature = crypto.createHash('sha1').update(sigString).digest('hex');
    console.log('[upload] signature ready');

    // 5. Build raw multipart body for Cloudinary
    const b2   = `----ValioCloudinary${Date.now()}`;
    const CRLF = '\r\n';

    const field = (name, value) =>
      `--${b2}${CRLF}Content-Disposition: form-data; name="${name}"${CRLF}${CRLF}${value}${CRLF}`;

    const textPart = Buffer.from(
      field('api_key', apiKey) +
      field('timestamp', String(timestamp)) +
      field('signature', signature) +
      field('folder', folder),
      'utf8'
    );

    const filePart = Buffer.from(
      `--${b2}${CRLF}` +
      `Content-Disposition: form-data; name="file"; filename="${fileName}"${CRLF}` +
      `Content-Type: ${fileMime}${CRLF}${CRLF}`,
      'utf8'
    );

    const footerPart = Buffer.from(`${CRLF}--${b2}--${CRLF}`, 'utf8');
    const body = Buffer.concat([textPart, filePart, fileBuffer, footerPart]);

    console.log('[upload] sending to Cloudinary, body size:', body.length);

    // 6. POST to Cloudinary
    const cloudRes = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method:  'POST',
        headers: { 'Content-Type': `multipart/form-data; boundary=${b2}` },
        body,
      }
    );

    const responseText = await cloudRes.text();
    console.log('[upload] Cloudinary status:', cloudRes.status, '| body:', responseText.slice(0, 400));

    if (!cloudRes.ok) {
      return res.status(500).json({
        error:   'Cloudinary rejected the upload',
        status:  cloudRes.status,
        details: responseText,
      });
    }

    const result = JSON.parse(responseText);
    return res.status(200).json({ url: result.secure_url, public_id: result.public_id });

  } catch (err) {
    console.error('[upload] unexpected error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
