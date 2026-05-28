import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGuest } from '../GuestContext';
import { WeatherTidesWidget } from '../WeatherTidesWidget';

const T = { oceanDeep: '#0a3457', ocean: '#0f4c75', seafoam: '#56cfe1', cream: '#fbf7ee', muted: '#5b6b7a', ink: '#0a1f33', line: 'rgba(15,76,117,0.12)' };

function RevealCard({ icon, label, content, index }: { icon: string; label: string; content: string | null | undefined; index: number }) {
  const [revealed, setRevealed] = useState(false);
  if (!content) return null;
  const isSensitive = label === 'WiFi';
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.07 }}
      style={{ padding: 18, borderRadius: 14, background: T.cream, border: `1px solid ${T.line}` }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(15,76,117,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
          {icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: T.muted, marginBottom: 6 }}>{label}</div>
          {isSensitive && !revealed ? (
            <div>
              <div style={{ filter: 'blur(6px)', fontSize: 14, color: T.ink, lineHeight: 1.6, userSelect: 'none', pointerEvents: 'none' }}>{content}</div>
              <button onClick={() => setRevealed(true)}
                style={{ marginTop: 8, padding: '5px 14px', borderRadius: 999, background: T.oceanDeep, color: '#fbf7ee', fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer' }}>
                Tap to reveal
              </button>
            </div>
          ) : (
            <div style={{ fontSize: 14, lineHeight: 1.7, color: T.ink, whiteSpace: 'pre-line' }}>{content}</div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function HouseInfoTab() {
  const { booking } = useGuest();
  const p = booking?.property;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: T.ocean, marginBottom: 6 }}>My Stay</div>
        <h2 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 28, fontWeight: 500, letterSpacing: '-0.02em', color: T.oceanDeep, margin: 0 }}>House info</h2>
      </div>

      <WeatherTidesWidget lat={p?.latitude} lon={p?.longitude} />

      <RevealCard icon="📶" label="WiFi" content={p?.wifiInfo} index={1} />
      <RevealCard icon="🚗" label="Parking" content={p?.parkingInfo} index={2} />
      {p?.description && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.21 }}
          style={{ padding: 18, borderRadius: 14, background: T.cream, border: `1px solid ${T.line}` }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(86,207,225,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>🏖️</div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: T.muted, marginBottom: 6 }}>About the property</div>
              <p style={{ fontSize: 14, color: T.ink, lineHeight: 1.65 }}>{p.description}</p>
            </div>
          </div>
        </motion.div>
      )}

      {!p?.wifiInfo && !p?.parkingInfo && !p?.description && (
        <div style={{ padding: '32px 20px', borderRadius: 14, background: T.cream, border: `1px solid ${T.line}`, textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>🏡</div>
          <p style={{ fontSize: 13.5, color: T.muted }}>House info will appear here once your host adds it.</p>
        </div>
      )}
    </div>
  );
}
