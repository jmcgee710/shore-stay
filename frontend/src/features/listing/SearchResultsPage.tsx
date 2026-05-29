import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PropertyCard from './components/PropertyCard';
import FilterPanel from './components/FilterPanel';
import type { ListingSummary } from './types';

const T = {
  oceanDeep: '#0a3457', ocean: '#0f4c75', seafoam: '#56cfe1',
  cream: '#fbf7ee', muted: '#5b6b7a', line: 'rgba(15,76,117,0.12)',
};

const API = import.meta.env.VITE_API_URL ?? (import.meta.env.PROD ? '' : 'http://localhost:5000');
const PAGE_SIZE = 12;

export default function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const [listings, setListings] = useState<ListingSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    town: searchParams.get('town') ?? '',
    minBeds: searchParams.get('beds') ?? '',
    minBaths: '',
    pets: searchParams.get('pets') === 'true',
    beachSide: '',
  });

  const checkin = searchParams.get('checkin') ?? '';
  const checkout = searchParams.get('checkout') ?? '';

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.town) params.set('town', filters.town);
    if (filters.minBeds) params.set('minBeds', filters.minBeds);
    if (filters.minBaths) params.set('minBaths', filters.minBaths);
    if (filters.pets) params.set('pets', 'true');
    if (filters.beachSide) params.set('beachSide', filters.beachSide);
    if (checkin) params.set('checkin', checkin);
    if (checkout) params.set('checkout', checkout);
    params.set('limit', String(PAGE_SIZE));
    params.set('offset', String(page * PAGE_SIZE));

    fetch(`${API}/api/public/listings?${params}`)
      .then(r => r.json())
      .then(d => { setListings(d.listings ?? []); setTotal(d.total ?? 0); })
      .catch(() => setListings([]))
      .finally(() => setLoading(false));
  }, [filters, checkin, checkout, page]);

  const pages = Math.ceil(total / PAGE_SIZE);
  const townLabel = filters.town || searchParams.get('town');

  return (
    <div style={{ minHeight: '100vh', background: T.cream, fontFamily: 'Inter Tight, Inter, sans-serif' }}>

      {/* Nav */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 40, borderBottom: `1px solid rgba(255,255,255,0.45)`, background: 'rgba(251,247,238,0.92)', backdropFilter: 'blur(24px) saturate(200%)', padding: '10px 32px', display: 'flex', alignItems: 'center', gap: 20 }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', flexShrink: 0 }}>
          <img src="/logo.png" alt="Shore Stay" style={{ height: 32, width: 32, objectFit: 'contain' }} />
          <span style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 17, fontWeight: 500, color: T.oceanDeep, letterSpacing: '-0.01em' }}>Shore<span style={{ fontWeight: 300 }}>Stay</span></span>
        </Link>
        <div style={{ flex: 1, display: 'flex', gap: 12, alignItems: 'center', maxWidth: 560 }}>
          <input
            placeholder="Search town or name…"
            defaultValue={filters.town}
            onKeyDown={e => { if (e.key === 'Enter') setFilters(f => ({ ...f, town: (e.target as HTMLInputElement).value })); }}
            style={{ flex: 1, borderRadius: 999, border: `1px solid ${T.line}`, background: 'white', padding: '8px 16px', fontSize: 13.5, outline: 'none', color: T.oceanDeep }}
          />
        </div>
        <Link to="/register" style={{ padding: '8px 18px', borderRadius: 999, background: T.oceanDeep, color: '#fbf7ee', fontSize: 13, fontWeight: 600, textDecoration: 'none', flexShrink: 0 }}>
          List property
        </Link>
      </nav>

      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ display: 'flex', gap: 28 }}>

          {/* Sidebar — desktop */}
          <aside style={{ width: 220, flexShrink: 0 }} className="hidden lg:block">
            <FilterPanel filters={filters} onChange={f => { setFilters(f); setPage(0); }} />
          </aside>

          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                {townLabel && (
                  <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: T.ocean, marginBottom: 4 }}>
                    {townLabel}
                  </p>
                )}
                <h1 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 28, fontWeight: 500, letterSpacing: '-0.02em', color: T.oceanDeep, margin: 0 }}>
                  {loading ? 'Searching…' : `${total.toLocaleString()} propert${total === 1 ? 'y' : 'ies'}`}
                  {!townLabel && !loading && <span style={{ fontWeight: 300, color: T.muted }}> on LBI</span>}
                </h1>
              </div>
              <button onClick={() => setShowFilters(!showFilters)}
                style={{ padding: '8px 16px', borderRadius: 999, border: `1px solid ${T.line}`, background: 'transparent', fontSize: 13, cursor: 'pointer', color: T.muted, flexShrink: 0 }}
                className="lg:hidden">
                {showFilters ? 'Hide filters' : 'Filters'}
              </button>
            </div>

            {/* Mobile filters */}
            {showFilters && (
              <div style={{ marginBottom: 20 }} className="lg:hidden">
                <FilterPanel filters={filters} onChange={f => { setFilters(f); setPage(0); setShowFilters(false); }} />
              </div>
            )}

            {/* Grid */}
            {loading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 18 }}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} style={{ aspectRatio: '4/3', borderRadius: 20, background: 'rgba(15,76,117,0.06)', animation: 'pulse 1.5s infinite' }} />
                ))}
              </div>
            ) : listings.length === 0 ? (
              <div style={{ padding: '60px 24px', borderRadius: 16, border: `1.5px dashed ${T.line}`, textAlign: 'center' }}>
                <p style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 22, fontWeight: 500, color: T.oceanDeep, marginBottom: 6 }}>No properties match</p>
                <p style={{ fontSize: 14, color: T.muted }}>Try widening your filters or searching a different town.</p>
              </div>
            ) : (
              <motion.div
                style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 18 }}
                initial="hidden" animate="visible"
                variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
              >
                {listings.map(l => (
                  <motion.div key={l.id} variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}>
                    <PropertyCard listing={l} />
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Pagination */}
            {pages > 1 && (
              <div style={{ marginTop: 36, display: 'flex', justifyContent: 'center', gap: 10 }}>
                <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                  style={{ padding: '9px 20px', borderRadius: 999, border: `1px solid ${T.line}`, background: 'transparent', fontSize: 13.5, cursor: 'pointer', color: T.muted, opacity: page === 0 ? 0.4 : 1 }}>
                  ← Prev
                </button>
                <span style={{ padding: '9px 16px', fontSize: 13.5, color: T.muted }}>Page {page + 1} of {pages}</span>
                <button onClick={() => setPage(p => Math.min(pages - 1, p + 1))} disabled={page >= pages - 1}
                  style={{ padding: '9px 20px', borderRadius: 999, border: `1px solid ${T.line}`, background: 'transparent', fontSize: 13.5, cursor: 'pointer', color: T.muted, opacity: page >= pages - 1 ? 0.4 : 1 }}>
                  Next →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
