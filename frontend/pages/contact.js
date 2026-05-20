import { useState } from 'react';
import Head from 'next/head';
import CustomCursor from '../components/ui/CustomCursor';
import Navbar from '../components/ui/Navbar';
import CartDrawer from '../components/ui/CartDrawer';
import { fetchSettings } from '../lib/api';

export async function getServerSideProps() {
  try {
    const settings = await fetchSettings().catch(() => ({}));
    return { props: { settings } };
  } catch {
    return { props: { settings: {} } };
  }
}

export default function ContactPage({ settings }) {
  const contactEmail = settings.contactEmail || 'contact@valio.dz';

  const [form, setForm] = useState({
    name:    '',
    email:   '',
    subject: 'General Inquiry',
    message: '',
  });
  const [status,  setStatus]  = useState('idle');  // 'idle' | 'sending' | 'sent' | 'error'
  const [errMsg,  setErrMsg]  = useState('');

  const set = field => e => setForm(f => ({ ...f, [field]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setErrMsg('All fields are required'); return;
    }
    // mailto fallback — a real integration would POST to a backend email route
    setStatus('sending');
    await new Promise(r => setTimeout(r, 800));
    const body    = encodeURIComponent(`From: ${form.name} (${form.email})\n\n${form.message}`);
    const subject = encodeURIComponent(form.subject);
    window.location.href = `mailto:${contactEmail}?subject=${subject}&body=${body}`;
    setStatus('sent');
  }

  const labelStyle = {
    display:       'block',
    fontFamily:    '"DM Mono",monospace',
    fontSize:      '0.6rem',
    letterSpacing: '0.18em',
    color:         '#555',
    textTransform: 'uppercase',
    marginBottom:  '8px',
  };

  return (
    <>
      <Head>
        <title>Contact — VALIO</title>
        <meta name="description" content="Get in touch with VALIO. Orders, wholesale, press, and general inquiries." />
      </Head>

      <CustomCursor />
      <Navbar />
      <CartDrawer />

      <main style={{ background: '#000', minHeight: '100vh', paddingTop: '68px' }}>

        {/* ── Header ── */}
        <section style={{
          padding:      'clamp(60px,8vw,100px) clamp(24px,6vw,100px)',
          borderBottom: '1px solid #111',
          background:   'linear-gradient(to bottom, #0c0c0c, #000)',
        }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <p style={{ fontFamily: '"DM Mono",monospace', fontSize: '0.6rem', letterSpacing: '0.4em', color: '#d4a843', textTransform: 'uppercase', marginBottom: '16px' }}>
              Get in touch
            </p>
            <h1 style={{
              fontFamily:    '"Bebas Neue",sans-serif',
              fontSize:      'clamp(3rem,8vw,7rem)',
              letterSpacing: '0.04em',
              color:         '#e8e8e8',
              lineHeight:    0.9,
              marginBottom:  '28px',
            }}>
              CONTACT US
            </h1>
            <p style={{ color: '#555', fontSize: '0.9rem', lineHeight: 1.8, maxWidth: '520px' }}>
              For orders, shipping inquiries, wholesale requests, or press — reach us directly.
              We respond within 24 hours.
            </p>
          </div>
        </section>

        {/* ── Content ── */}
        <section style={{ padding: 'clamp(60px,8vw,100px) clamp(24px,6vw,100px)' }}>
          <div style={{
            maxWidth:            '1100px',
            margin:              '0 auto',
            display:             'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap:                 'clamp(48px,8vw,100px)',
          }}>

            {/* ── Info column ── */}
            <div>
              <div style={{ marginBottom: '48px' }}>
                <p style={{ fontFamily: '"DM Mono",monospace', fontSize: '0.6rem', letterSpacing: '0.3em', color: '#d4a843', textTransform: 'uppercase', marginBottom: '20px' }}>
                  Direct Contact
                </p>
                <a href={`mailto:${contactEmail}`}
                  style={{ fontFamily: '"DM Sans",sans-serif', fontSize: '1.1rem', color: '#ccc', textDecoration: 'none', display: 'block', marginBottom: '8px', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.target.style.color = '#d4a843'}
                  onMouseLeave={e => e.target.style.color = '#ccc'}>
                  {contactEmail}
                </a>
                {settings.shippingNote && (
                  <p style={{ fontFamily: '"DM Mono",monospace', fontSize: '0.7rem', letterSpacing: '0.1em', color: '#555', marginTop: '12px' }}>
                    {settings.shippingNote}
                  </p>
                )}
              </div>

              <div style={{ borderTop: '1px solid #111', paddingTop: '40px' }}>
                <p style={{ fontFamily: '"DM Mono",monospace', fontSize: '0.6rem', letterSpacing: '0.3em', color: '#555', textTransform: 'uppercase', marginBottom: '20px' }}>
                  Topics We Handle
                </p>
                {[
                  'Order status & tracking',
                  'Size & fit guidance',
                  'Returns & exchanges',
                  'Wholesale inquiries',
                  'Press & collaboration',
                  'General questions',
                ].map(topic => (
                  <div key={topic} style={{
                    display:     'flex',
                    alignItems:  'center',
                    gap:         '12px',
                    marginBottom:'12px',
                  }}>
                    <div style={{ width: '4px', height: '4px', background: '#d4a843', borderRadius: '50%', flexShrink: 0 }} />
                    <p style={{ color: '#555', fontSize: '0.85rem', fontFamily: '"DM Sans",sans-serif' }}>{topic}</p>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: '1px solid #111', paddingTop: '40px', marginTop: '40px' }}>
                <p style={{ fontFamily: '"DM Mono",monospace', fontSize: '0.6rem', letterSpacing: '0.3em', color: '#555', textTransform: 'uppercase', marginBottom: '12px' }}>
                  Location
                </p>
                <p style={{ color: '#444', fontSize: '0.85rem', lineHeight: '1.8' }}>
                  Algiers, Algeria<br />
                  Ships Nationally & Internationally
                </p>
              </div>
            </div>

            {/* ── Form column ── */}
            <div>
              {status === 'sent' ? (
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '20px' }}>🖤</div>
                  <h3 style={{ fontFamily: '"Bebas Neue",sans-serif', fontSize: '1.8rem', color: '#d4a843', letterSpacing: '0.1em', marginBottom: '12px' }}>
                    MESSAGE SENT
                  </h3>
                  <p style={{ color: '#555', fontSize: '0.85rem', lineHeight: '1.8', marginBottom: '32px' }}>
                    Your email client should have opened. If not, email us directly at{' '}
                    <a href={`mailto:${contactEmail}`} style={{ color: '#d4a843' }}>{contactEmail}</a>
                  </p>
                  <button className="btn-outline" onClick={() => { setStatus('idle'); setForm({ name: '', email: '', subject: 'General Inquiry', message: '' }); }}>
                    SEND ANOTHER
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <p style={{ fontFamily: '"DM Mono",monospace', fontSize: '0.6rem', letterSpacing: '0.3em', color: '#d4a843', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Send a Message
                  </p>

                  <div>
                    <label style={labelStyle}>Your Name *</label>
                    <input className="admin-field" type="text" value={form.name} onChange={set('name')} required />
                  </div>

                  <div>
                    <label style={labelStyle}>Email Address *</label>
                    <input className="admin-field" type="email" value={form.email} onChange={set('email')} required />
                  </div>

                  <div>
                    <label style={labelStyle}>Subject</label>
                    <select className="admin-field" value={form.subject} onChange={set('subject')}>
                      {[
                        'General Inquiry',
                        'Order Status',
                        'Returns & Exchanges',
                        'Size & Fit',
                        'Wholesale',
                        'Press & Collaboration',
                        'Other',
                      ].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  <div>
                    <label style={labelStyle}>Message *</label>
                    <textarea
                      className="admin-field"
                      rows={6}
                      value={form.message}
                      onChange={set('message')}
                      required
                      style={{ resize: 'vertical' }}
                      placeholder="Write your message here…"
                    />
                  </div>

                  {errMsg && (
                    <p style={{ fontFamily: '"DM Mono",monospace', fontSize: '0.75rem', color: '#e05555' }}>{errMsg}</p>
                  )}

                  <button
                    type="submit"
                    className="btn-gold"
                    style={{ alignSelf: 'flex-start' }}
                    disabled={status === 'sending'}
                  >
                    {status === 'sending' ? 'SENDING…' : 'SEND MESSAGE'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>

      </main>
    </>
  );
}
