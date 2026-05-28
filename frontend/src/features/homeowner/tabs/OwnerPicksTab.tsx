import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApi } from '../../../hooks/useApi';

interface Pick {
  id: string;
  name: string;
  category: string;
  ownerNote: string | null;
  link: string | null;
  photoUrl: string | null;
  sortOrder: number;
}

interface Props {
  propertyId: string;
}

const CATEGORIES = [
  { value: 'dining',     label: 'Dining',     emoji: '🍽️' },
  { value: 'bars',       label: 'Bars',        emoji: '🍹' },
  { value: 'beaches',    label: 'Beaches',     emoji: '🏖️' },
  { value: 'activities', label: 'Activities',  emoji: '🎣' },
  { value: 'shopping',   label: 'Shopping',    emoji: '🛍️' },
  { value: 'other',      label: 'Other',       emoji: '📍' },
] as const;

const BLANK = { name: '', category: 'dining', ownerNote: '', link: '', photoUrl: '' };

export function OwnerPicksTab({ propertyId }: Props) {
  const api = useApi();
  const [picks, setPicks] = useState<Pick[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<typeof BLANK>({ ...BLANK });
  const [saving, setSaving] = useState(false);

  async function load() {
    const data = await api.get<Pick[]>(`/api/homeowner/properties/${propertyId}/picks`);
    setPicks(data);
  }

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [propertyId]);

  function openNew() {
    setForm({ ...BLANK });
    setEditId(null);
    setShowForm(true);
  }

  function openEdit(p: Pick) {
    setForm({
      name: p.name,
      category: p.category,
      ownerNote: p.ownerNote ?? '',
      link: p.link ?? '',
      photoUrl: p.photoUrl ?? '',
    });
    setEditId(p.id);
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      if (editId) {
        await api.put(`/api/homeowner/properties/${propertyId}/picks/${editId}`, form);
      } else {
        await api.post(`/api/homeowner/properties/${propertyId}/picks`, form);
      }
      await load();
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    await api.del(`/api/homeowner/properties/${propertyId}/picks/${id}`);
    setPicks((prev) => prev.filter((p) => p.id !== id));
  }

  const inputCls = 'w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-ocean focus:ring-2 focus:ring-ocean/20';
  const labelCls = 'block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1';

  const catInfo = (val: string) => CATEGORIES.find((c) => c.value === val) ?? CATEGORIES[0];

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-ocean">Owner's Picks</h2>
          <p className="mt-1 text-sm text-slate-500">
            Your personal recommendations — shown to guests in the companion app and on your public listing.
          </p>
        </div>
        <button
          onClick={openNew}
          className="shrink-0 rounded-full bg-ocean px-4 py-2 text-sm font-semibold text-white transition hover:bg-ocean/90"
        >
          + Add pick
        </button>
      </div>

      {/* Add / Edit form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mt-5 rounded-2xl bg-white p-5 shadow-md shadow-ocean/10"
          >
            <h3 className="mb-4 font-semibold text-ocean">
              {editId ? 'Edit pick' : 'New pick'}
            </h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Name */}
              <div className="sm:col-span-2">
                <label className={labelCls}>Name *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Harvey Cedars Shellfish Co."
                  className={inputCls}
                />
              </div>

              {/* Category */}
              <div>
                <label className={labelCls}>Category</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setForm({ ...form, category: c.value })}
                      className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                        form.category === c.value
                          ? 'border-ocean bg-ocean text-white'
                          : 'border-slate-200 text-slate-600 hover:border-ocean/40'
                      }`}
                    >
                      {c.emoji} {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Link */}
              <div>
                <label className={labelCls}>Link (optional)</label>
                <input
                  type="url"
                  value={form.link}
                  onChange={(e) => setForm({ ...form, link: e.target.value })}
                  placeholder="https://…"
                  className={inputCls}
                />
              </div>

              {/* Owner note */}
              <div className="sm:col-span-2">
                <label className={labelCls}>Your note — write in your voice</label>
                <textarea
                  rows={3}
                  value={form.ownerNote}
                  onChange={(e) => setForm({ ...form, ownerNote: e.target.value })}
                  placeholder="e.g. Get there early — the line gets long by 9am. Order the egg sandwich, trust me."
                  className={`${inputCls} resize-none`}
                />
                <p className="mt-1 text-xs text-slate-400">Guests see this in your own words — be personal and specific.</p>
              </div>
            </div>

            <div className="mt-4 flex gap-3">
              <button
                onClick={handleSave}
                disabled={saving || !form.name.trim()}
                className="rounded-full bg-ocean px-5 py-2 text-sm font-semibold text-white transition hover:bg-ocean/90 disabled:opacity-50"
              >
                {saving ? 'Saving…' : editId ? 'Save changes' : 'Add pick'}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="rounded-full border border-slate-200 px-5 py-2 text-sm text-slate-500 transition hover:border-slate-300"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Picks list */}
      <div className="mt-5">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-2xl bg-slate-100" />
            ))}
          </div>
        ) : picks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 py-12 text-center text-slate-400">
            <p className="text-3xl mb-2">📍</p>
            <p className="font-medium">No picks yet</p>
            <p className="mt-1 text-sm">Add your first recommendation — guests love insider tips.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {picks.map((pick) => {
                const cat = catInfo(pick.category);
                return (
                  <motion.div
                    key={pick.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="flex items-start gap-4 rounded-2xl bg-white p-4 shadow-sm shadow-ocean/5"
                  >
                    <span className="mt-0.5 text-2xl">{cat.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-ocean">{pick.name}</p>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                          {cat.label}
                        </span>
                      </div>
                      {pick.ownerNote && (
                        <p className="mt-1 text-sm text-slate-500 line-clamp-2">"{pick.ownerNote}"</p>
                      )}
                      {pick.link && (
                        <a href={pick.link} target="_blank" rel="noreferrer" className="mt-1 inline-block text-xs text-ocean/60 hover:text-ocean">
                          {pick.link}
                        </a>
                      )}
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <button
                        onClick={() => openEdit(pick)}
                        className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-500 transition hover:bg-slate-100"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(pick.id)}
                        className="rounded-lg px-3 py-1.5 text-xs font-medium text-red-400 transition hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {picks.length > 0 && (
        <p className="mt-4 text-xs text-slate-400">
          {picks.length} pick{picks.length !== 1 ? 's' : ''} · shown to guests on your listing page and in the companion app
        </p>
      )}
    </div>
  );
}
