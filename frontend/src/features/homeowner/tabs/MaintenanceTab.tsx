import { useState } from 'react';
import { useApi } from '../../../hooks/useApi';
import type { PropertyFull, MaintenanceTask } from '../types';
import { RECURRENCE_OPTIONS } from '../types';
import { PageHeader, DashIcon } from '../PropertyDetail';

interface Props { property: PropertyFull; refetch: () => void; }

const T = {
  oceanDeep: '#0a3457', ocean: '#0f4c75', seafoam: '#56cfe1',
  cream: '#fbf7ee', bg: '#fbf7ee', muted: '#5b6b7a', ink: '#0a1f33',
  line: 'rgba(15,76,117,0.12)', coral: 'oklch(0.74 0.13 38)', green: '#5a8a5e',
  seafoamSoft: '#a8e3ec',
};

const EMPTY = { title: '', dueDate: '', recurrence: '' };
const inp = { borderRadius: 10, border: `1px solid ${T.line}`, background: T.cream, padding: '10px 12px', fontSize: 14, fontFamily: 'inherit', outline: 'none', width: '100%' } as const;

function dueInfo(dateStr: string) {
  const d = new Date(dateStr);
  const diff = Math.ceil((d.getTime() - Date.now()) / 86400000);
  const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  if (diff < 0) return { label, color: T.coral, tag: 'Overdue' };
  if (diff <= 7) return { label, color: T.coral, tag: `In ${diff}d` };
  return { label, color: T.muted, tag: null };
}

export function MaintenanceTab({ property, refetch }: Props) {
  const api = useApi();
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  function set(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(f => ({ ...f, [field]: e.target.value }));
  }

  async function handleAdd() {
    setSaving(true);
    await api.post(`/api/homeowner/properties/${property.id}/maintenance`, {
      ...form, dueDate: new Date(form.dueDate).toISOString(), recurrence: form.recurrence || undefined,
    });
    await refetch(); setSaving(false); setAdding(false); setForm(EMPTY);
  }

  async function toggleComplete(task: MaintenanceTask) {
    await api.put(`/api/homeowner/properties/${property.id}/maintenance/${task.id}`, {
      completedAt: task.completedAt ? null : new Date().toISOString(),
    });
    refetch();
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this task?')) return;
    await api.del(`/api/homeowner/properties/${property.id}/maintenance/${id}`);
    refetch();
  }

  const pending = property.maintenanceTasks.filter(t => !t.completedAt);
  const done = property.maintenanceTasks.filter(t => t.completedAt);

  return (
    <div>
      <PageHeader
        eyebrow="Maintenance"
        title="A calmer kind of to-do list."
        action={
          !adding
            ? <button onClick={() => { setAdding(true); setForm(EMPTY); }} style={{ padding: '9px 16px', borderRadius: 999, background: T.oceanDeep, color: T.cream, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer' }}>+ Add task</button>
            : null
        }
      />

      {adding && (
        <div style={{ padding: 20, borderRadius: 14, background: T.cream, border: `1px solid ${T.line}`, marginBottom: 16 }}>
          <input placeholder="Task title *" value={form.title} onChange={set('title')} style={{ ...inp, marginBottom: 10 }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
            <input type="date" value={form.dueDate} onChange={set('dueDate')} style={inp} />
            <select value={form.recurrence} onChange={set('recurrence')} style={inp}>
              {RECURRENCE_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleAdd} disabled={!form.title || !form.dueDate || saving}
              style={{ padding: '9px 18px', borderRadius: 999, background: T.oceanDeep, color: T.cream, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer', opacity: (!form.title || !form.dueDate || saving) ? 0.5 : 1 }}>
              {saving ? 'Saving…' : 'Save task'}
            </button>
            <button onClick={() => setAdding(false)} style={{ padding: '9px 14px', borderRadius: 999, background: 'transparent', border: `1px solid ${T.line}`, fontSize: 13, cursor: 'pointer', color: T.muted }}>Cancel</button>
          </div>
        </div>
      )}

      {pending.length === 0 && !adding && (
        <div style={{ padding: '48px 24px', borderRadius: 14, border: `1.5px dashed ${T.line}`, textAlign: 'center' }}>
          <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 20, fontWeight: 500, color: T.oceanDeep, marginBottom: 6 }}>All clear</div>
          <div style={{ fontSize: 13, color: T.muted }}>No upcoming maintenance tasks.</div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {pending.map(task => {
          const due = dueInfo(task.dueDate);
          return (
            <div key={task.id} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto auto auto', gap: 14, padding: 14, alignItems: 'center', borderRadius: 12, background: T.cream, border: `1px solid ${T.line}` }}>
              <button onClick={() => toggleComplete(task)} style={{ width: 22, height: 22, borderRadius: 6, background: 'transparent', border: `1.5px solid ${T.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: T.oceanDeep }}>{task.title}</div>
                <div style={{ fontSize: 11.5, color: due.color, marginTop: 2 }}>
                  {task.recurrence && <span style={{ marginRight: 6 }}>{task.recurrence} ·</span>}
                  next {due.label}
                </div>
              </div>
              {due.tag && (
                <span style={{ padding: '3px 8px', borderRadius: 5, fontSize: 10, fontWeight: 700, letterSpacing: '0.05em', background: `color-mix(in oklab, ${T.coral} 18%, transparent)`, color: T.coral }}>
                  {due.tag.toUpperCase()}
                </span>
              )}
              {task.recurrence && (
                <span style={{ padding: '3px 8px', borderRadius: 5, fontSize: 10.5, fontWeight: 600, background: `color-mix(in oklab, ${T.seafoam} 18%, transparent)`, color: T.oceanDeep }}>
                  {task.recurrence}
                </span>
              )}
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => toggleComplete(task)} style={{ padding: '6px 10px', borderRadius: 6, background: T.oceanDeep, color: T.cream, fontSize: 11.5, fontWeight: 600, border: 'none', cursor: 'pointer' }}>
                  Mark done
                </button>
                <button onClick={() => handleDelete(task.id)} style={{ padding: '6px 10px', borderRadius: 6, fontSize: 11.5, color: T.muted, background: 'transparent', border: `1px solid ${T.line}`, cursor: 'pointer' }}>✕</button>
              </div>
            </div>
          );
        })}
      </div>

      {done.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: T.muted, marginBottom: 8 }}>
            Completed ({done.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {done.map(task => (
              <div key={task.id} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 14, padding: '12px 14px', alignItems: 'center', borderRadius: 12, background: T.bg, border: `1px solid ${T.line}` }}>
                <div style={{ width: 22, height: 22, borderRadius: 6, background: T.oceanDeep, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <DashIcon.check style={{ width: 13, height: 13, color: T.cream }} />
                </div>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: T.muted, textDecoration: 'line-through', textDecorationColor: T.muted }}>{task.title}</div>
                <button onClick={() => handleDelete(task.id)} style={{ fontSize: 11, color: T.muted, background: 'transparent', border: 'none', cursor: 'pointer' }}>✕</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
