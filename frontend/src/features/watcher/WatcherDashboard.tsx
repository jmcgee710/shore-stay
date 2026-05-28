import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';
import type { WatcherAssignment } from './types';

const T = {
  oceanDeep: '#0a3457', ocean: '#0f4c75', seafoam: '#56cfe1',
  cream: '#fbf7ee', bg: '#fbf7ee', muted: '#5b6b7a', ink: '#0a1f33',
  line: 'rgba(15,76,117,0.12)', seafoamSoft: '#a8e3ec', sandWarm: '#f7e6c9',
  coral: 'oklch(0.74 0.13 38)', green: '#5a8a5e',
};

function patternAngle(id: string) {
  return (id.split('').reduce((s, c) => s + c.charCodeAt(0), 0) % 4) * 30 + 25;
}

export default function WatcherDashboard() {
  const { user, logout } = useAuth();
  const api = useApi();
  const [assignments, setAssignments] = useState<WatcherAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<WatcherAssignment[]>('/api/watcher/my-properties')
      .then(setAssignments)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: T.bg, fontFamily: 'Inter Tight, Inter, sans-serif' }}>
      {/* Header */}
      <header style={{ background: `linear-gradient(160deg, #061e33 0%, ${T.oceanDeep} 40%, ${T.ocean} 100%)`, padding: '28px 24px 24px' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <img src="/logo.png" alt="Shore Stay" style={{ height: 28, width: 28, objectFit: 'contain' }} />
            <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>Shore Stay · Home Watch</span>
          </div>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: T.seafoam, marginBottom: 6 }}>
            This week's runs
          </p>
          <h1 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 32, fontWeight: 500, letterSpacing: '-0.02em', color: 'white', margin: '0 0 4px' }}>
            Welcome, {user?.name?.split(' ')[0]}
          </h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>{user?.name} · Home Watcher</p>
        </div>
      </header>

      <main style={{ maxWidth: 640, margin: '0 auto', padding: '24px 16px 48px' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, padding: '48px 0' }}>
            {[0,1,2].map(i => (
              <motion.div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: T.seafoam }}
                animate={{ scale: [1,1.4,1], opacity: [0.4,1,0.4] }}
                transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2 }} />
            ))}
          </div>
        ) : assignments.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            style={{ padding: '48px 24px', borderRadius: 16, border: `1.5px dashed ${T.line}`, textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🏠</div>
            <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 22, fontWeight: 500, color: T.oceanDeep, marginBottom: 8 }}>No properties yet</div>
            <p style={{ fontSize: 13.5, color: T.muted, lineHeight: 1.6 }}>Ask a homeowner to send you a watcher invite link, then open it to get started.</p>
          </motion.div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {/* Stats strip */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 8 }}>
              {[
                { label: 'Properties', value: String(assignments.length) },
                { label: 'Hands-off', value: String(assignments.filter(a => a.handsOffMode).length) },
                { label: 'This week', value: `${assignments.length} due` },
              ].map(s => (
                <div key={s.label} style={{ padding: '14px 16px', borderRadius: 12, background: T.cream, border: `1px solid ${T.line}` }}>
                  <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: T.muted }}>{s.label}</div>
                  <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 22, fontWeight: 500, color: T.oceanDeep, marginTop: 4 }}>{s.value}</div>
                </div>
              ))}
            </div>

            {/* Property rows */}
            {assignments.map((a, i) => {
              const deg = patternAngle(a.property?.id ?? a.id);
              return (
                <motion.div key={a.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                  <Link to={`/watcher/properties/${a.property?.id}`}
                    style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 14, alignItems: 'center', padding: 16, borderRadius: 14, background: T.cream, border: `1px solid ${T.line}`, textDecoration: 'none', transition: 'box-shadow 150ms' }}>
                    <div style={{ width: 52, height: 52, borderRadius: 10, background: `repeating-linear-gradient(${deg}deg, ${T.seafoamSoft} 0 6px, ${T.sandWarm} 6px 12px)`, opacity: 0.75 }} />
                    <div>
                      <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 18, fontWeight: 500, color: T.oceanDeep, letterSpacing: '-0.01em' }}>
                        {a.property?.name ?? 'Property'}
                      </div>
                      <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>{a.property?.address}</div>
                      <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                        {a.handsOffMode && (
                          <span style={{ padding: '3px 9px', borderRadius: 5, fontSize: 9.5, fontWeight: 700, letterSpacing: '0.05em', background: `color-mix(in oklab, ${T.seafoam} 25%, transparent)`, color: T.oceanDeep }}>
                            HANDS-OFF · ON
                          </span>
                        )}
                        <span style={{ padding: '3px 9px', borderRadius: 5, fontSize: 9.5, fontWeight: 700, letterSpacing: '0.05em', background: `color-mix(in oklab, ${T.green} 18%, transparent)`, color: T.green }}>
                          {a.inviteAccepted ? 'ACTIVE' : 'PENDING'}
                        </span>
                      </div>
                    </div>
                    <div style={{ fontSize: 22, color: T.muted }}>›</div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}

        <button onClick={logout} style={{ marginTop: 32, width: '100%', padding: '12px', borderRadius: 999, border: `1px solid ${T.line}`, background: 'transparent', fontSize: 13.5, fontWeight: 500, color: T.muted, cursor: 'pointer' }}>
          Sign out
        </button>
      </main>
    </div>
  );
}
