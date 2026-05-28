import { useState, useEffect, FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGuest } from '../GuestContext';
import { get, post, del } from '../../../lib/api';
import { CATEGORIES, categoryEmoji } from '../types';
import type { GroupEvent } from '../types';

const T = {
  oceanDeep: '#0a3457', ocean: '#0f4c75', seafoam: '#56cfe1',
  cream: '#fbf7ee', bg: '#fbf7ee', muted: '#5b6b7a', ink: '#0a1f33',
  line: 'rgba(15,76,117,0.12)', sandWarm: '#f7e6c9',
};

const inp = { borderRadius: 10, border: `1px solid ${T.line}`, background: T.cream, padding: '10px 12px', fontSize: 14, fontFamily: 'inherit', outline: 'none', width: '100%' } as const;

function getDays(start: string, end: string): Date[] {
  const days: Date[] = [];
  const cur = new Date(start); cur.setHours(0,0,0,0);
  const last = new Date(end); last.setHours(0,0,0,0);
  while (cur <= last) { days.push(new Date(cur)); cur.setDate(cur.getDate() + 1); }
  return days;
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function dayAbbr(d: Date) {
  return d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
}

function fmtTime(datetime: string) {
  return new Date(datetime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

const EMPTY = { title: '', time: '12:00', category: 'dining', notes: '', link: '' };

export function PlannerTab() {
  const { token } = useParams<{ token: string }>();
  const { booking, planner } = useGuest();
  const [events, setEvents] = useState<GroupEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [addingForDay, setAddingForDay] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!token) return;
    get<GroupEvent[]>(`/api/renter/${token}/events`).then(setEvents).finally(() => setLoadingEvents(false));
  }, [token]);

  if (!booking) return null;

  const days = getDays(booking.startDate, booking.endDate);

  async function handleAdd(e: FormEvent, day: Date) {
    e.preventDefault();
    if (!planner || !token) return;
    setSaving(true);
    try {
      const [h, m] = form.time.split(':');
      const dt = new Date(day); dt.setHours(Number(h), Number(m), 0, 0);
      const ev = await post<GroupEvent>(`/api/renter/${token}/events`, {
        title: form.title, datetime: dt.toISOString(), category: form.category,
        notes: form.notes || undefined, link: form.link || undefined,
      }, planner.token);
      setEvents(prev => [...prev, ev].sort((a, b) => a.datetime.localeCompare(b.datetime)));
      setAddingForDay(null); setForm(EMPTY);
    } catch (err) { alert(err instanceof Error ? err.message : 'Failed to save'); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!planner || !token) return;
    if (!confirm('Remove this event?')) return;
    await del(`/api/renter/${token}/events/${id}`, planner.token);
    setEvents(prev => prev.filter(e => e.id !== id));
  }

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: T.ocean, marginBottom: 6 }}>Trip planner</div>
        <h2 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 28, fontWeight: 500, letterSpacing: '-0.02em', color: T.oceanDeep, margin: '0 0 4px' }}>
          Trip plan · {days.length} {days.length === 1 ? 'day' : 'days'}
        </h2>
        <p style={{ fontSize: 13.5, color: T.muted }}>
          {planner ? `Planning as ${planner.name} — tap + to add activities.` : 'Your group itinerary. Trip Planners can add events.'}
        </p>
      </div>

      {!planner && (
        <div style={{ padding: 14, borderRadius: 12, background: `rgba(15,76,117,0.06)`, border: `1px solid ${T.line}`, marginBottom: 16, fontSize: 13, color: T.muted }}>
          🔐 Sign in as a Trip Planner (top of screen) to add events.
        </div>
      )}

      {loadingEvents ? (
        <div style={{ padding: '32px 0', display: 'flex', justifyContent: 'center', gap: 6 }}>
          {[0,1,2].map(i => (
            <motion.div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: T.seafoam }}
              animate={{ scale: [1,1.4,1], opacity: [0.4,1,0.4] }}
              transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2 }} />
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {days.map((day, i) => {
            const dayKey = day.toISOString().slice(0, 10);
            const dayEvents = events.filter(ev => isSameDay(new Date(ev.datetime), day));
            const isAdding = addingForDay === dayKey;
            const isToday = isSameDay(day, new Date());

            return (
              <div key={dayKey}>
                {/* Day header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${T.line}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, textAlign: 'center', fontFamily: 'ui-monospace, monospace', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.05em', color: isToday ? T.seafoam : T.ocean }}>
                      {dayAbbr(day)}
                    </div>
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 600, color: T.oceanDeep }}>
                        {day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        {isToday && <span style={{ marginLeft: 6, fontSize: 10, fontWeight: 700, color: T.seafoam, letterSpacing: '0.05em' }}>TODAY</span>}
                      </div>
                      <div style={{ fontSize: 11, color: T.muted }}>Day {i + 1}</div>
                    </div>
                  </div>
                  {planner && !isAdding && (
                    <button onClick={() => { setAddingForDay(dayKey); setForm(EMPTY); }}
                      style={{ padding: '5px 12px', borderRadius: 999, background: 'rgba(15,76,117,0.08)', color: T.ocean, fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer' }}>
                      + Add
                    </button>
                  )}
                </div>

                {/* Events */}
                <AnimatePresence>
                  {dayEvents.map(ev => (
                    <motion.div key={ev.id} layout initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: `1px solid ${T.line}` }}>
                      <div style={{ width: 36, textAlign: 'center', fontFamily: 'ui-monospace, monospace', fontSize: 10, fontWeight: 700, color: T.ocean, paddingTop: 2, flexShrink: 0 }}>
                        {fmtTime(ev.datetime).replace(' ', '\n').split('\n')[0]}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 14 }}>{categoryEmoji(ev.category)}</span>
                          <span style={{ fontSize: 13.5, fontWeight: 600, color: T.ink }}>{ev.title}</span>
                        </div>
                        {ev.notes && <div style={{ fontSize: 12, color: T.muted, marginTop: 3 }}>{ev.notes}</div>}
                        {ev.link && <a href={ev.link} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: T.ocean, marginTop: 3, display: 'inline-block', textDecoration: 'none' }}>Website →</a>}
                        <div style={{ fontSize: 11, color: T.muted, marginTop: 3, fontFamily: 'ui-monospace, monospace' }}>{fmtTime(ev.datetime)}</div>
                      </div>
                      {planner && (
                        <button onClick={() => handleDelete(ev.id)} style={{ color: T.muted, background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, lineHeight: 1, paddingTop: 2 }}>×</button>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Add form */}
                <AnimatePresence>
                  {isAdding && (
                    <motion.form onSubmit={e => handleAdd(e, day)} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      style={{ padding: '14px 0 14px 0', borderBottom: `1px solid ${T.line}` }}>
                      <div style={{ marginBottom: 10 }}>
                        <input placeholder="What's happening? *" required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} style={inp} />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
                        <input type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} style={inp} />
                        <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} style={inp}>
                          {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>)}
                        </select>
                      </div>
                      <input placeholder="Notes (optional)" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} style={{ ...inp, marginBottom: 10 }} />
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button type="submit" disabled={!form.title || saving}
                          style={{ padding: '9px 18px', borderRadius: 999, background: T.oceanDeep, color: T.cream, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer', opacity: (!form.title || saving) ? 0.5 : 1 }}>
                          {saving ? 'Saving…' : 'Add event'}
                        </button>
                        <button type="button" onClick={() => setAddingForDay(null)}
                          style={{ padding: '9px 14px', borderRadius: 999, background: 'transparent', border: `1px solid ${T.line}`, fontSize: 13, cursor: 'pointer', color: T.muted }}>
                          Cancel
                        </button>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>

                {dayEvents.length === 0 && !isAdding && (
                  <div style={{ padding: '12px 0', fontSize: 12.5, color: T.muted, fontStyle: 'italic', borderBottom: `1px solid ${T.line}` }}>
                    Nothing planned yet{planner ? ' — tap + to add' : ''}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
