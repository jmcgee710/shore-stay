import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';
import type { PropertySummary } from './types';

// Diagonal stripe pattern — matches prototype exactly
function StripeThumb({ deg, size = 52 }: { deg: number; size?: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: 10, flexShrink: 0,
      background: `repeating-linear-gradient(${deg}deg, #a8e3ec 0 6px, #f7e6c9 6px 12px)`,
      opacity: 0.75,
    }} />
  );
}

// Status pill — color-mix style
function StatusPill({ status }: { status: string }) {
  const cfg: Record<string, { bg: string; color: string; label: string }> = {
    Occupied:  { bg: 'color-mix(in oklab, #56cfe1 30%, transparent)', color: '#0a3457', label: 'OCCUPIED' },
    'Turn day': { bg: '#f7e6c9', color: '#0a3457', label: 'TURN DAY' },
    Vacant:    { bg: 'rgba(15,76,117,0.08)', color: '#0a3457', label: 'VACANT' },
  };
  const c = cfg[status] ?? cfg['Vacant'];
  return (
    <span style={{
      padding: '3px 9px', borderRadius: 5,
      fontSize: 9.5, fontWeight: 700, letterSpacing: '0.05em',
      background: c.bg, color: c.color,
    }}>{c.label}</span>
  );
}

// KPI card
function Kpi({ label, value, sub, trend, warn = false }: { label: string; value: string; sub: string; trend: string; warn?: boolean }) {
  return (
    <div style={{ padding: 18, borderRadius: 14, background: '#fbf7ee', border: '1px solid rgba(15,76,117,0.12)' }}>
      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#5b6b7a' }}>{label}</div>
      <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 36, fontWeight: 500, letterSpacing: '-0.025em', color: '#0a3457', marginTop: 6, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12, color: '#5b6b7a', marginTop: 4 }}>{sub}</div>
      <div style={{ fontSize: 11.5, fontWeight: 600, marginTop: 10, color: warn ? 'oklch(0.74 0.13 38)' : '#5a8a5e' }}>{trend}</div>
    </div>
  );
}

// Determine a stable pattern angle from property id
function patternAngle(id: string) {
  const chars = id.split('').reduce((s, c) => s + c.charCodeAt(0), 0);
  return (chars % 4) * 30 + 25;
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const api = useApi();
  const [properties, setProperties] = useState<PropertySummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<PropertySummary[]>('/api/homeowner/properties')
      .then(setProperties)
      .finally(() => setLoading(false));
  }, []);

  const totalBookings = properties.reduce((s, p) => s + p._count.bookings, 0);

  return (
    <div style={{ minHeight: '100vh', background: '#fbf7ee' }}>
      {/* Sidebar + content layout */}
      <div style={{ display: 'flex', minHeight: '100vh' }}>

        {/* Sidebar */}
        <aside style={{
          width: 240, flexShrink: 0, background: '#0a3457', color: '#fbf7ee',
          display: 'flex', flexDirection: 'column', padding: '20px 14px',
        }}>
          <div style={{ padding: '6px 10px 24px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src="/logo.png" alt="Shore Stay" style={{ height: 32, width: 32, objectFit: 'contain' }} />
            <span style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 18, fontWeight: 500, letterSpacing: '-0.01em' }}>
              Shore<span style={{ fontWeight: 300 }}>Stay</span>
            </span>
          </div>

          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.5, padding: '8px 12px 6px' }}>
            Navigation
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {[
              { label: 'Dashboard', href: '/homeowner', icon: '🏠' },
              { label: 'Browse listings', href: '/browse', icon: '🔍' },
            ].map(({ label, href, icon }) => (
              <Link key={href} to={href} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 12px', borderRadius: 8,
                fontSize: 13.5, fontWeight: 500,
                color: 'rgba(251,247,238,0.75)',
                textDecoration: 'none',
              }}>
                <span>{icon}</span>
                {label}
              </Link>
            ))}
          </nav>

          <div style={{ flex: 1 }} />

          {/* Concierge card */}
          <div style={{ padding: 14, borderRadius: 12, background: 'rgba(255,255,255,0.06)', marginBottom: 16 }}>
            <div style={{ fontSize: 11, opacity: 0.6, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>Need a hand?</div>
            <div style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.4, marginBottom: 10 }}>Concierge text line, 7am–10pm.</div>
            <div style={{ padding: '7px 12px', borderRadius: 999, background: '#56cfe1', color: '#0a3457', fontSize: 11.5, fontWeight: 600, display: 'inline-block' }}>
              Text concierge
            </div>
          </div>

          {/* User + sign out */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#0f4c75', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>
                {user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 600 }}>{user?.name?.split(' ')[0]}</div>
                <div style={{ fontSize: 11, opacity: 0.5 }}>Homeowner</div>
              </div>
            </div>
            <button onClick={logout} style={{ fontSize: 11, opacity: 0.5, color: '#fbf7ee', cursor: 'pointer' }}>Sign out</button>
          </div>
        </aside>

        {/* Main content */}
        <main style={{ flex: 1, padding: '36px 40px 60px', overflow: 'auto' }}>
          {/* PageHeader */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#0f4c75', marginBottom: 8 }}>
              Good morning, {user?.name?.split(' ')[0]}
            </div>
            <h1 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 38, fontWeight: 400, lineHeight: 1.05, letterSpacing: '-0.03em', color: '#0a3457', margin: 0 }}>
              Your shore season, at a glance.
            </h1>
            <p style={{ fontSize: 14, color: '#5b6b7a', marginTop: 8, maxWidth: 600, lineHeight: 1.55 }}>
              {properties.length} {properties.length === 1 ? 'property' : 'properties'} · manage bookings, watchers, compliance and guest access all in one place.
            </p>
          </div>

          {/* KPI strip */}
          {!loading && properties.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 32 }}>
              <Kpi label="Properties" value={String(properties.length)} sub="in your portfolio" trend="All active" />
              <Kpi label="Total bookings" value={String(totalBookings)} sub="across all properties" trend={totalBookings > 0 ? '+active season' : 'Add your first'} />
              <Kpi label="Rooms" value={String(properties.reduce((s, p) => s + p._count.rooms, 0))} sub="configured" trend="Guest-ready" />
              <Kpi label="Open items" value="1" sub="watcher alert" trend="Needs review" warn />
            </div>
          )}

          {/* Properties section */}
          <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 20, fontWeight: 500, letterSpacing: '-0.02em', color: '#0a3457', margin: 0 }}>
              Properties
            </h2>
            <Link to="/homeowner/properties/new" style={{
              padding: '9px 16px', borderRadius: 999,
              background: '#0a3457', color: '#fbf7ee',
              fontSize: 13, fontWeight: 600, textDecoration: 'none',
              display: 'inline-flex', alignItems: 'center', gap: 6,
            }}>
              + Add property
            </Link>
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[1, 2].map(i => (
                <div key={i} style={{ height: 80, borderRadius: 12, background: 'rgba(15,76,117,0.06)', animation: 'pulse 1.5s infinite' }} />
              ))}
            </div>
          ) : properties.length === 0 ? (
            <motion.div
              style={{ padding: 48, borderRadius: 16, border: '1.5px dashed rgba(15,76,117,0.2)', textAlign: 'center' }}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            >
              <div style={{ fontSize: 40 }}>🏖️</div>
              <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 22, fontWeight: 500, color: '#0a3457', marginTop: 12 }}>No properties yet</div>
              <div style={{ fontSize: 13, color: '#5b6b7a', marginTop: 6 }}>Add your first LBI property to get started.</div>
              <Link to="/homeowner/properties/new" style={{
                display: 'inline-block', marginTop: 16, padding: '10px 20px',
                borderRadius: 999, background: '#0a3457', color: '#fbf7ee',
                fontSize: 13, fontWeight: 600, textDecoration: 'none',
              }}>
                Create your first property
              </Link>
            </motion.div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {properties.map((p, i) => (
                <motion.div key={p.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                  <Link to={`/homeowner/properties/${p.id}`} style={{
                    display: 'grid', gridTemplateColumns: 'auto 1fr auto auto auto',
                    gap: 16, alignItems: 'center',
                    padding: 16, borderRadius: 14,
                    background: '#fbf7ee', border: '1px solid rgba(15,76,117,0.12)',
                    textDecoration: 'none',
                    transition: 'box-shadow 150ms',
                  }}>
                    <StripeThumb deg={patternAngle(p.id)} />
                    <div>
                      <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 18, fontWeight: 500, color: '#0a3457', letterSpacing: '-0.02em' }}>{p.name}</div>
                      <div style={{ fontSize: 12, color: '#5b6b7a', marginTop: 2 }}>{p.address}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 10.5, color: '#5b6b7a', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>Bookings</div>
                      <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 17, color: '#0a3457', fontWeight: 500 }}>{p._count.bookings}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 10.5, color: '#5b6b7a', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>Rooms</div>
                      <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 17, color: '#0a3457', fontWeight: 500 }}>{p._count.rooms}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <StatusPill status={p._count.bookings > 0 ? 'Occupied' : 'Vacant'} />
                      <span style={{
                        padding: '8px 14px', borderRadius: 8,
                        background: '#0a3457', color: '#fbf7ee',
                        fontSize: 12, fontWeight: 600,
                      }}>Open →</span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
