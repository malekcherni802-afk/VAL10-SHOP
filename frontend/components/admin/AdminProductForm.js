import { useState, useEffect } from 'react';
import { createProduct, updateProduct, getImageUrl } from '../../lib/api';

export default function AdminProductForm({ product, token, onSaved, onCancel }) {
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    category: 'clothing',
    soldOut: false,
    featured: false,
    tags: '',
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [modelFile, setModelFile] = useState(null);
  const [existingImages, setExistingImages] = useState([]);
  const [removedImages, setRemovedImages] = useState([]);
  const [loading, setSaving] = useState(false);
  const [error, setError] = useState('');

  const categories = ['clothing', 'accessories', 'jewelry', 'footwear', 'other'];

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name || '',
        description: product.description || '',
        price: product.price?.toString() || '',
        category: product.category || 'clothing',
        soldOut: product.soldOut || false,
        featured: product.featured || false,
        tags: product.tags?.join(', ') || '',
      });
      setExistingImages(product.images || []);
    }
  }, [product]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('description', form.description);
      formData.append('price', form.price);
      formData.append('category', form.category);
      formData.append('soldOut', form.soldOut.toString());
      formData.append('featured', form.featured.toString());
      formData.append('tags', form.tags);

      imageFiles.forEach(file => formData.append('images', file));
      if (modelFile) formData.append('model3D', modelFile);

      if (product && removedImages.length > 0) {
        formData.append('removeImages', JSON.stringify(removedImages));
      }

      if (product) {
        await updateProduct(product._id, formData, token);
      } else {
        await createProduct(formData, token);
      }

      onSaved();
    } catch (err) {
      setError(err.message || 'Failed to save product');
    }
    setSaving(false);
  }

  const labelStyle = {
    display: 'block',
    fontFamily: 'Cinzel, serif',
    fontSize: '0.6rem',
    letterSpacing: '0.2em',
    color: 'rgba(192,160,96,0.7)',
    textTransform: 'uppercase',
    marginBottom: 8,
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 720 }}>
      <div style={{ display: 'grid', gap: 24 }}>
        {/* Name */}
        <div>
          <label style={labelStyle}>Product Name *</label>
          <input
            type="text"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            className="admin-input"
            required
            placeholder="e.g. Void Cloak"
          />
        </div>

        {/* Description */}
        <div>
          <label style={labelStyle}>Description *</label>
          <textarea
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            className="admin-input"
            required
            rows={4}
            placeholder="Describe this piece..."
            style={{ resize: 'vertical' }}
          />
        </div>

        {/* Price + Category */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div>
            <label style={labelStyle}>Price (USD) *</label>
            <input
              type="number"
              value={form.price}
              onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
              className="admin-input"
              required
              min="0"
              step="0.01"
              placeholder="0.00"
            />
          </div>
          <div>
            <label style={labelStyle}>Category</label>
            <select
              value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              className="admin-input"
            >
              {categories.map(c => (
                <option key={c} value={c} style={{ background: '#111' }}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tags */}
        <div>
          <label style={labelStyle}>Tags (comma separated)</label>
          <input
            type="text"
            value={form.tags}
            onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
            className="admin-input"
            placeholder="velvet, gothic, limited"
          />
        </div>

        {/* Toggles */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {[
            { key: 'soldOut', label: 'Mark as Sold Out' },
            { key: 'featured', label: 'Featured Product' },
          ].map(toggle => (
            <div key={toggle.key} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <button
                type="button"
                onClick={() => setForm(f => ({ ...f, [toggle.key]: !f[toggle.key] }))}
                style={{
                  width: 44,
                  height: 22,
                  background: form[toggle.key] ? 'var(--accent)' : 'rgba(255,255,255,0.1)',
                  border: 'none',
                  borderRadius: 11,
                  cursor: 'pointer',
                  position: 'relative',
                  flexShrink: 0,
                  transition: 'background 0.3s',
                }}
              >
                <div style={{
                  width: 16, height: 16,
                  background: '#000',
                  borderRadius: '50%',
                  position: 'absolute',
                  top: 3,
                  left: form[toggle.key] ? 25 : 3,
                  transition: 'left 0.3s',
                }} />
              </button>
              <label style={{
                fontFamily: 'Cinzel, serif',
                fontSize: '0.6rem',
                letterSpacing: '0.12em',
                color: 'rgba(192,192,192,0.6)',
                textTransform: 'uppercase',
                cursor: 'pointer',
              }}>
                {toggle.label}
              </label>
            </div>
          ))}
        </div>

        {/* Existing images */}
        {existingImages.length > 0 && (
          <div>
            <label style={labelStyle}>Current Images</label>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {existingImages.map((img, i) => (
                <div
                  key={i}
                  style={{
                    position: 'relative',
                    width: 72,
                    height: 72,
                    opacity: removedImages.includes(img) ? 0.3 : 1,
                    transition: 'opacity 0.3s',
                  }}
                >
                  <img
                    src={getImageUrl(img)}
                    alt={`Image ${i + 1}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (removedImages.includes(img)) {
                        setRemovedImages(r => r.filter(x => x !== img));
                      } else {
                        setRemovedImages(r => [...r, img]);
                      }
                    }}
                    style={{
                      position: 'absolute',
                      top: 2, right: 2,
                      background: removedImages.includes(img) ? 'var(--accent)' : 'rgba(180,50,50,0.8)',
                      border: 'none',
                      color: '#fff',
                      width: 18, height: 18,
                      borderRadius: '50%',
                      fontSize: '0.7rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {removedImages.includes(img) ? '+' : '×'}
                  </button>
                </div>
              ))}
            </div>
            {removedImages.length > 0 && (
              <div style={{
                fontSize: '0.75rem',
                color: 'rgba(180,50,50,0.7)',
                fontFamily: 'Cormorant Garamond, serif',
                marginTop: 8,
              }}>
                {removedImages.length} image(s) marked for removal
              </div>
            )}
          </div>
        )}

        {/* Image upload */}
        <div>
          <label style={labelStyle}>
            {product ? 'Add More Images' : 'Product Images'}
          </label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={e => setImageFiles(Array.from(e.target.files))}
            style={{
              display: 'block',
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: '0.9rem',
              color: 'rgba(192,192,192,0.6)',
              width: '100%',
            }}
          />
          {imageFiles.length > 0 && (
            <div style={{
              fontSize: '0.8rem',
              color: 'var(--accent)',
              marginTop: 8,
              fontFamily: 'Cormorant Garamond, serif',
            }}>
              {imageFiles.length} file(s) selected
            </div>
          )}
        </div>

        {/* 3D model upload */}
        <div>
          <label style={labelStyle}>3D Model (.glb / .gltf)</label>
          <input
            type="file"
            accept=".glb,.gltf"
            onChange={e => setModelFile(e.target.files[0] || null)}
            style={{
              display: 'block',
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: '0.9rem',
              color: 'rgba(192,192,192,0.6)',
              width: '100%',
            }}
          />
          {product?.model3D && !modelFile && (
            <div style={{
              fontSize: '0.8rem',
              color: 'rgba(192,160,96,0.6)',
              marginTop: 8,
              fontFamily: 'Cormorant Garamond, serif',
            }}>
              3D model already attached. Upload new to replace.
            </div>
          )}
          {modelFile && (
            <div style={{
              fontSize: '0.8rem',
              color: 'var(--accent)',
              marginTop: 8,
              fontFamily: 'Cormorant Garamond, serif',
            }}>
              New 3D model: {modelFile.name}
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div style={{
            color: 'rgba(180,50,50,0.8)',
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: '0.95rem',
            border: '1px solid rgba(180,50,50,0.2)',
            padding: '12px 16px',
          }}>
            {error}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 16, paddingTop: 8 }}>
          <button
            type="submit"
            disabled={loading}
            className="admin-btn"
          >
            {loading ? 'SAVING...' : (product ? 'UPDATE PRODUCT' : 'CREATE PRODUCT')}
          </button>
          <button
            type="button"
            onClick={onCancel}
            style={{
              background: 'transparent',
              border: '1px solid rgba(192,192,192,0.2)',
              color: 'rgba(192,192,192,0.5)',
              fontFamily: 'Cinzel, serif',
              fontSize: '0.65rem',
              letterSpacing: '0.15em',
              padding: '10px 24px',
              cursor: 'pointer',
              textTransform: 'uppercase',
            }}
          >
            CANCEL
          </button>
        </div>
      </div>
    </form>
  );
}
