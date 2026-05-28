import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

const T = {
  oceanDeep: '#0a3457', ocean: '#0f4c75', seafoam: '#56cfe1',
  cream: '#fbf7ee', muted: '#5b6b7a', line: 'rgba(15,76,117,0.12)',
  coral: 'oklch(0.74 0.13 38)',
};

const inp = {
  width: '100%', borderRadius: 10,
  border: `1px solid ${T.line}`,
  background: T.cream,
  padding: '12px 14px', fontSize: 15,
  fontFamily: 'inherit', outline: 'none',
  color: T.oceanDeep,
} as const;

const TIERS = [
  { name: 'Sandy', price: '$179/yr', desc: '1 property — free 30-day trial' },
  { name: 'Coastal', price: '$369/yr', desc: 'Up to 3 properties', highlight: true },
  { name: 'Island', price: '$749/yr', desc: 'Unlimited properties' },
];

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(name, email, password);
      navigate('/homeowner');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: 'Inter Tight, Inter, sans-serif' }}>

      {/* ── Left brand panel ────────────────────────────────── */}
      <div style={{ width: '42%', background: `linear-gradient(160deg, #061e33 0%, ${T.oceanDeep} 40%, ${T.ocean} 100%)`, display: 'flex', flexDirection: 'column', padding: '40px 48px' }} className="hidden md:flex">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img src="/logo.png" alt="Shore Stay" style={{ height: 40, width: 40, objectFit: 'contain' }} />
          <span style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 22, fontWeight: 500, color: 'white', letterSpacing: '-0.01em' }}>
            Shore<span style={{ fontWeight: 300 }}>Stay</span>
          </span>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: T.seafoam, marginBottom: 16 }}>
            Annual plans
          </p>
          <h2 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 36, fontWeight: 400, lineHeight: 1.1, letterSpacing: '-0.03em', color: 'white', margin: '0 0 28px' }}>
            One platform for every<br />LBI shore house.
          </h2>

          {/* Tier cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {TIERS.map(tier => (
              <div key={tier.name} style={{ padding: '12px 16px', borderRadius: 12, background: tier.highlight ? 'rgba(86,207,225,0.15)' : 'rgba(255,255,255,0.06)', border: tier.highlight ? '1px solid rgba(86,207,225,0.3)' : '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'white' }}>{tier.name}</div>
                  <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{tier.desc}</div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: tier.highlight ? T.seafoam : 'rgba(255,255,255,0.7)' }}>{tier.price}</div>
              </div>
            ))}
          </div>
        </div>

        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>
          No per-booking fees · Cancel anytime
        </p>
      </div>

      {/* ── Right form panel ─────────────────────────────────── */}
      <div style={{ flex: 1, background: T.cream, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <motion.div
          style={{ width: '100%', maxWidth: 400 }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 32, fontWeight: 500, letterSpacing: '-0.025em', color: T.oceanDeep, margin: '0 0 6px' }}>
              List your property
            </h1>
            <p style={{ fontSize: 14, color: T.muted }}>Free 30-day trial · No card required</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label htmlFor="name" style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.muted, marginBottom: 8 }}>
                Full name
              </label>
              <input id="name" type="text" autoComplete="name" required value={name} onChange={e => setName(e.target.value)} style={inp} placeholder="Sarah Calabrese" />
            </div>

            <div>
              <label htmlFor="email" style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.muted, marginBottom: 8 }}>
                Email
              </label>
              <input id="email" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} style={inp} placeholder="you@example.com" />
            </div>

            <div>
              <label htmlFor="password" style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.muted, marginBottom: 8 }}>
                Password <span style={{ fontWeight: 400, opacity: 0.6 }}>(min 8 chars)</span>
              </label>
              <input id="password" type="password" autoComplete="new-password" required minLength={8} value={password} onChange={e => setPassword(e.target.value)} style={inp} placeholder="••••••••" />
            </div>

            {error && (
              <div style={{ padding: '10px 14px', borderRadius: 10, background: `color-mix(in oklab, ${T.coral} 12%, ${T.cream})`, border: `1px solid color-mix(in oklab, ${T.coral} 30%, transparent)` }}>
                <p style={{ fontSize: 13.5, color: T.coral }}>{error}</p>
              </div>
            )}

            <button type="submit" disabled={loading}
              style={{ padding: '14px', borderRadius: 999, background: T.oceanDeep, color: '#fbf7ee', fontSize: 15, fontWeight: 600, border: 'none', cursor: 'pointer', marginTop: 4, opacity: loading ? 0.6 : 1, transition: 'opacity 150ms' }}>
              {loading ? 'Creating account…' : 'Create account →'}
            </button>
          </form>

          <p style={{ marginTop: 24, textAlign: 'center', fontSize: 14, color: T.muted }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: T.ocean, fontWeight: 600, textDecoration: 'none' }}>
              Sign in
            </Link>
          </p>

          <p style={{ marginTop: 20, textAlign: 'center', fontSize: 12, color: T.muted, lineHeight: 1.55 }}>
            By creating an account you agree to our{' '}
            <span style={{ color: T.ocean }}>Terms of Service</span>
            {' & '}
            <span style={{ color: T.ocean }}>Privacy Policy</span>.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
