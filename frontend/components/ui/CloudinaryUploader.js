/**
 * VALIO v4 — CloudinaryUploader
 *
 * Usage:
 *   <CloudinaryUploader token={adminToken} folder="valio/products"
 *     onUpload={(url, public_id) => { ... }} onError={msg => { ... }} />
 *
 * Converts files to base64, POSTs to /api/upload (Next.js route that signs
 * and forwards to Cloudinary — never exposes secrets to the browser).
 */

import { useState, useRef } from 'react';

export default function CloudinaryUploader({
  token,
  folder    = 'valio',
  multiple  = true,
  onUpload,   // (secure_url: string, public_id: string) => void
  onError,    // (message: string) => void
  maxFiles  = 8,
  accept    = 'image/jpeg,image/png,image/webp,image/avif',
}) {
  const [uploading, setUploading] = useState(false);
  const [progress,  setProgress]  = useState([]);   // [{name, status}]
  const inputRef = useRef(null);

  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload  = () => resolve(reader.result);  // data:...;base64,...
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  async function uploadSingle(file, index) {
    setProgress(prev => {
      const next = [...prev];
      next[index] = { name: file.name, status: 'uploading' };
      return next;
    });

    try {
      const base64 = await fileToBase64(file);

      const res = await fetch('/api/upload', {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ data: base64, folder }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Upload failed');

      setProgress(prev => {
        const next = [...prev];
        next[index] = { name: file.name, status: 'done' };
        return next;
      });

      onUpload?.(data.secure_url, data.public_id);
    } catch (err) {
      setProgress(prev => {
        const next = [...prev];
        next[index] = { name: file.name, status: 'error', error: err.message };
        return next;
      });
      onError?.(err.message);
    }
  }

  async function handleChange(e) {
    const files = Array.from(e.target.files || []).slice(0, maxFiles);
    if (files.length === 0) return;

    setUploading(true);
    setProgress(files.map(f => ({ name: f.name, status: 'pending' })));

    // Upload in parallel (max 3 concurrent)
    const BATCH = 3;
    for (let i = 0; i < files.length; i += BATCH) {
      const batch = files.slice(i, i + BATCH);
      await Promise.all(batch.map((f, j) => uploadSingle(f, i + j)));
    }

    setUploading(false);
    // Reset input so the same file can be re-selected
    if (inputRef.current) inputRef.current.value = '';
  }

  const statusIcon = status => {
    if (status === 'uploading') return '⏳';
    if (status === 'done')      return '✅';
    if (status === 'error')     return '❌';
    return '🕐';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Drop zone / click trigger */}
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        style={{
          border:        '1px dashed #2a2a2a',
          borderRadius:  '2px',
          padding:       '28px 20px',
          textAlign:     'center',
          background:    'rgba(255,255,255,0.02)',
          cursor:        uploading ? 'not-allowed' : 'none',
          opacity:       uploading ? 0.6 : 1,
          transition:    'border-color 0.3s ease',
        }}
        onMouseEnter={e => { if (!uploading) e.currentTarget.style.borderColor = '#d4a843'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a2a2a'; }}
      >
        <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>☁️</div>
        <p style={{ fontFamily: '"DM Mono",monospace', fontSize: '0.7rem', letterSpacing: '0.15em', color: '#888', textTransform: 'uppercase' }}>
          {uploading ? 'Uploading…' : `Click to upload (max ${maxFiles})`}
        </p>
        <p style={{ fontSize: '0.65rem', color: '#555', marginTop: '4px', fontFamily: '"DM Mono",monospace' }}>
          JPG, PNG, WEBP, AVIF • Max 10 MB each
        </p>
      </div>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleChange}
        style={{ display: 'none' }}
      />

      {/* Progress list */}
      {progress.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {progress.map((p, i) => (
            <div key={i} style={{
              display:        'flex',
              alignItems:     'center',
              gap:            '10px',
              background:     'rgba(255,255,255,0.03)',
              padding:        '8px 12px',
              borderRadius:   '2px',
              border:         '1px solid #1e1e1e',
            }}>
              <span style={{ fontSize: '0.85rem' }}>{statusIcon(p.status)}</span>
              <span style={{
                flex:           1,
                fontFamily:     '"DM Mono",monospace',
                fontSize:       '0.7rem',
                color:          p.status === 'error' ? '#e05555' : '#888',
                overflow:       'hidden',
                textOverflow:   'ellipsis',
                whiteSpace:     'nowrap',
              }}>
                {p.name}
              </span>
              {p.status === 'uploading' && (
                <span style={{
                  width:       '14px', height: '14px',
                  border:      '2px solid #555',
                  borderTop:   '2px solid #d4a843',
                  borderRadius:'50%',
                  flexShrink:  0,
                  animation:   'spin 0.8s linear infinite',
                }} />
              )}
              {p.status === 'error' && (
                <span style={{ fontSize: '0.6rem', color: '#e05555', fontFamily: '"DM Mono",monospace' }}>
                  {p.error}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
