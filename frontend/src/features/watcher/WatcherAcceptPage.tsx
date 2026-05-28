import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

export default function WatcherAcceptPage() {
  const { inviteToken } = useParams<{ inviteToken: string }>();
  const { user, token, login, register } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<'info' | 'login' | 'register'>('info');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [accepting, setAccepting] = useState(false);
  const [accepted, setAccepted] = useState(false);

  async function acceptInvite(authToken: string) {
    setAccepting(true);
    try {
      const res = await fetch(`${API}/api/auth/watcher-accept/${inviteToken}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to accept invite');
      setAccepted(true);
      setTimeout(() => navigate('/team'), 2000);
    } catch (e: any) {
      setError(e.message);
    }
    setAccepting(false);
  }

  // If already a HOME_WATCHER, accept immediately
  useEffect(() => {
    if (user?.role === 'HOME_WATCHER' && token) {
      acceptInvite(token);
    }
  }, [user, token]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      // After login, the effect above will fire if role is HOME_WATCHER
      // But we don't have the token here immediately — wait for user update
    } catch (e: any) {
      setError(e.message);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      // Register as HOME_WATCHER via the dedicated endpoint
      const res = await fetch(`${API}/api/auth/watcher-register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Registration failed');
      // Accept invite with the new token directly
      await acceptInvite(data.token);
    } catch (e: any) {
      setError(e.message);
    }
  }

  if (accepting) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-sand p-6">
        <span className="text-4xl">🏖️</span>
        <p className="text-lg font-bold text-ocean-700">Accepting your invitation…</p>
      </div>
    );
  }

  if (accepted) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-sand p-6 text-center">
        <span className="text-5xl">✅</span>
        <h1 className="text-xl font-extrabold text-ocean-700">Invitation accepted!</h1>
        <p className="text-sm text-slate-600">Taking you to your dashboard…</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-sand p-6">
      <div className="w-full max-w-sm rounded-3xl bg-white/90 p-8 shadow-glass-lg">
        <div className="text-center mb-6">
          <span className="text-4xl">🏠</span>
          <h1 className="mt-3 text-xl font-extrabold text-ocean-700">Shore Stay Home Watch</h1>
          <p className="mt-1 text-sm text-slate-500">You've been invited to watch a property.</p>
        </div>

        {error && (
          <div className="mb-4 rounded-2xl bg-red-50 border border-red-200/60 px-4 py-3">
            <p className="text-xs font-semibold text-red-600">{error}</p>
          </div>
        )}

        {mode === 'info' && (
          <div className="space-y-3">
            <p className="text-sm text-slate-600 text-center">
              Sign in to your existing watcher account, or create a new one to accept this invitation.
            </p>
            <button
              onClick={() => setMode('login')}
              className="w-full rounded-full bg-ocean-600 py-3 text-sm font-bold text-white hover:bg-ocean-700 transition"
            >
              Sign in to existing account
            </button>
            <button
              onClick={() => setMode('register')}
              className="w-full rounded-full border border-ocean-400 py-3 text-sm font-bold text-ocean-700 hover:bg-ocean/5 transition"
            >
              Create new watcher account
            </button>
          </div>
        )}

        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm focus:border-ocean-400 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Password</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm focus:border-ocean-400 focus:outline-none" />
            </div>
            <button type="submit"
              className="w-full rounded-full bg-ocean-600 py-3 text-sm font-bold text-white hover:bg-ocean-700 transition">
              Sign in &amp; Accept Invite
            </button>
            <button type="button" onClick={() => setMode('info')}
              className="w-full text-xs text-slate-400 hover:text-slate-600 transition">
              ← Back
            </button>
          </form>
        )}

        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Your name</label>
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
                placeholder="Jane Smith"
                className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm focus:border-ocean-400 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm focus:border-ocean-400 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Password (min. 8 chars)</label>
              <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm focus:border-ocean-400 focus:outline-none" />
            </div>
            <button type="submit"
              className="w-full rounded-full bg-ocean-600 py-3 text-sm font-bold text-white hover:bg-ocean-700 transition">
              Create Account &amp; Accept Invite
            </button>
            <button type="button" onClick={() => setMode('info')}
              className="w-full text-xs text-slate-400 hover:text-slate-600 transition">
              ← Back
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
