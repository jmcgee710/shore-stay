import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useApi } from '../../../hooks/useApi';
import type { WatcherAssignment, WatchReport, StormAlert, ContractorDispatch } from '../../watcher/types';
import type { PropertyFull } from '../types';
import { PageHeader, DashIcon } from '../PropertyDetail';

interface Props { property: PropertyFull; refetch?: () => void; }

const T = {
  oceanDeep: '#0a3457', ocean: '#0f4c75', seafoam: '#56cfe1',
  cream: '#fbf7ee', bg: '#fbf7ee', muted: '#5b6b7a', ink: '#0a1f33',
  line: 'rgba(15,76,117,0.12)', green: '#5a8a5e', coral: 'oklch(0.74 0.13 38)',
  sandWarm: '#f7e6c9', sand: '#fef3e2',
};

function Toggle({ on }: { on: boolean }) {
  return (
    <div style={{ width: 32, height: 18, borderRadius: 9, background: on ? T.oceanDeep : T.line, padding: 2, position: 'relative', flexShrink: 0 }}>
      <div style={{ width: 14, height: 14, borderRadius: '50%', background: T.cream, position: 'absolute', top: 2, left: on ? 16 : 2, transition: 'left 150ms' }} />
    </div>
  );
}

function InviteModal({ propertyId, onClose }: { propertyId: string; onClose: () => void }) {
  const api = useApi();
  const [step, setStep] = useState(0);
  const [inviteUrl, setInviteUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);

  async function generate() {
    setGenerating(true);
    try {
      const data = await api.post<{ inviteUrl: string }>(`/api/watcher/properties/${propertyId}/invite`, {});
      setInviteUrl(data.inviteUrl);
      setStep(1);
    } catch { alert('Failed to generate invite'); }
    setGenerating(false);
  }

  const inp = { width: '100%', padding: '10px 12px', borderRadius: 10, border: `1px solid ${T.line}`, background: T.cream, fontSize: 14, fontFamily: 'inherit', outline: 'none' } as const;

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(10,52,87,0.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <motion.div onClick={e => e.stopPropagation()} initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        style={{ width: 480, background: T.bg, borderRadius: 20, padding: 28, boxShadow: '0 30px 80px rgba(0,0,0,0.4)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: T.ocean }}>Invite a watcher</div>
          <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: '50%', background: T.cream, border: 'none', color: T.muted, fontSize: 18, lineHeight: 1, cursor: 'pointer' }}>×</button>
        </div>
        <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 26, fontWeight: 500, color: T.oceanDeep, letterSpacing: '-0.02em', marginBottom: 22 }}>
          {step === 0 ? 'Send a one-time invite link.' : 'Link generated.'}
        </div>
        {step === 0 ? (
          <button onClick={generate} disabled={generating}
            style={{ width: '100%', padding: 13, borderRadius: 10, background: T.oceanDeep, color: T.cream, fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer', opacity: generating ? 0.6 : 1 }}>
            {generating ? 'Generating…' : 'Generate invite link'}
          </button>
        ) : (
          <div>
            <div style={{ padding: 14, borderRadius: 12, background: T.cream, border: `1px solid ${T.line}`, fontFamily: 'ui-monospace, monospace', fontSize: 11.5, color: T.ocean, wordBreak: 'break-all', lineHeight: 1.6 }}>
              {inviteUrl}
            </div>
            <div style={{ fontSize: 12, color: T.muted, marginTop: 10, lineHeight: 1.55 }}>
              Expires in 7 days. Send via text — they register, accept, and show up in your reports feed.
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
              <button onClick={() => { navigator.clipboard?.writeText(inviteUrl); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
                style={{ flex: 1, padding: 12, borderRadius: 10, background: T.cream, border: `1px solid ${T.line}`, fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}>
                {copied ? 'Copied ✓' : 'Copy link'}
              </button>
              <button onClick={onClose} style={{ flex: 1, padding: 12, borderRadius: 10, background: T.oceanDeep, color: T.cream, fontSize: 13.5, fontWeight: 600, border: 'none', cursor: 'pointer' }}>Done</button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export function WatchersTab({ property }: Props) {
  const api = useApi();
  const propertyId = property.id;
  const [assignments, setAssignments] = useState<WatcherAssignment[]>([]);
  const [reports, setReports] = useState<WatchReport[]>([]);
  const [alerts, setAlerts] = useState<StormAlert[]>([]);
  const [dispatches, setDispatches] = useState<ContractorDispatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);

  const load = useCallback(async () => {
    try {
      const [a, r, al, d] = await Promise.all([
        api.get<WatcherAssignment[]>(`/api/watcher/properties/${propertyId}/assignments`),
        api.get<WatchReport[]>(`/api/watcher/properties/${propertyId}/reports`),
        api.get<StormAlert[]>(`/api/watcher/properties/${propertyId}/alerts`),
        api.get<ContractorDispatch[]>(`/api/watcher/properties/${propertyId}/contractors`),
      ]);
      setAssignments(a); setReports(r); setAlerts(al); setDispatches(d);
    } catch {}
    setLoading(false);
  }, [propertyId]);

  useEffect(() => { load(); }, [load]);

  async function toggleHandsOff(assignment: WatcherAssignment) {
    const updated = await api.put<WatcherAssignment>(`/api/watcher/properties/${propertyId}/assignments/${assignment.id}`, { handsOffMode: !assignment.handsOffMode });
    setAssignments(prev => prev.map(a => a.id === updated.id ? updated : a));
  }

  async function removeWatcher(id: string) {
    if (!confirm('Remove this watcher?')) return;
    await api.del(`/api/watcher/properties/${propertyId}/assignments/${id}`);
    setAssignments(prev => prev.filter(a => a.id !== id));
  }

  async function approveAlert(alertId: string) {
    await api.put(`/api/watcher/alerts/${alertId}/approve`, {});
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, ownerApprovedAt: new Date().toISOString() } : a));
  }

  if (loading) return <div style={{ padding: '48px 0', textAlign: 'center', color: T.muted, fontSize: 14 }}>Loading watcher data…</div>;

  const handsOnCount = assignments.filter(a => a.handsOffMode).length;

  return (
    <div>
      <PageHeader
        eyebrow="Home Watch"
        title="Your eyes on the Island."
        sub="Local watchers run weekly walkthroughs, log storm damage, and dispatch contractors under your cap."
        action={<button onClick={() => setShowInvite(true)} style={{ padding: '9px 16px', borderRadius: 999, background: T.oceanDeep, color: T.cream, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer' }}>+ Invite a watcher</button>}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24 }}>
        {/* Left column */}
        <div>
          <h2 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 20, fontWeight: 500, letterSpacing: '-0.02em', color: T.oceanDeep, marginBottom: 12 }}>Your watchers</h2>
          {assignments.length === 0 ? (
            <div style={{ padding: '32px 20px', borderRadius: 14, border: `1.5px dashed ${T.line}`, textAlign: 'center' }}>
              <div style={{ fontSize: 13, color: T.muted }}>No watchers assigned yet.</div>
              <button onClick={() => setShowInvite(true)} style={{ marginTop: 12, padding: '8px 16px', borderRadius: 999, background: T.oceanDeep, color: T.cream, fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer' }}>+ Invite first watcher</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {assignments.map(a => (
                <div key={a.id} style={{ padding: 18, borderRadius: 14, background: T.cream, border: `1px solid ${T.line}` }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 14, alignItems: 'center' }}>
                    <div style={{ width: 48, height: 48, borderRadius: '50%', background: T.ocean, color: T.cream, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 600 }}>
                      {a.watcherId.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 18, fontWeight: 500, color: T.oceanDeep, letterSpacing: '-0.01em' }}>Watcher</div>
                      <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>
                        {a.inviteAccepted ? 'Active' : 'Invite pending'} · {reports.filter(r => r.watcherId === a.watcherId).length} reports
                      </div>
                    </div>
                    <button onClick={() => removeWatcher(a.id)} style={{ padding: '7px 12px', borderRadius: 8, background: T.bg, border: `1px solid ${T.line}`, fontSize: 12, fontWeight: 600, cursor: 'pointer', color: T.ink }}>Remove</button>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14, paddingTop: 14, borderTop: `1px solid ${T.line}` }}>
                    <span style={{ fontSize: 11.5, fontWeight: 600, color: T.muted, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Hands-off mode</span>
                    <button onClick={() => toggleHandsOff(a)} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer' }}>
                      <span style={{ fontSize: 12, color: T.muted }}>{a.handsOffMode ? 'ON' : 'OFF'}</span>
                      <Toggle on={a.handsOffMode} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Reports */}
          {reports.length > 0 && (
            <>
              <h2 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 20, fontWeight: 500, letterSpacing: '-0.02em', color: T.oceanDeep, marginTop: 28, marginBottom: 12 }}>Recent reports</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {reports.slice(0, 5).map(r => {
                  const condColor = r.overallCondition === 'good' ? T.green : r.overallCondition === 'needs_attention' ? T.coral : T.ocean;
                  return (
                    <div key={r.id} style={{ padding: 16, borderRadius: 12, background: T.cream, border: `1px solid ${T.line}` }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: T.oceanDeep }}>Watcher</span>
                        </div>
                        <span style={{ fontSize: 11.5, color: T.muted }}>{new Date(r.visitedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <span style={{ padding: '3px 9px', borderRadius: 5, fontSize: 10.5, fontWeight: 700, letterSpacing: '0.05em', background: `color-mix(in oklab, ${condColor} 18%, transparent)`, color: condColor }}>
                          {r.overallCondition.replace('_', ' ').toUpperCase()}
                        </span>
                        {r.photoUrls.length > 0 && <span style={{ fontSize: 11.5, color: T.muted }}>· {r.photoUrls.length} photos</span>}
                      </div>
                      <div style={{ fontSize: 13, color: T.ink, lineHeight: 1.55 }}>{r.summary}</div>
                      {/* Photo placeholders */}
                      {r.photoUrls.length > 0 && (
                        <div style={{ display: 'flex', gap: 5, marginTop: 10 }}>
                          {Array.from({ length: Math.min(r.photoUrls.length, 4) }).map((_, i) => (
                            <div key={i} style={{ width: 60, height: 44, borderRadius: 6, background: `repeating-linear-gradient(${i*30+25}deg, ${T.sandWarm} 0 6px, ${T.sand} 6px 12px)` }} />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Right column */}
        <div>
          {/* Hands-off summary card */}
          <div style={{ padding: 18, borderRadius: 14, background: T.oceanDeep, color: T.cream, marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', opacity: 0.7 }}>Hands-off mode</div>
              <span style={{ padding: '3px 8px', borderRadius: 5, fontSize: 9.5, fontWeight: 700, background: T.seafoam, color: T.oceanDeep }}>
                {handsOnCount} OF {assignments.length} ON
              </span>
            </div>
            <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 20, fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1.25, marginBottom: 10 }}>
              Watchers can dispatch contractors up to <span style={{ color: T.seafoam }}>$500</span> without waking you up.
            </div>
            <div style={{ fontSize: 12, opacity: 0.7, lineHeight: 1.55 }}>Larger jobs still need your green light. Cap is per-incident.</div>
          </div>

          {/* Pending approvals */}
          {alerts.filter(a => a.requiresOwnerApproval && !a.ownerApprovedAt).map(alert => (
            <div key={alert.id} style={{ padding: 16, borderRadius: 12, background: `color-mix(in oklab, ${T.coral} 10%, ${T.cream})`, border: `1px solid color-mix(in oklab, ${T.coral} 35%, transparent)`, marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ padding: '2px 7px', borderRadius: 5, fontSize: 9.5, fontWeight: 700, background: `color-mix(in oklab, ${T.coral} 22%, transparent)`, color: T.coral, letterSpacing: '0.05em' }}>NEEDS APPROVAL</span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: T.oceanDeep, marginBottom: 4 }}>{alert.alertType.replace('_', ' ')} · {alert.severity}</div>
              <div style={{ fontSize: 12.5, color: T.ink, lineHeight: 1.5 }}>{alert.description}</div>
              <button onClick={() => approveAlert(alert.id)} style={{ marginTop: 12, padding: '8px 16px', borderRadius: 8, background: T.oceanDeep, color: T.cream, fontSize: 12.5, fontWeight: 600, border: 'none', cursor: 'pointer' }}>
                Approve & dispatch
              </button>
            </div>
          ))}

          {/* Dispatches */}
          {dispatches.length > 0 && (
            <>
              <h2 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 18, fontWeight: 500, letterSpacing: '-0.02em', color: T.oceanDeep, marginBottom: 10 }}>Open dispatches</h2>
              {dispatches.slice(0, 4).map(d => {
                const color = d.status === 'approved' ? T.ocean : d.status === 'completed' ? T.green : T.coral;
                return (
                  <div key={d.id} style={{ padding: 14, borderRadius: 10, background: T.cream, border: `1px solid ${T.line}`, marginBottom: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: T.oceanDeep }}>{d.trade} · {d.contractorName}</div>
                      <span style={{ padding: '2px 7px', borderRadius: 5, fontSize: 9.5, fontWeight: 700, letterSpacing: '0.05em', background: `color-mix(in oklab, ${color} 18%, transparent)`, color }}>{d.status.toUpperCase()}</span>
                    </div>
                    <div style={{ fontSize: 11.5, color: T.muted }}>{d.workDescription}{d.estimatedCost ? ` · $${d.estimatedCost}` : ''}</div>
                  </div>
                );
              })}
            </>
          )}

          {/* Stats */}
          <div style={{ padding: 18, borderRadius: 14, background: T.cream, border: `1px solid ${T.line}`, marginTop: dispatches.length > 0 ? 22 : 0 }}>
            {[
              { label: 'Walkthroughs', value: String(reports.length) },
              { label: 'Storm alerts', value: String(alerts.length), sub: `${alerts.filter(a => a.resolvedAt).length} resolved` },
              { label: 'Dispatches', value: String(dispatches.length) },
            ].map((s, i) => (
              <div key={s.label}>
                {i > 0 && <div style={{ height: 1, background: T.line, margin: '12px 0' }} />}
                <div style={{ fontSize: 11, color: T.muted, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{s.label}</div>
                <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 22, fontWeight: 500, color: T.oceanDeep, marginTop: 2 }}>{s.value}</div>
                {s.sub && <div style={{ fontSize: 11.5, color: T.muted, marginTop: 2 }}>{s.sub}</div>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {showInvite && <InviteModal propertyId={propertyId} onClose={() => { setShowInvite(false); load(); }} />}
    </div>
  );
}
