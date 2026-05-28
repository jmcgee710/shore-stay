import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useApi } from '../../../hooks/useApi';
import type { PropertyFull, Booking } from '../types';
import { PageHeader, FakeQR, DashIcon } from '../PropertyDetail';

interface Props { property: PropertyFull; refetch: () => void; }

const T = {
  oceanDeep: '#0a3457', ocean: '#0f4c75', seafoam: '#56cfe1',
  cream: '#fbf7ee', bg: '#fbf7ee', muted: '#5b6b7a', ink: '#0a1f33',
  line: 'rgba(15,76,117,0.12)', green: '#5a8a5e', coral: 'oklch(0.74 0.13 38)',
  sandWarm: '#f7e6c9', wave: '#1565a0',
};

const EMPTY_FORM = {
  startDate: '', endDate: '',
  planners: [{ name: '', pin: '' }] as { name: string; pin: string }[],
};

function fmt(s: string) {
  return new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function fmtShort(s: string) {
  const d = new Date(s);
  return `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
}

function bookingStatus(b: Booking) {
  const now = new Date();
  if (new Date(b.startDate) <= now && now <= new Date(b.endDate)) return 'active';
  if (new Date(b.endDate) < now) return 'checkout';
  return 'upcoming';
}

// ── QR Modal ──────────────────────────────────────────────────────────────────
function QrModal({ booking, onClose }: { booking: Booking; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const url = `${window.location.origin}/stay/${booking.qrCodeToken}`;
  const shortUrl = `shorestay.app/stay/${booking.qrCodeToken}`;
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(10,52,87,0.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <motion.div onClick={e => e.stopPropagation()} initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        style={{ width: 520, background: T.bg, borderRadius: 20, padding: 28, boxShadow: '0 30px 80px rgba(0,0,0,0.4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: T.ocean }}>Guest QR</div>
          <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: '50%', background: T.cream, border: 'none', color: T.muted, fontSize: 18, lineHeight: 1, cursor: 'pointer' }}>×</button>
        </div>
        <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 28, fontWeight: 500, color: T.oceanDeep, letterSpacing: '-0.02em', marginBottom: 4 }}>
          {fmtShort(booking.startDate)} – {fmtShort(booking.endDate)}
        </div>
        <div style={{ fontSize: 13, color: T.muted, marginBottom: 22 }}>
          {booking.tripPlanners.length > 0 ? `Planners: ${booking.tripPlanners.map(p => p.name).join(', ')}` : 'No trip planners'}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 22, alignItems: 'center', padding: 22, borderRadius: 14, background: T.cream, border: `1px solid ${T.line}` }}>
          <FakeQR size={170} />
          <div>
            <div style={{ fontSize: 11, color: T.muted, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Stay link</div>
            <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: 12, color: T.ocean, marginTop: 6, lineHeight: 1.6, wordBreak: 'break-all' }}>{shortUrl}</div>
            {booking.tripPlanners.length > 0 && (
              <>
                <div style={{ fontSize: 11, color: T.muted, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 14 }}>Trip planner PIN</div>
                <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: 24, fontWeight: 600, color: T.oceanDeep, letterSpacing: '0.2em', marginTop: 4 }}>1234</div>
              </>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
          <button style={{ flex: 1, padding: 12, borderRadius: 10, background: T.cream, border: `1px solid ${T.line}`, fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}>Print sheet</button>
          <button onClick={() => { navigator.clipboard?.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
            style={{ flex: 1, padding: 12, borderRadius: 10, background: T.cream, border: `1px solid ${T.line}`, fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}>
            {copied ? 'Copied ✓' : 'Copy link'}
          </button>
          <button onClick={onClose} style={{ flex: 1, padding: 12, borderRadius: 10, background: T.oceanDeep, color: T.cream, fontSize: 13.5, fontWeight: 600, border: 'none', cursor: 'pointer' }}>Done</button>
        </div>
      </motion.div>
    </div>
  );
}

// ── New booking form ───────────────────────────────────────────────────────────
function NewBookingForm({ propertyId, onSave, onCancel }: { propertyId: string; onSave: (b: Booking) => void; onCancel: () => void }) {
  const api = useApi();
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  async function handleCreate() {
    setSaving(true);
    try {
      const planners = form.planners.filter(p => p.name && p.pin.length === 4);
      const b = await api.post<Booking>(`/api/homeowner/properties/${propertyId}/bookings`, {
        startDate: new Date(form.startDate).toISOString(),
        endDate: new Date(form.endDate + 'T23:59:59').toISOString(),
        planners,
      });
      onSave(b);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create booking');
    } finally { setSaving(false); }
  }

  function setPlanner(i: number, field: 'name' | 'pin', value: string) {
    setForm(f => {
      const planners = [...f.planners];
      planners[i] = { ...planners[i], [field]: field === 'pin' ? value.replace(/\D/g, '').slice(0, 4) : value };
      return { ...f, planners };
    });
  }

  const inp = { borderRadius: 10, border: `1px solid ${T.line}`, background: T.cream, padding: '10px 12px', fontSize: 14, fontFamily: 'inherit', outline: 'none', width: '100%' } as const;

  return (
    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      style={{ padding: 22, borderRadius: 14, background: T.cream, border: `1px solid ${T.line}`, marginBottom: 24 }}>
      <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 22, fontWeight: 500, color: T.oceanDeep, letterSpacing: '-0.02em', marginBottom: 18 }}>New booking</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: T.muted, marginBottom: 6 }}>Check-in</div>
          <input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} style={inp} />
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: T.muted, marginBottom: 6 }}>Check-out</div>
          <input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} style={inp} />
        </div>
      </div>
      <div style={{ marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: T.muted }}>Trip planners (optional · max 2)</div>
          {form.planners.length < 2 && <button onClick={() => setForm(f => ({ ...f, planners: [...f.planners, { name: '', pin: '' }] }))} style={{ fontSize: 12, fontWeight: 600, color: T.ocean, background: 'none', border: 'none', cursor: 'pointer' }}>+ Add planner</button>}
        </div>
        {form.planners.map((p, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 140px', gap: 8, marginBottom: 8 }}>
            <input placeholder="Name" value={p.name} onChange={e => setPlanner(i, 'name', e.target.value)} style={inp} />
            <input placeholder="4-digit PIN" inputMode="numeric" value={p.pin} onChange={e => setPlanner(i, 'pin', e.target.value)} style={{ ...inp, textAlign: 'center', letterSpacing: '0.25em', fontFamily: 'ui-monospace, monospace' }} />
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={handleCreate} disabled={!form.startDate || !form.endDate || saving}
          style={{ padding: '11px 20px', borderRadius: 999, background: T.oceanDeep, color: T.cream, fontSize: 13.5, fontWeight: 600, border: 'none', cursor: 'pointer', opacity: (!form.startDate || !form.endDate || saving) ? 0.5 : 1 }}>
          {saving ? 'Creating…' : 'Create & get QR'}
        </button>
        <button onClick={onCancel} style={{ padding: '11px 16px', borderRadius: 999, background: 'transparent', border: `1px solid ${T.line}`, fontSize: 13, fontWeight: 500, cursor: 'pointer', color: T.muted }}>Cancel</button>
      </div>
    </motion.div>
  );
}

// ── Main tab ──────────────────────────────────────────────────────────────────
export function BookingsTab({ property, refetch }: Props) {
  const api = useApi();
  const [showForm, setShowForm] = useState(false);
  const [qrBooking, setQrBooking] = useState<Booking | null>(null);

  async function handleDelete(bookingId: string) {
    if (!confirm('Delete this booking?')) return;
    await api.del(`/api/homeowner/properties/${property.id}/bookings/${bookingId}`);
    refetch();
  }

  const sorted = [...property.bookings].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  const upcoming = sorted.filter(b => new Date(b.endDate) >= new Date());

  return (
    <div>
      <PageHeader
        eyebrow="Bookings"
        title="Bookings & turn days"
        sub="Every check-in for this property — click a booking to see the QR code."
        action={
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setShowForm(true)} style={{ padding: '9px 16px', borderRadius: 999, background: T.oceanDeep, color: T.cream, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer' }}>
              + New booking
            </button>
          </div>
        }
      />

      <AnimatePresence>
        {showForm && (
          <NewBookingForm
            propertyId={property.id}
            onSave={(b) => { refetch(); setQrBooking(b); setShowForm(false); }}
            onCancel={() => setShowForm(false)}
          />
        )}
      </AnimatePresence>

      {/* Upcoming bookings */}
      {upcoming.length === 0 && !showForm ? (
        <div style={{ padding: '48px 24px', borderRadius: 14, border: `1.5px dashed ${T.line}`, textAlign: 'center' }}>
          <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 20, fontWeight: 500, color: T.oceanDeep, marginBottom: 6 }}>No upcoming bookings</div>
          <div style={{ fontSize: 13, color: T.muted }}>Add your first booking to generate a guest QR code.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {sorted.map(b => {
            const status = bookingStatus(b);
            const statusColor = status === 'active' ? T.green : status === 'checkout' ? T.coral : T.ocean;
            const statusLabel = { active: 'CHECKED IN', upcoming: 'UPCOMING', checkout: 'CHECKED OUT' }[status];
            return (
              <div key={b.id} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto auto auto', gap: 16, alignItems: 'center', padding: 16, borderRadius: 12, background: T.cream, border: `1px solid ${T.line}` }}>
                <div style={{ width: 6, height: 44, borderRadius: 3, background: statusColor }} />
                <div>
                  <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 18, fontWeight: 500, color: T.oceanDeep, letterSpacing: '-0.01em' }}>
                    {fmt(b.startDate)} – {fmt(b.endDate)}
                  </div>
                  <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>
                    {b.tripPlanners.length > 0 ? `Planners: ${b.tripPlanners.map(p => p.name).join(', ')}` : 'No trip planners assigned'}
                    {' · '}
                    <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 11 }}>{b.qrCodeToken}</span>
                  </div>
                </div>
                <span style={{ padding: '4px 9px', borderRadius: 6, fontSize: 10, fontWeight: 700, letterSpacing: '0.05em', background: `color-mix(in oklab, ${statusColor} 18%, transparent)`, color: statusColor }}>
                  {statusLabel}
                </span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => setQrBooking(b)} style={{ padding: '8px 14px', borderRadius: 8, background: T.oceanDeep, color: T.cream, fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <DashIcon.qr style={{ width: 13, height: 13 }} /> QR
                  </button>
                  <a href={`${window.location.origin}/stay/${b.qrCodeToken}`} target="_blank" rel="noopener noreferrer" style={{ padding: '8px 12px', borderRadius: 8, background: T.bg, border: `1px solid ${T.line}`, fontSize: 12, fontWeight: 600, color: T.ink, textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
                    Preview
                  </a>
                  <button onClick={() => handleDelete(b.id)} style={{ padding: '8px 12px', borderRadius: 8, background: 'transparent', border: `1px solid ${T.line}`, fontSize: 12, color: T.muted, cursor: 'pointer' }}>
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {qrBooking && <QrModal booking={qrBooking} onClose={() => setQrBooking(null)} />}
    </div>
  );
}
