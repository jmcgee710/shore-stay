import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { post } from '../../lib/api';
import { useGuest } from './GuestContext';

interface Props {
  open: boolean;
  onClose: () => void;
}

/** PlannerLogin — frosted-glass bottom sheet for trip planner auth */
export function PlannerLogin({ open, onClose }: Props) {
  const { booking, setPlannerToken } = useGuest();
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!booking) return;
    setError('');
    setLoading(true);
    try {
      const data = await post<{ token: string }>('/api/auth/planner-login', {
        bookingId: booking.id,
        name,
        pin,
      });
      setPlannerToken(data.token);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid name or PIN');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/40"
            style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Sheet */}
          <motion.div
            className="relative z-10 w-full max-w-sm"
            initial={{ y: 48, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 32, opacity: 0, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          >
            <div
              className="rounded-4xl border border-white/60 px-7 py-8 shadow-glass-lg"
              style={{
                background: 'rgba(255, 255, 255, 0.90)',
                backdropFilter: 'blur(24px) saturate(180%)',
                WebkitBackdropFilter: 'blur(24px) saturate(180%)',
              }}
            >
              {/* Header */}
              <div className="mb-6">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-ocean/10">
                  <span className="text-2xl">✏️</span>
                </div>
                <h2 className="text-xl font-bold text-ocean-700">Trip Planner Sign In</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Enter your name and 4-digit PIN to unlock planning mode.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-[13px] font-semibold text-slate-600 mb-1.5" htmlFor="pl-name">
                    Your name
                  </label>
                  <input
                    id="pl-name"
                    type="text"
                    required
                    autoComplete="off"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Sarah"
                    className="w-full rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3 text-sm placeholder:text-slate-300 transition focus:border-ocean-400"
                  />
                </div>

                {/* PIN */}
                <div>
                  <label className="block text-[13px] font-semibold text-slate-600 mb-1.5" htmlFor="pl-pin">
                    PIN
                  </label>
                  <input
                    id="pl-pin"
                    type="password"
                    inputMode="numeric"
                    pattern="\d{4}"
                    maxLength={4}
                    required
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••"
                    className="w-full rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3 text-center text-3xl tracking-[0.5em] text-ocean-700 placeholder:text-slate-200 transition focus:border-ocean-400"
                  />
                </div>

                {/* Error */}
                <AnimatePresence>
                  {error && (
                    <motion.p
                      className="rounded-2xl bg-red-50 border border-red-100 px-4 py-2.5 text-sm font-medium text-red-600"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      {error}
                    </motion.p>
                  )}
                </AnimatePresence>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-full bg-ocean-600 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-ocean-700 disabled:opacity-60 active:scale-[0.98]"
                >
                  {loading ? 'Checking…' : 'Sign in as Planner'}
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2 text-sm font-medium text-slate-400 transition hover:text-slate-600"
                >
                  Cancel
                </button>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
