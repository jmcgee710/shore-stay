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

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const loggedIn = await login(email, password);
      if (loggedIn.role === 'HOME_WATCHER' || loggedIn.role === 'PROPERTY_MANAGER') {
        navigate('/team');
      } else {
        navigate('/homeowner');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: 'Inter Tight, Inter, sans-serif' }}>

      {/* ── Left brand panel ────────────────────────────────── */}
      <div style={{ width: '42%', background: `linear-gradient(160deg, #061e33 0%, ${T.oceanDeep} 40%, ${T.ocean} 100%)`, display: 'flex', flexDirection: 'column', padding: '40px 48px' }} className="hidden md:flex">
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img src="/logo.png" alt="Shore Stay" style={{ height: 40, width: 40, objectFit: 'contain' }} />
          <span style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 22, fontWeight: 500, color: 'white', letterSpacing: '-0.01em' }}>
            Shore<span style={{ fontWeight: 300 }}>Stay</span>
          </span>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: T.seafoam, marginBottom: 16 }}>
            Long Beach Island, NJ
          </p>
          <h2 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 42, fontWeight: 400, lineHeight: 1.1, letterSpacing: '-0.03em', color: 'white', margin: '0 0 20px' }}>
            Your shore house,{' '}
            <em style={{ fontStyle: 'italic', fontWeight: 300, color: T.seafoam }}>handled.</em>
          </h2>
          <p style={{ fontSize: 14, lineHeight: 1.65, color: 'rgba(255,255,255,0.55)', maxWidth: 320 }}>
            Bookings, compliance, home watch, and guest access — all in one calm place.
          </p>
        </div>

        {/* Footer quote */}
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', lineHeight: 1.6 }}>
          "We went from three spreadsheets to one page."<br />
          <span style={{ opacity: 0.7 }}>— Sarah C., Beach Haven</span>
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
          {/* Mobile logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }} className="md:hidden">
            <img src="/logo.png" alt="Shore Stay" style={{ height: 32, width: 32, objectFit: 'contain' }} />
            <span style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 18, fontWeight: 500, color: T.oceanDeep }}>ShoreStay</span>
          </div>

          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 32, fontWeight: 500, letterSpacing: '-0.025em', color: T.oceanDeep, margin: '0 0 6px' }}>
              Welcome back
            </h1>
            <p style={{ fontSize: 14, color: T.muted }}>Sign in to your Shore Stay account</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label htmlFor="email" style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.muted, marginBottom: 8 }}>
                Email
              </label>
              <input id="email" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} style={inp} placeholder="you@example.com" />
            </div>

            <div>
              <label htmlFor="password" style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.muted, marginBottom: 8 }}>
                Password
              </label>
              <input id="password" type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} style={inp} placeholder="••••••••" />
            </div>

            {error && (
              <div style={{ padding: '10px 14px', borderRadius: 10, background: `color-mix(in oklab, ${T.coral} 12%, ${T.cream})`, border: `1px solid color-mix(in oklab, ${T.coral} 30%, transparent)` }}>
                <p style={{ fontSize: 13.5, color: T.coral }}>{error}</p>
              </div>
            )}

            <button type="submit" disabled={loading}
              style={{ padding: '14px', borderRadius: 999, background: T.oceanDeep, color: '#fbf7ee', fontSize: 15, fontWeight: 600, border: 'none', cursor: 'pointer', marginTop: 4, opacity: loading ? 0.6 : 1, transition: 'opacity 150ms' }}>
              {loading ? 'Signing in…' : 'Sign in →'}
            </button>
          </form>

          <p style={{ marginTop: 24, textAlign: 'center', fontSize: 14, color: T.muted }}>
            No account?{' '}
            <Link to="/register" style={{ color: T.ocean, fontWeight: 600, textDecoration: 'none' }}>
              Create one
            </Link>
          </p>

          {/* Demo hint */}
          <div style={{ marginTop: 32, padding: '12px 16px', borderRadius: 12, background: 'rgba(15,76,117,0.05)', border: `1px solid ${T.line}` }}>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.muted, marginBottom: 6 }}>Demo credentials</p>
            <p style={{ fontSize: 12.5, color: T.muted, fontFamily: 'ui-monospace, monospace', lineHeight: 1.8 }}>
              sarah@calabrese.co / demo1234<br />
              ray.mitchell@shorestay.dev / watcher123
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
