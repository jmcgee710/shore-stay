import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGuest } from './GuestContext';
import { PlannerLogin } from './PlannerLogin';
import { RulesTab } from './tabs/RulesTab';
import { HouseInfoTab } from './tabs/HouseInfoTab';
import { RoomsTab } from './tabs/RoomsTab';
import { PlannerTab } from './tabs/PlannerTab';
import { GuideTab } from './tabs/GuideTab';

const T = {
  oceanDeep: '#0a3457', ocean: '#0f4c75', seafoam: '#56cfe1',
  cream: '#fbf7ee', bg: '#fbf7ee', muted: '#5b6b7a',
  line: 'rgba(15,76,117,0.12)',
};

const TABS = [
  { id: 'rules',   label: 'Rules'   },
  { id: 'info',    label: 'Info'    },
  { id: 'rooms',   label: 'Rooms'   },
  { id: 'planner', label: 'Plan'    },
  { id: 'guide',   label: 'Guide'   },
] as const;

type TabId = (typeof TABS)[number]['id'];

function fmtRange(start: string, end: string) {
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  const s = new Date(start).toLocaleDateString('en-US', opts);
  const e = new Date(end).toLocaleDateString('en-US', { ...opts, year: 'numeric' });
  return `${s} – ${e}`;
}

function WaveDivider() {
  return (
    <div style={{ position: 'relative', overflow: 'hidden', height: 48 }}>
      <svg viewBox="0 0 1440 48" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} aria-hidden>
        <motion.path fill="rgba(255,255,255,0.12)"
          animate={{ d: [
            'M0,24 C360,48 720,0 1080,24 C1260,36 1380,12 1440,24 L1440,48 L0,48 Z',
            'M0,20 C300,44 600,4 900,20 C1100,36 1300,8 1440,20 L1440,48 L0,48 Z',
            'M0,24 C360,48 720,0 1080,24 C1260,36 1380,12 1440,24 L1440,48 L0,48 Z',
          ]}}
          transition={{ repeat: Infinity, duration: 7, ease: 'easeInOut' }}
        />
        <motion.path fill="rgba(255,255,255,0.22)"
          animate={{ d: [
            'M0,32 C240,12 480,44 720,28 C960,12 1200,44 1440,28 L1440,48 L0,48 Z',
            'M0,36 C200,16 500,48 800,30 C1050,14 1250,46 1440,34 L1440,48 L0,48 Z',
            'M0,32 C240,12 480,44 720,28 C960,12 1200,44 1440,28 L1440,48 L0,48 Z',
          ]}}
          transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut', delay: 0.5 }}
        />
        <rect x="0" y="44" width="1440" height="4" fill={T.bg} />
      </svg>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div style={{ minHeight: '100vh', background: T.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <motion.div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ fontSize: 48 }}>🌊</div>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.22em', textTransform: 'uppercase', color: T.muted }}>Loading your stay…</div>
        <div style={{ display: 'flex', gap: 6 }}>
          {[0,1,2].map(i => (
            <motion.div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: T.seafoam }}
              animate={{ scale: [1,1.4,1], opacity: [0.4,1,0.4] }}
              transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2 }} />
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function NotFoundScreen() {
  return (
    <div style={{ minHeight: '100vh', background: T.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
      <div style={{ fontSize: 56, marginBottom: 16 }}>🌊</div>
      <div style={{ padding: 28, borderRadius: 20, background: T.cream, border: `1px solid ${T.line}`, maxWidth: 380, width: '100%' }}>
        <h1 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 24, fontWeight: 500, color: T.oceanDeep, marginBottom: 8 }}>Link not found</h1>
        <p style={{ fontSize: 13.5, color: T.muted, lineHeight: 1.6 }}>
          This access link is invalid or your booking has ended. Check your confirmation for a fresh link.
        </p>
      </div>
    </div>
  );
}

export default function RenterHub() {
  const { booking, loading, error, planner, clearPlanner } = useGuest();
  const [activeTab, setActiveTab] = useState<TabId>('rules');
  const [showLogin, setShowLogin] = useState(false);

  if (loading) return <LoadingScreen />;
  if (error || !booking) return <NotFoundScreen />;

  const prop = booking.property as typeof booking.property & { coverPhotoUrl?: string; bedrooms?: number };
  const photo = prop.coverPhotoUrl;

  const tabContent: Record<TabId, JSX.Element> = {
    rules: <RulesTab />, info: <HouseInfoTab />, rooms: <RoomsTab />,
    planner: <PlannerTab />, guide: <GuideTab />,
  };

  return (
    <div style={{ minHeight: '100vh', background: T.bg, fontFamily: 'Inter Tight, Inter, sans-serif' }}>
      {/* ── Hero header ─────────────────────────────────────── */}
      <header style={{ position: 'relative', overflow: 'hidden', background: `linear-gradient(160deg, #061e33 0%, ${T.oceanDeep} 40%, ${T.ocean} 100%)` }}>
        {/* Photo background */}
        {photo && (
          <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${photo})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.25 }} />
        )}
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, rgba(10,52,87,0.7) 0%, rgba(10,52,87,0.95) 100%)` }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 640, margin: '0 auto', padding: '28px 20px 0' }}>
          {/* Wordmark */}
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
            style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <img src="/logo.png" alt="Shore Stay" style={{ height: 28, width: 28, objectFit: 'contain' }} />
            <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)' }}>Shore Stay</span>
          </motion.div>

          {/* Property info */}
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }}
            style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: T.seafoam, marginBottom: 6 }}>
            Welcome to
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }}
            style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 36, fontWeight: 500, lineHeight: 1.1, letterSpacing: '-0.02em', color: 'white', margin: '0 0 6px' }}>
            {booking.property.name}
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.18 }}
            style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', marginBottom: 16 }}>
            {booking.property.address}
            {prop.bedrooms && <span> · {prop.bedrooms} BR</span>}
          </motion.p>

          {/* Dates + planner */}
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}
            style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', paddingBottom: 4 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, borderRadius: 999, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.1)', padding: '5px 12px', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>
              📅 {fmtRange(booking.startDate, booking.endDate)}
            </span>
            {planner ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, borderRadius: 999, background: 'rgba(86,207,225,0.2)', border: '1px solid rgba(86,207,225,0.35)', padding: '5px 12px', fontSize: 12, fontWeight: 600, color: T.seafoam }}>
                  ✏️ {planner.name}
                </span>
                <button onClick={clearPlanner} style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Exit</button>
              </div>
            ) : (
              <button onClick={() => setShowLogin(true)}
                style={{ borderRadius: 999, border: '1px solid rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.08)', padding: '5px 12px', fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.75)', cursor: 'pointer' }}>
                Trip Planner? Sign in →
              </button>
            )}
          </motion.div>
        </div>
        <WaveDivider />
      </header>

      {/* ── Tab bar ─────────────────────────────────────────── */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 30, borderBottom: `1px solid rgba(255,255,255,0.45)`, background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(24px) saturate(200%)' }}>
        <div style={{ maxWidth: 640, margin: '0 auto', display: 'flex' }}>
          {TABS.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                flex: 1, padding: '14px 8px', fontSize: 13.5, fontWeight: isActive ? 600 : 500,
                color: isActive ? T.oceanDeep : T.muted,
                borderBottom: isActive ? `2px solid ${T.oceanDeep}` : '2px solid transparent',
                marginBottom: -1, background: 'none', border: 'none', paddingTop: 0, paddingLeft: 0, paddingRight: 0,
                cursor: 'pointer', transition: 'all 150ms',
              }}>
                {tab.label}
              </button>
            );
          })}
        </div>
      </nav>

      {/* ── Tab content ─────────────────────────────────────── */}
      <main style={{ maxWidth: 640, margin: '0 auto', padding: '20px 16px 40px' }}>
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.2 }}>
            {tabContent[activeTab]}
          </motion.div>
        </AnimatePresence>
      </main>

      <PlannerLogin open={showLogin} onClose={() => setShowLogin(false)} />
    </div>
  );
}
