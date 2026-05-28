import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AvailabilityCalendar from './components/AvailabilityCalendar';
import type { ListingDetail } from './types';

const T = {
  oceanDeep: '#0a3457', ocean: '#0f4c75', seafoam: '#56cfe1',
  cream: '#fbf7ee', bg: '#fbf7ee', muted: '#5b6b7a', ink: '#0a1f33',
  line: 'rgba(15,76,117,0.12)', coral: 'oklch(0.74 0.13 38)', green: '#5a8a5e',
};

const BEACHSIDE: Record<string, string> = {
  ocean: '🌊 Oceanside', bay: '⚓ Bayside', lagoon: '🛶 Lagoon', both: '🌊⚓ Ocean & Bay',
};

const PICK_ICONS: Record<string, string> = {
  dining: '🍽️', bars: '🍹', beaches: '🏖️', activities: '🎣', shopping: '🛍️', other: '📍',
};

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

function WaveDivider() {
  return (
    <div style={{ position: 'relative', overflow: 'hidden', height: 48 }}>
      <svg viewBox="0 0 1440 48" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} aria-hidden>
        <motion.path fill="rgba(255,255,255,0.12)"
          animate={{ d: ['M0,24 C360,48 720,0 1080,24 C1260,36 1380,12 1440,24 L1440,48 L0,48 Z','M0,18 C300,44 600,4 900,18 C1100,34 1300,8 1440,18 L1440,48 L0,48 Z','M0,24 C360,48 720,0 1080,24 C1260,36 1380,12 1440,24 L1440,48 L0,48 Z'] }}
          transition={{ repeat: Infinity, duration: 7, ease: 'easeInOut' }}
        />
        <motion.path fill="rgba(255,255,255,0.22)"
          animate={{ d: ['M0,32 C240,12 480,44 720,28 C960,12 1200,44 1440,28 L1440,48 L0,48 Z','M0,36 C200,16 500,48 800,30 C1050,14 1250,46 1440,34 L1440,48 L0,48 Z','M0,32 C240,12 480,44 720,28 C960,12 1200,44 1440,28 L1440,48 L0,48 Z'] }}
          transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut', delay: 0.5 }}
        />
        <rect x="0" y="44" width="1440" height="4" fill={T.cream} />
      </svg>
    </div>
  );
}

export default function PropertyPage() {
  const { id } = useParams<{ id: string }>();
  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [contactSent, setContactSent] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });

  useEffect(() => {
    fetch(`${API}/api/public/listings/${id}`)
      .then(r => r.json()).then(setListing).catch(() => setListing(null)).finally(() => setLoading(false));
  }, [id]);

  function handleContact(e: React.FormEvent) {
    e.preventDefault();
    if (!listing) return;
    window.location.href = `mailto:${listing.ownerEmail ?? ''}?subject=Inquiry: ${encodeURIComponent(listing.name)}&body=${encodeURIComponent(`Hi,\n\nI'm interested in ${listing.name}.\n\nName: ${form.name}\nPhone: ${form.phone}\n\n${form.message}`)}`;
    setContactSent(true);
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: T.cream, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'flex', gap: 6 }}>
        {[0,1,2].map(i => <motion.div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: T.seafoam }} animate={{ scale: [1,1.4,1], opacity: [0.4,1,0.4] }} transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2 }} />)}
      </div>
    </div>
  );

  if (!listing) return (
    <div style={{ minHeight: '100vh', background: T.cream, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ padding: 32, borderRadius: 20, background: 'white', border: `1px solid ${T.line}`, textAlign: 'center' }}>
        <p style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 22, color: T.oceanDeep }}>Listing not found</p>
        <Link to="/browse" style={{ display: 'block', marginTop: 10, fontSize: 13, color: T.ocean, textDecoration: 'none' }}>← Back to search</Link>
      </div>
    </div>
  );

  const allPhotos = listing.photos.length > 0
    ? listing.photos
    : listing.coverPhotoUrl
      ? [{ id: 'cover', url: listing.coverPhotoUrl, caption: null, isCover: true }]
      : [];

  const inp = { width: '100%', borderRadius: 10, border: `1px solid ${T.line}`, background: T.cream, padding: '10px 12px', fontSize: 14, fontFamily: 'inherit', outline: 'none' } as const;

  return (
    <div style={{ minHeight: '100vh', background: T.cream, fontFamily: 'Inter Tight, Inter, sans-serif' }}>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIdx !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setLightboxIdx(null)}
            style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <button onClick={e => { e.stopPropagation(); setLightboxIdx(i => i! > 0 ? i! - 1 : allPhotos.length - 1); }}
              style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.12)', border: 'none', color: 'white', fontSize: 28, width: 48, height: 48, borderRadius: '50%', cursor: 'pointer' }}>‹</button>
            <img src={allPhotos[lightboxIdx].url} alt="" onClick={e => e.stopPropagation()} style={{ maxHeight: '90vh', maxWidth: '90vw', borderRadius: 16, objectFit: 'contain' }} />
            <button onClick={e => { e.stopPropagation(); setLightboxIdx(i => i! < allPhotos.length - 1 ? i! + 1 : 0); }}
              style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.12)', border: 'none', color: 'white', fontSize: 28, width: 48, height: 48, borderRadius: '50%', cursor: 'pointer' }}>›</button>
            <button onClick={() => setLightboxIdx(null)} style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.12)', border: 'none', color: 'white', fontSize: 22, width: 40, height: 40, borderRadius: '50%', cursor: 'pointer' }}>✕</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero header */}
      <header style={{ background: `linear-gradient(160deg, #061e33 0%, ${T.oceanDeep} 40%, ${T.ocean} 100%)`, position: 'relative' }}>
        {listing.coverPhotoUrl && (
          <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${listing.coverPhotoUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.18 }} />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(10,52,87,0.6) 0%, rgba(10,52,87,0.9) 100%)' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 1100, margin: '0 auto', padding: '16px 24px 0' }}>
          {/* Breadcrumb */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, marginBottom: 20 }}>
            <Link to="/" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>
              <img src="/logo.png" alt="" style={{ height: 22, width: 22, objectFit: 'contain', verticalAlign: 'middle' }} />
            </Link>
            <span style={{ color: 'rgba(255,255,255,0.2)' }}>/</span>
            <Link to="/browse" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>Search</Link>
            {listing.town && <>
              <span style={{ color: 'rgba(255,255,255,0.2)' }}>/</span>
              <Link to={`/lbi/${listing.town.toLowerCase().replace(/ /g, '-')}`} style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>{listing.town}</Link>
            </>}
          </nav>

          {/* Property title */}
          <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 40, fontWeight: 500, lineHeight: 1.1, letterSpacing: '-0.03em', color: 'white', margin: '0 0 8px' }}>
            {listing.name}
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
            style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', marginBottom: 16 }}>
            {listing.address}
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
            style={{ display: 'flex', flexWrap: 'wrap', gap: 8, paddingBottom: 4 }}>
            {[
              listing.town && { label: `📍 ${listing.town}` },
              listing.beachSide && { label: BEACHSIDE[listing.beachSide] },
              listing.bedrooms != null && { label: `🛏 ${listing.bedrooms} bed${listing.bedrooms !== 1 ? 's' : ''}` },
              listing.bathrooms != null && { label: `🚿 ${listing.bathrooms} bath${listing.bathrooms !== 1 ? 's' : ''}` },
              listing.petFriendly && { label: '🐾 Pet friendly' },
            ].filter(Boolean).map((item: any, i) => (
              <span key={i} style={{ padding: '4px 12px', borderRadius: 999, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.15)', fontSize: 12.5, fontWeight: 500, color: 'white', backdropFilter: 'blur(8px)' }}>
                {item.label}
              </span>
            ))}
          </motion.div>
        </div>
        <WaveDivider />
      </header>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 24px 60px' }}>

        {/* Photo gallery */}
        {allPhotos.length > 0 && (
          <div style={{ marginBottom: 28, borderRadius: 20, overflow: 'hidden', display: 'grid', gap: 3, gridTemplateColumns: allPhotos.length === 1 ? '1fr' : allPhotos.length === 2 ? '2fr 1fr' : '2fr 1fr', gridTemplateRows: allPhotos.length <= 2 ? '300px' : '200px 200px', maxHeight: 410 }}>
            {/* Main photo */}
            <button onClick={() => setLightboxIdx(0)} style={{ border: 'none', padding: 0, cursor: 'pointer', overflow: 'hidden', gridRow: allPhotos.length > 2 ? '1 / 3' : '1' }}>
              <img src={allPhotos[0].url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 400ms' }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.04)')}
                onMouseLeave={e => (e.currentTarget.style.transform = '')} />
            </button>
            {/* Thumbnails */}
            {allPhotos.slice(1, 3).map((p, i) => (
              <button key={p.id} onClick={() => setLightboxIdx(i + 1)} style={{ border: 'none', padding: 0, cursor: 'pointer', overflow: 'hidden', position: 'relative' }}>
                <img src={p.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 400ms' }}
                  onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.04)')}
                  onMouseLeave={e => (e.currentTarget.style.transform = '')} />
                {i === 1 && allPhotos.length > 3 && (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(10,52,87,0.55)', color: 'white', fontSize: 16, fontWeight: 700 }}>
                    +{allPhotos.length - 3} more
                  </div>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Two-column layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 28, alignItems: 'start' }}>

          {/* Main content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* About */}
            {listing.description && (
              <div style={{ padding: 22, borderRadius: 16, background: 'white', border: `1px solid ${T.line}` }}>
                <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: T.muted, marginBottom: 10 }}>About this property</p>
                <p style={{ fontSize: 15, lineHeight: 1.7, color: T.ink, margin: 0 }}>{listing.description}</p>
              </div>
            )}

            {/* Amenities */}
            {listing.amenities.length > 0 && (
              <div style={{ padding: 22, borderRadius: 16, background: 'white', border: `1px solid ${T.line}` }}>
                <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: T.muted, marginBottom: 12 }}>Amenities</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {listing.amenities.map(a => (
                    <span key={a} style={{ padding: '5px 12px', borderRadius: 999, background: `rgba(15,76,117,0.07)`, fontSize: 13, fontWeight: 500, color: T.oceanDeep }}>
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Availability */}
            <div style={{ padding: 22, borderRadius: 16, background: 'white', border: `1px solid ${T.line}` }}>
              <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: T.muted, marginBottom: 12 }}>Availability</p>
              <AvailabilityCalendar bookings={listing.bookings} />
            </div>

            {/* Owner's Picks */}
            {listing.ownersPicks.length > 0 && (
              <div style={{ padding: 22, borderRadius: 16, background: 'white', border: `1px solid ${T.line}` }}>
                <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: T.muted, marginBottom: 4 }}>Owner's picks</p>
                <p style={{ fontSize: 13, color: T.muted, marginBottom: 14 }}>Insider recommendations from the owner</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                  {listing.ownersPicks.slice(0, 6).map(pick => (
                    <div key={pick.id} style={{ padding: '12px 14px', borderRadius: 12, background: T.cream, border: `1px solid ${T.line}`, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <span style={{ fontSize: 18, flexShrink: 0 }}>{PICK_ICONS[pick.category] ?? '📍'}</span>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 14, fontWeight: 500, color: T.oceanDeep, margin: '0 0 3px', lineHeight: 1.2 }}>{pick.name}</p>
                        {pick.ownerNote && <p style={{ fontSize: 12, color: T.muted, margin: 0, lineHeight: 1.5, fontStyle: 'italic' }}>"{pick.ownerNote}"</p>}
                        {pick.link && <a href={pick.link} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: T.ocean, textDecoration: 'none', display: 'inline-block', marginTop: 4 }}>Visit →</a>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Contact card — sticky */}
          <div style={{ position: 'sticky', top: 80 }}>
            <div style={{ padding: 22, borderRadius: 20, background: 'white', border: `1px solid ${T.line}`, boxShadow: '0 4px 24px rgba(15,76,117,0.08)' }}>
              {listing.nightlyRate && (
                <div style={{ marginBottom: 18, paddingBottom: 18, borderBottom: `1px solid ${T.line}`, textAlign: 'center' }}>
                  <span style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 38, fontWeight: 500, color: T.oceanDeep }}>${listing.nightlyRate.toLocaleString()}</span>
                  <span style={{ fontSize: 14, color: T.muted }}> / night</span>
                </div>
              )}

              <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: T.muted, marginBottom: 14 }}>Contact owner</p>

              {contactSent ? (
                <div style={{ padding: '14px', borderRadius: 12, background: `color-mix(in oklab, ${T.green} 10%, ${T.cream})`, textAlign: 'center', fontSize: 14, fontWeight: 600, color: T.green }}>
                  ✓ Email client opened!
                </div>
              ) : (
                <form onSubmit={handleContact} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <input required placeholder="Your name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={inp} />
                  <input required type="email" placeholder="Your email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} style={inp} />
                  <input placeholder="Phone (optional)" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} style={inp} />
                  <textarea rows={3} placeholder="Tell the owner your dates and questions…" value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} style={{ ...inp, resize: 'none', display: 'block' }} />
                  <button type="submit" style={{ padding: '13px', borderRadius: 999, background: T.oceanDeep, color: '#fbf7ee', fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer', marginTop: 2 }}>
                    Send inquiry
                  </button>
                </form>
              )}

              {listing.ownerPhone && (
                <a href={`tel:${listing.ownerPhone}`} style={{ marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '11px', borderRadius: 999, border: `1px solid ${T.line}`, fontSize: 14, fontWeight: 500, color: T.oceanDeep, textDecoration: 'none' }}>
                  📞 {listing.ownerPhone}
                </a>
              )}

              <p style={{ marginTop: 14, textAlign: 'center', fontSize: 12, color: T.muted }}>No booking fees · Contact owner directly</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div style={{ background: `linear-gradient(160deg, #061e33, ${T.oceanDeep})`, padding: '48px 24px', textAlign: 'center' }}>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>Own a property on LBI?</p>
        <Link to="/register" style={{ display: 'inline-block', padding: '12px 28px', borderRadius: 999, background: 'white', color: T.oceanDeep, fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
          List it on Shore Stay
        </Link>
      </div>
    </div>
  );
}
