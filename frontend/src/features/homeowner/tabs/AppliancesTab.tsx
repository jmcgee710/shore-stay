import { useState } from 'react';
import { useApi } from '../../../hooks/useApi';
import type { PropertyFull, Appliance } from '../types';
import { PageHeader } from '../PropertyDetail';

interface Props { property: PropertyFull; refetch: () => void; }

const T = {
  oceanDeep: '#0a3457', ocean: '#0f4c75', cream: '#fbf7ee', bg: '#fbf7ee',
  muted: '#5b6b7a', ink: '#0a1f33', line: 'rgba(15,76,117,0.12)',
  coral: 'oklch(0.74 0.13 38)', green: '#5a8a5e',
};

const EMPTY = { name: '', make: '', model: '', purchaseDate: '', maintenanceNotes: '' };
type FS = typeof EMPTY;
const inp = { borderRadius: 10, border: `1px solid ${T.line}`, background: T.cream, padding: '10px 12px', fontSize: 14, fontFamily: 'inherit', outline: 'none', width: '100%' } as const;

function warrantyStatus(a: Appliance) {
  if (!a.purchaseDate) return { label: '—', warn: false };
  const years = (Date.now() - new Date(a.purchaseDate).getTime()) / (1000 * 60 * 60 * 24 * 365);
  if (years > 10) return { label: 'Likely expired', warn: true };
  return { label: `${Math.round(years * 10) / 10} yrs old`, warn: false };
}

export function AppliancesTab({ property, refetch }: Props) {
  const api = useApi();
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<FS>(EMPTY);
  const [saving, setSaving] = useState(false);

  function set(field: keyof FS, value: string) { setForm(f => ({ ...f, [field]: value })); }

  async function handleSave(id?: string) {
    setSaving(true);
    const path = id ? `/api/homeowner/properties/${property.id}/appliances/${id}` : `/api/homeowner/properties/${property.id}/appliances`;
    const data = { ...form, purchaseDate: form.purchaseDate || undefined };
    id ? await api.put(path, data) : await api.post(path, data);
    await refetch(); setSaving(false); setAdding(false); setEditing(null); setForm(EMPTY);
  }

  async function handleDelete(id: string) {
    if (!confirm('Remove this appliance?')) return;
    await api.del(`/api/homeowner/properties/${property.id}/appliances/${id}`);
    refetch();
  }

  function startEdit(a: Appliance) {
    setEditing(a.id);
    setForm({ name: a.name, make: a.make ?? '', model: a.model ?? '', purchaseDate: a.purchaseDate ? a.purchaseDate.slice(0, 10) : '', maintenanceNotes: a.maintenanceNotes ?? '' });
    setAdding(false);
  }

  function InlineForm({ onSave, onCancel }: { onSave: () => void; onCancel: () => void }) {
    return (
      <div style={{ padding: 20, borderRadius: 14, background: T.cream, border: `1px solid ${T.line}`, marginBottom: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 10 }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <input placeholder="Appliance name *" value={form.name} onChange={e => set('name', e.target.value)} style={inp} />
          </div>
          <input placeholder="Make (e.g. LG)" value={form.make} onChange={e => set('make', e.target.value)} style={inp} />
          <input placeholder="Model" value={form.model} onChange={e => set('model', e.target.value)} style={inp} />
          <input type="date" value={form.purchaseDate} onChange={e => set('purchaseDate', e.target.value)} style={inp} />
        </div>
        <textarea placeholder="Maintenance notes (optional)" rows={2} value={form.maintenanceNotes} onChange={e => set('maintenanceNotes', e.target.value)}
          style={{ ...inp, resize: 'none', marginBottom: 12, display: 'block' }} />
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onSave} disabled={!form.name || saving}
            style={{ padding: '9px 18px', borderRadius: 999, background: T.oceanDeep, color: T.cream, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer', opacity: (!form.name || saving) ? 0.5 : 1 }}>
            {saving ? 'Saving…' : 'Save appliance'}
          </button>
          <button onClick={onCancel} style={{ padding: '9px 14px', borderRadius: 999, background: 'transparent', border: `1px solid ${T.line}`, fontSize: 13, cursor: 'pointer', color: T.muted }}>Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow="Appliances"
        title="Tracked, warrantied, and serviced."
        action={
          !adding && !editing
            ? <button onClick={() => { setAdding(true); setForm(EMPTY); }} style={{ padding: '9px 16px', borderRadius: 999, background: T.oceanDeep, color: T.cream, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer' }}>+ Add appliance</button>
            : null
        }
      />

      {adding && <InlineForm onSave={() => handleSave()} onCancel={() => setAdding(false)} />}

      {property.appliances.length === 0 && !adding ? (
        <div style={{ padding: '48px 24px', borderRadius: 14, border: `1.5px dashed ${T.line}`, textAlign: 'center' }}>
          <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 20, fontWeight: 500, color: T.oceanDeep, marginBottom: 6 }}>No appliances tracked</div>
          <div style={{ fontSize: 13, color: T.muted }}>Add appliances to track warranties, service dates, and maintenance notes.</div>
        </div>
      ) : (
        <div style={{ background: T.cream, borderRadius: 14, border: `1px solid ${T.line}`, overflow: 'hidden' }}>
          {/* Header */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 180px 180px auto', gap: 14, padding: '12px 16px', borderBottom: `1px solid ${T.line}` }}>
            {['Appliance', 'Age / warranty', 'Last service', ''].map((h, i) => (
              <div key={i} style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: T.muted }}>{h}</div>
            ))}
          </div>

          {property.appliances.map((a, i) => {
            const w = warrantyStatus(a);
            return editing === a.id ? (
              <div key={a.id}>
                <InlineForm onSave={() => handleSave(a.id)} onCancel={() => setEditing(null)} />
              </div>
            ) : (
              <div key={a.id} style={{ display: 'grid', gridTemplateColumns: '1fr 180px 180px auto', gap: 14, padding: '14px 16px', alignItems: 'center', borderBottom: i < property.appliances.length - 1 ? `1px solid ${T.line}` : 'none' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: T.oceanDeep }}>{a.name}</div>
                  {(a.make || a.model) && <div style={{ fontSize: 11.5, color: T.muted, marginTop: 2 }}>{[a.make, a.model].filter(Boolean).join(' · ')}</div>}
                  {a.maintenanceNotes && <div style={{ fontSize: 11.5, color: T.muted, marginTop: 3, fontStyle: 'italic' }}>{a.maintenanceNotes}</div>}
                </div>
                <div style={{ fontSize: 12.5, color: w.warn ? T.coral : T.muted }}>{w.label}</div>
                <div style={{ fontSize: 12.5, color: T.muted }}>
                  {a.purchaseDate ? new Date(a.purchaseDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => startEdit(a)} style={{ padding: '6px 10px', borderRadius: 6, fontSize: 11.5, fontWeight: 600, background: T.bg, border: `1px solid ${T.line}`, cursor: 'pointer', color: T.ink }}>Edit</button>
                  <button onClick={() => handleDelete(a.id)} style={{ padding: '6px 10px', borderRadius: 6, fontSize: 11.5, color: T.muted, background: 'transparent', border: `1px solid ${T.line}`, cursor: 'pointer' }}>✕</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
