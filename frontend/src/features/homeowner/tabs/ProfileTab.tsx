import { useState, FormEvent } from 'react';
import { useApi } from '../../../hooks/useApi';
import type { PropertyFull } from '../types';

interface Props { property: PropertyFull; refetch: () => void; }

export function ProfileTab({ property, refetch }: Props) {
  const api = useApi();
  const [form, setForm] = useState({
    name: property.name,
    address: property.address,
    description: property.description ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function set(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    await api.put(`/api/homeowner/properties/${property.id}`, form);
    await refetch();
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div>
      <h2 className="text-lg font-bold text-ocean">Property Profile</h2>
      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div className="rounded-2xl bg-white p-6 shadow-sm space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Property name</label>
            <input
              type="text" required value={form.name} onChange={set('name')}
              className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-ocean focus:ring-2 focus:ring-ocean/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Address</label>
            <input
              type="text" required value={form.address} onChange={set('address')}
              className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-ocean focus:ring-2 focus:ring-ocean/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Description</label>
            <textarea
              rows={4} value={form.description} onChange={set('description')}
              placeholder="Tell guests what makes this place special…"
              className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-ocean focus:ring-2 focus:ring-ocean/20"
            />
          </div>
        </div>
        <button
          type="submit" disabled={saving}
          className="rounded-full bg-ocean px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-ocean/90 disabled:opacity-60"
        >
          {saved ? '✓ Saved' : saving ? 'Saving…' : 'Save changes'}
        </button>
      </form>
    </div>
  );
}
