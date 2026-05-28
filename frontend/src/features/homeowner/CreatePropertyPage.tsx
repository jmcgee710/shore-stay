import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApi } from '../../hooks/useApi';

export default function CreatePropertyPage() {
  const api = useApi();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', address: '', description: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  function set(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const property = await api.post<{ id: string }>('/api/homeowner/properties', form);
      navigate(`/homeowner/properties/${property.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create property');
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-sand">
      <header className="bg-ocean px-6 pb-6 pt-8 text-white">
        <div className="mx-auto max-w-xl">
          <Link to="/homeowner" className="text-xs text-white/60 hover:text-white/90">
            ← Back to Dashboard
          </Link>
          <h1 className="mt-2 text-2xl font-bold">Add a Property</h1>
        </div>
      </header>

      <main className="mx-auto max-w-xl px-6 py-8">
        <motion.div
          className="rounded-3xl bg-white p-8 shadow-sm"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700">Property name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Sunset Bungalow"
                value={form.name}
                onChange={set('name')}
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-ocean focus:ring-2 focus:ring-ocean/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Address *</label>
              <input
                type="text"
                required
                placeholder="e.g. 42 Ocean Drive, Outer Banks, NC"
                value={form.address}
                onChange={set('address')}
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-ocean focus:ring-2 focus:ring-ocean/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Description <span className="font-normal text-slate-400">(optional)</span>
              </label>
              <textarea
                rows={3}
                placeholder="Tell guests what makes this place special…"
                value={form.description}
                onChange={set('description')}
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-ocean focus:ring-2 focus:ring-ocean/20"
              />
            </div>

            {error && (
              <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-full bg-ocean py-3 font-semibold text-white transition hover:bg-ocean/90 disabled:opacity-60"
            >
              {saving ? 'Creating…' : 'Create Property'}
            </button>
          </form>
        </motion.div>
      </main>
    </div>
  );
}
