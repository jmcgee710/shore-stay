import { motion } from 'framer-motion';
import { useGuest } from '../GuestContext';

const T = { oceanDeep: '#0a3457', ocean: '#0f4c75', cream: '#fbf7ee', muted: '#5b6b7a', ink: '#0a1f33', line: 'rgba(15,76,117,0.12)', seafoam: '#56cfe1' };

export function RulesTab() {
  const { booking } = useGuest();
  const lines = (booking?.property.rules ?? '').split('\n').filter(l => l.trim());

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: T.ocean, marginBottom: 6 }}>House rules</div>
        <h2 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 28, fontWeight: 500, letterSpacing: '-0.02em', color: T.oceanDeep, margin: 0 }}>Rules of stay</h2>
        <p style={{ fontSize: 13.5, color: T.muted, marginTop: 6, lineHeight: 1.5 }}>Your host's house rules — please read before settling in.</p>
      </div>

      <div style={{ padding: 20, borderRadius: 16, background: T.cream, border: `1px solid ${T.line}` }}>
        {lines.length > 0 ? (
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {lines.map((line, i) => (
              <motion.li key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <span style={{ flexShrink: 0, marginTop: 1, width: 22, height: 22, borderRadius: '50%', background: `rgba(15,76,117,0.1)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: T.ocean }}>
                  {i + 1}
                </span>
                <span style={{ fontSize: 14, lineHeight: 1.6, color: T.ink }}>
                  {line.replace(/^[•\-\d.]+\s*/, '')}
                </span>
              </motion.li>
            ))}
          </ul>
        ) : (
          <div style={{ padding: '32px 0', textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>📋</div>
            <p style={{ fontSize: 13.5, color: T.muted }}>No house rules have been added yet.</p>
          </div>
        )}
      </div>

      {lines.length > 0 && (
        <p style={{ textAlign: 'center', fontSize: 12, color: T.muted, marginTop: 16 }}>
          Thank you for being a great guest 🌊
        </p>
      )}
    </div>
  );
}
