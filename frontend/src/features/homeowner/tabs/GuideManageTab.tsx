import { useState } from 'react';
import { useApi } from '../../../hooks/useApi';
import type { PropertyFull, GuideItem } from '../types';
import { GUIDE_CATEGORIES } from '../types';
import { PageHeader } from '../PropertyDetail';

interface Props { property: PropertyFull; refetch: () => void; }

const T = {
  oceanDeep: '#0a3457', ocean: '#0f4c75', seafoam: '#56cfe1',
  cream: '#fbf7ee', bg: '#fbf7ee', muted: '#5b6b7a', ink: '#0a1f33',
  line: 'rgba(15,76,117,0.12)',
};

const EMPTY = { category: 'dining', name: '', description: '', websiteUrl: '' };
type FS = typeof EMPTY;
const inp = { borderRadius: 10, border: `1px solid ${T.line}`, background: T.cream, padding: '10px 12px', fontSize: 14, fontFamily: 'inherit', outline: 'none', width: '100%' } as const;

export function GuideManageTab({ property, refetch }: Props) {
  const api = useApi();
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<FS>(EMPTY);
  const [saving, setSaving] = useState(false);

  function set(field: keyof FS, value: string) { setForm(f => ({ ...f, [field]: value })); }

  async function handleSave(id?: string) {
    setSaving(true);
    const path = id ? `/api/homeowner/properties/${property.id}/guide/${id}` : `/api/homeowner/properties/${property.id}/guide`;
    id ? await api.put(path, form) : await api.post(path, form);
    refetch(); setSaving(false); setAdding(false); setEditing(null); setForm(EMPTY);
  }

  async function handleDelete(id: string) {
    if (!confirm('Remove this listing?')) return;
    await api.del(`/api/homeowner/properties/${property.id}/guide/${id}`);
    refetch();
  }

  function startEdit(item: GuideItem) {
    setEditing(item.id);
    setForm({ category: item.category, name: item.name, description: item.description ?? '', websiteUrl: item.websiteUrl ?? '' });
    setAdding(false);
  }

  function InlineForm({ onSave, onCancel }: { onSave: () => void; onCancel: () => void }) {
    return (
      <div style={{ padding: 20, borderRadius: 14, background: T.cream, border: `1px solid ${T.line}`, marginBottom: 10 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 10, marginBottom: 10 }}>
          <select value={form.category} onChange={e => set('category', e.target.value)} style={inp}>
            {GUIDE_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>)}
          </select>
          <input placeholder="Business name *" value={form.name} onChange={e => set('name', e.target.value)} style={inp} />
        </div>
        <textarea rows={2} placeholder="Description (optional)" value={form.description} onChange={e => set('description', e.target.value)}
          style={{ ...inp, resize: 'none', marginBottom: 10, display: 'block' }} />
        <input type="url" placeholder="Website URL (optional)" value={form.websiteUrl} onChange={e => set('websiteUrl', e.target.value)}
          style={{ ...inp, marginBottom: 12 }} />
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onSave} disabled={!form.name || saving}
            style={{ padding: '9px 18px', borderRadius: 999, background: T.oceanDeep, color: T.cream, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer', opacity: (!form.name || saving) ? 0.5 : 1 }}>
            {saving ? 'Saving…' : 'Save listing'}
          </button>
          <button onClick={onCancel} style={{ padding: '9px 14px', borderRadius: 999, background: 'transparent', border: `1px solid ${T.line}`, fontSize: 13, cursor: 'pointer', color: T.muted }}>Cancel</button>
        </div>
      </div>
    );
  }

  const grouped = GUIDE_CATEGORIES.map(cat => ({
    ...cat,
    items: property.guideItems.filter(i => i.category === cat.value),
  })).filter(g => g.items.length > 0 || (adding && form.category === g.value));

  return (
    <div>
      <PageHeader
        eyebrow="Guest guide"
        title="Sarah's shortlist — the version your guests see."
        sub="Curate the local picks that show up in the guest companion app."
        action={
          !adding && !editing
            ? <button onClick={() => { setAdding(true); setForm(EMPTY); }} style={{ padding: '9px 16px', borderRadius: 999, background: T.oceanDeep, color: T.cream, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer' }}>+ Add listing</button>
            : null
        }
      />

      {adding && <InlineForm onSave={() => handleSave()} onCancel={() => setAdding(false)} />}

      {property.guideItems.length === 0 && !adding ? (
        <div style={{ padding: '48px 24px', borderRadius: 14, border: `1.5px dashed ${T.line}`, textAlign: 'center' }}>
          <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 20, fontWeight: 500, color: T.oceanDeep, marginBottom: 6 }}>No guide listings yet</div>
          <div style={{ fontSize: 13, color: T.muted }}>Add your local favorites — restaurants, beaches, activities. Guests see these in their companion app.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {GUIDE_CATEGORIES.map(cat => {
            const items = property.guideItems.filter(i => i.category === cat.value);
            if (items.length === 0) return null;
            return (
              <div key={cat.value}>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: T.muted, marginBottom: 10 }}>
                  {cat.emoji} {cat.label}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {items.map(item =>
                    editing === item.id ? (
                      <div key={item.id}><InlineForm onSave={() => handleSave(item.id)} onCancel={() => setEditing(null)} /></div>
                    ) : (
                      <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 14, alignItems: 'center', padding: '14px 16px', borderRadius: 12, background: T.cream, border: `1px solid ${T.line}` }}>
                        <div>
                          <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 16, fontWeight: 500, color: T.oceanDeep, letterSpacing: '-0.01em' }}>{item.name}</div>
                          {item.description && <div style={{ fontSize: 12.5, color: T.muted, marginTop: 3, lineHeight: 1.5 }}>{item.description}</div>}
                          {item.websiteUrl && (
                            <a href={item.websiteUrl} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: T.ocean, marginTop: 4, display: 'inline-block', textDecoration: 'none' }}>
                              {item.websiteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')} →
                            </a>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => startEdit(item)} style={{ padding: '7px 12px', borderRadius: 8, background: T.bg, border: `1px solid ${T.line}`, fontSize: 12, fontWeight: 600, cursor: 'pointer', color: T.ink }}>Edit</button>
                          <button onClick={() => handleDelete(item.id)} style={{ padding: '7px 10px', borderRadius: 8, fontSize: 12, color: T.muted, background: 'transparent', border: `1px solid ${T.line}`, cursor: 'pointer' }}>✕</button>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
