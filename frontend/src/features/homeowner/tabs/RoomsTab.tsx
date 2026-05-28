import { useState } from 'react';
import { useApi } from '../../../hooks/useApi';
import type { PropertyFull, Room } from '../types';
import { ROOM_TYPES } from '../types';
import { PageHeader, DashIcon } from '../PropertyDetail';

interface Props { property: PropertyFull; refetch: () => void; }

const T = {
  oceanDeep: '#0a3457', ocean: '#0f4c75', seafoam: '#56cfe1',
  cream: '#fbf7ee', bg: '#fbf7ee', muted: '#5b6b7a', ink: '#0a1f33',
  line: 'rgba(15,76,117,0.12)', seafoamSoft: '#a8e3ec', sandWarm: '#f7e6c9',
};

const TYPE_LABELS: Record<string, string> = {
  bedroom: 'Bedroom', bathroom: 'Bath', common: 'Common area', outdoor: 'Outdoor',
};

const EMPTY = { name: '', type: 'bedroom', description: '' };
const inp = { borderRadius: 10, border: `1px solid ${T.line}`, background: T.cream, padding: '10px 12px', fontSize: 14, fontFamily: 'inherit', outline: 'none', width: '100%' } as const;

export function RoomsTab({ property, refetch }: Props) {
  const api = useApi();
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState<Room | null>(null);
  const [saving, setSaving] = useState(false);

  function set(field: keyof typeof EMPTY, value: string) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function handleAdd() {
    setSaving(true);
    await api.post(`/api/homeowner/properties/${property.id}/rooms`, form);
    await refetch(); setSaving(false); setAdding(false); setForm(EMPTY);
  }

  async function handleEdit() {
    if (!editing) return;
    setSaving(true);
    await api.put(`/api/homeowner/properties/${property.id}/rooms/${editing.id}`, form);
    await refetch(); setSaving(false); setEditing(null);
  }

  async function handleDelete(id: string) {
    if (!confirm('Remove this room?')) return;
    await api.del(`/api/homeowner/properties/${property.id}/rooms/${id}`);
    refetch();
  }

  function startEdit(room: Room) {
    setEditing(room);
    setForm({ name: room.name, type: room.type, description: room.description ?? '' });
    setAdding(false);
  }

  function InlineForm({ onSave, onCancel }: { onSave: () => void; onCancel: () => void }) {
    return (
      <div style={{ padding: 20, borderRadius: 14, background: T.cream, border: `1px solid ${T.line}`, marginBottom: 10 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px', gap: 10, marginBottom: 10 }}>
          <input placeholder="Room name *" value={form.name} onChange={e => set('name', e.target.value)} style={inp} />
          <select value={form.type} onChange={e => set('type', e.target.value)} style={inp}>
            {ROOM_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <input placeholder="Description (optional)" value={form.description} onChange={e => set('description', e.target.value)} style={{ ...inp, marginBottom: 12 }} />
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onSave} disabled={!form.name || saving}
            style={{ padding: '9px 18px', borderRadius: 999, background: T.oceanDeep, color: T.cream, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer', opacity: (!form.name || saving) ? 0.5 : 1 }}>
            {saving ? 'Saving…' : 'Save room'}
          </button>
          <button onClick={onCancel} style={{ padding: '9px 14px', borderRadius: 999, background: 'transparent', border: `1px solid ${T.line}`, fontSize: 13, cursor: 'pointer', color: T.muted }}>Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow="Rooms"
        title="The house, room by room."
        sub="What guests see in their companion app. Drag to reorder."
        action={
          !adding && !editing
            ? <button onClick={() => { setAdding(true); setForm(EMPTY); }} style={{ padding: '9px 16px', borderRadius: 999, background: T.oceanDeep, color: T.cream, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer' }}>+ Add room</button>
            : null
        }
      />

      {adding && <InlineForm onSave={handleAdd} onCancel={() => setAdding(false)} />}

      {property.rooms.length === 0 && !adding ? (
        <div style={{ padding: '48px 24px', borderRadius: 14, border: `1.5px dashed ${T.line}`, textAlign: 'center' }}>
          <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 20, fontWeight: 500, color: T.oceanDeep, marginBottom: 6 }}>No rooms yet</div>
          <div style={{ fontSize: 13, color: T.muted }}>Add your rooms so guests can see the layout in the companion app.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          {property.rooms.map((room, i) =>
            editing?.id === room.id ? (
              <div key={room.id} style={{ gridColumn: '1 / -1' }}>
                <InlineForm onSave={handleEdit} onCancel={() => setEditing(null)} />
              </div>
            ) : (
              <div key={room.id} style={{ padding: 16, borderRadius: 12, background: T.cream, border: `1px solid ${T.line}`, display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 14, alignItems: 'center' }}>
                <div style={{ width: 56, height: 56, borderRadius: 10, background: `repeating-linear-gradient(${i*30+25}deg, ${T.seafoamSoft} 0 6px, ${T.sandWarm} 6px 12px)`, opacity: 0.75 }} />
                <div>
                  <div style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.muted }}>{TYPE_LABELS[room.type] ?? room.type}</div>
                  <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 17, fontWeight: 500, color: T.oceanDeep, letterSpacing: '-0.01em', marginTop: 2 }}>{room.name}</div>
                  {room.description && <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>{room.description}</div>}
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => startEdit(room)} style={{ padding: '7px 12px', borderRadius: 8, background: T.bg, border: `1px solid ${T.line}`, fontSize: 12, fontWeight: 600, cursor: 'pointer', color: T.ink }}>Edit</button>
                  <button onClick={() => handleDelete(room.id)} style={{ padding: '7px 10px', borderRadius: 8, background: 'transparent', border: `1px solid ${T.line}`, fontSize: 12, color: T.muted, cursor: 'pointer' }}>✕</button>
                </div>
              </div>
            )
          )}

          {/* Add room card */}
          {!adding && !editing && (
            <button onClick={() => { setAdding(true); setForm(EMPTY); }}
              style={{ padding: 24, borderRadius: 12, border: `1.5px dashed ${T.line}`, background: 'transparent', color: T.muted, fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', minHeight: 88 }}>
              <DashIcon.compass style={{ width: 16, height: 16 }} /> Add a room
            </button>
          )}
        </div>
      )}
    </div>
  );
}
