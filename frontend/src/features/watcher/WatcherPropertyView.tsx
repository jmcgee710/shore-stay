import { useState, useEffect, FormEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApi } from '../../hooks/useApi';
import type { WatcherAssignment, StormAlert } from './types';
import { CONDITION_META, SEVERITY_META } from './types';

const T = {
  oceanDeep: '#0a3457', ocean: '#0f4c75', seafoam: '#56cfe1',
  cream: '#fbf7ee', bg: '#fbf7ee', muted: '#5b6b7a', ink: '#0a1f33',
  line: 'rgba(15,76,117,0.12)', coral: 'oklch(0.74 0.13 38)', green: '#5a8a5e',
};

const inp = { borderRadius: 10, border: `1px solid ${T.line}`, background: T.cream, padding: '10px 12px', fontSize: 14, fontFamily: 'inherit', outline: 'none', width: '100%' } as const;

const CONDITION_OPTIONS = ['good', 'fair', 'needs_attention', 'damage'] as const;
const ALERT_TYPES = ['storm', 'flood', 'wind_damage', 'utility_failure', 'vandalism', 'other'] as const;
const SEVERITIES = ['low', 'medium', 'high', 'critical'] as const;
const TRADES = ['plumber', 'electrician', 'roofer', 'general', 'other'] as const;

type Tab = 'report' | 'alert';

export default function WatcherPropertyView() {
  const { id } = useParams<{ id: string }>();
  const api = useApi();
  const [tab, setTab] = useState<Tab>('report');
  const [assignment, setAssignment] = useState<WatcherAssignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');

  // Report
  const [summary, setSummary] = useState('');
  const [condition, setCondition] = useState<typeof CONDITION_OPTIONS[number]>('good');
  const [photoInputs, setPhotoInputs] = useState(['']);
  const [notes, setNotes] = useState('');

  // Alert
  const [alertType, setAlertType] = useState<typeof ALERT_TYPES[number]>('storm');
  const [severity, setSeverity] = useState<typeof SEVERITIES[number]>('medium');
  const [description, setDescription] = useState('');
  const [alertPhotos, setAlertPhotos] = useState(['']);
  const [costEstimate, setCostEstimate] = useState('');
  const [createdAlert, setCreatedAlert] = useState<StormAlert | null>(null);

  // Dispatch
  const [showDispatch, setShowDispatch] = useState(false);
  const [contractorName, setContractorName] = useState('');
  const [contractorPhone, setContractorPhone] = useState('');
  const [trade, setTrade] = useState<typeof TRADES[number]>('general');
  const [workDesc, setWorkDesc] = useState('');
  const [dispatchCost, setDispatchCost] = useState('');

  useEffect(() => {
    api.get<WatcherAssignment[]>('/api/watcher/my-properties').then(list => {
      setAssignment(list.find(a => a.property?.id === id) ?? null);
    }).finally(() => setLoading(false));
  }, [id]);

  function validPhotos(inputs: string[]) { return inputs.map(u => u.trim()).filter(u => u.length > 0); }

  async function submitReport(e: FormEvent) {
    e.preventDefault();
    if (!summary.trim()) return;
    setSaving(true);
    try {
      await api.post(`/api/watcher/properties/${id}/reports`, { summary, overallCondition: condition, photoUrls: validPhotos(photoInputs), notes: notes || undefined });
      setSuccess('Report submitted — the homeowner can now see your check-in.');
      setSummary(''); setCondition('good'); setPhotoInputs(['']); setNotes('');
    } catch { alert('Failed to submit report'); }
    setSaving(false);
  }

  async function submitAlert(e: FormEvent) {
    e.preventDefault();
    if (!description.trim()) return;
    setSaving(true);
    try {
      const al = await api.post<StormAlert>(`/api/watcher/properties/${id}/alerts`, { alertType, severity, description, photoUrls: validPhotos(alertPhotos), damageCostEstimate: costEstimate ? Number(costEstimate) : undefined });
      setCreatedAlert(al);
      setSuccess(al.requiresOwnerApproval ? 'Alert logged. Owner will be notified to approve dispatch.' : 'Alert logged. Hands-off mode — you can dispatch a contractor directly.');
      setDescription(''); setAlertPhotos(['']); setCostEstimate('');
    } catch { alert('Failed to log alert'); }
    setSaving(false);
  }

  async function submitDispatch(e: FormEvent) {
    e.preventDefault();
    if (!createdAlert || !contractorName.trim() || !workDesc.trim()) return;
    setSaving(true);
    try {
      await api.post(`/api/watcher/alerts/${createdAlert.id}/dispatch`, { contractorName, contractorPhone: contractorPhone || undefined, trade, workDescription: workDesc, estimatedCost: dispatchCost ? Number(dispatchCost) : undefined });
      setSuccess('Contractor dispatched.'); setShowDispatch(false); setCreatedAlert(null);
    } catch { alert('Failed to dispatch'); }
    setSaving(false);
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {[0,1,2].map(i => (
            <motion.div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: T.seafoam }}
              animate={{ scale: [1,1.4,1], opacity: [0.4,1,0.4] }}
              transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2 }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: T.bg, fontFamily: 'Inter Tight, Inter, sans-serif' }}>
      {/* Header */}
      <header style={{ background: `linear-gradient(160deg, #061e33 0%, ${T.oceanDeep} 40%, ${T.ocean} 100%)`, padding: '20px 20px 0' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <Link to="/watcher" style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>← Dashboard</Link>
          <h1 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 28, fontWeight: 500, letterSpacing: '-0.02em', color: 'white', margin: '8px 0 4px' }}>
            {assignment?.property?.name ?? 'Property'}
          </h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 16 }}>{assignment?.property?.address}</p>
          {assignment?.handsOffMode && (
            <span style={{ display: 'inline-flex', marginBottom: 14, borderRadius: 999, background: 'rgba(86,207,225,0.2)', border: '1px solid rgba(86,207,225,0.35)', padding: '4px 12px', fontSize: 11.5, fontWeight: 600, color: T.seafoam }}>
              Hands-off mode — you can auto-approve dispatches
            </span>
          )}
        </div>

        {/* Tab strip */}
        <div style={{ maxWidth: 640, margin: '0 auto', display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
          {(['report', 'alert'] as Tab[]).map(t => (
            <button key={t} onClick={() => { setTab(t); setSuccess(''); }}
              style={{ flex: 1, padding: '14px 8px', fontSize: 14, fontWeight: 500, color: 'white', opacity: tab === t ? 1 : 0.5, borderBottom: tab === t ? `2px solid ${T.seafoam}` : '2px solid transparent', marginBottom: -1, background: 'none', cursor: 'pointer', border: 'none', outline: 'none' }}>
              {t === 'report' ? 'Submit Report' : 'Log Alert'}
            </button>
          ))}
        </div>
      </header>

      <main style={{ maxWidth: 640, margin: '0 auto', padding: '20px 16px 48px' }}>
        {/* Success banner */}
        <AnimatePresence>
          {success && (
            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ padding: '12px 16px', borderRadius: 12, background: `color-mix(in oklab, ${T.green} 12%, ${T.cream})`, border: `1px solid color-mix(in oklab, ${T.green} 30%, transparent)`, marginBottom: 16 }}>
              <p style={{ fontSize: 13.5, fontWeight: 600, color: T.green }}>✓ {success}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* REPORT TAB */}
        {tab === 'report' && (
          <form onSubmit={submitReport} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Condition */}
            <div style={{ padding: 18, borderRadius: 14, background: T.cream, border: `1px solid ${T.line}` }}>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: T.muted, marginBottom: 12 }}>Overall condition</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                {CONDITION_OPTIONS.map(c => {
                  const m = CONDITION_META[c];
                  const isActive = condition === c;
                  return (
                    <button key={c} type="button" onClick={() => setCondition(c)}
                      style={{ padding: '12px 14px', borderRadius: 10, textAlign: 'left', border: isActive ? `2px solid ${T.ocean}` : `2px solid ${T.line}`, background: isActive ? 'rgba(15,76,117,0.06)' : 'transparent', cursor: 'pointer', transition: 'all 150ms' }}>
                      <span style={{ fontSize: 20 }}>{m.emoji}</span>
                      <div style={{ marginTop: 6, fontSize: 12, fontWeight: 700, color: T.oceanDeep }}>{m.label}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Summary + notes */}
            <div style={{ padding: 18, borderRadius: 14, background: T.cream, border: `1px solid ${T.line}`, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: T.muted, marginBottom: 8 }}>Summary *</div>
                <textarea required rows={3} value={summary} onChange={e => setSummary(e.target.value)}
                  placeholder="Describe the overall state of the property…"
                  style={{ ...inp, resize: 'none', display: 'block' }} />
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: T.muted, marginBottom: 8 }}>Photo URLs (optional)</div>
                {photoInputs.map((url, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <input type="url" value={url} onChange={e => { const n = [...photoInputs]; n[i] = e.target.value; setPhotoInputs(n); }} placeholder="https://…" style={inp} />
                    {photoInputs.length > 1 && <button type="button" onClick={() => setPhotoInputs(photoInputs.filter((_,j) => j !== i))} style={{ color: T.muted, background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}>×</button>}
                  </div>
                ))}
                <button type="button" onClick={() => setPhotoInputs([...photoInputs, ''])} style={{ fontSize: 12.5, fontWeight: 600, color: T.ocean, background: 'none', border: 'none', cursor: 'pointer' }}>+ Add photo URL</button>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: T.muted, marginBottom: 8 }}>Notes (optional)</div>
                <textarea rows={2} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Anything the homeowner should know…"
                  style={{ ...inp, resize: 'none', display: 'block' }} />
              </div>
            </div>

            <button type="submit" disabled={saving || !summary.trim()}
              style={{ padding: '13px', borderRadius: 999, background: T.oceanDeep, color: T.cream, fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer', opacity: (saving || !summary.trim()) ? 0.5 : 1 }}>
              {saving ? 'Submitting…' : 'Submit check-in report'}
            </button>
          </form>
        )}

        {/* ALERT TAB */}
        {tab === 'alert' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {!createdAlert ? (
              <form onSubmit={submitAlert} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ padding: 18, borderRadius: 14, background: T.cream, border: `1px solid ${T.line}`, display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {/* Alert type */}
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: T.muted, marginBottom: 10 }}>Alert type</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {ALERT_TYPES.map(t => (
                        <button key={t} type="button" onClick={() => setAlertType(t)}
                          style={{ padding: '6px 14px', borderRadius: 999, fontSize: 12.5, fontWeight: 600, border: 'none', cursor: 'pointer', background: alertType === t ? T.oceanDeep : `rgba(15,76,117,0.08)`, color: alertType === t ? T.cream : T.oceanDeep }}>
                          {t.replace('_', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Severity */}
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: T.muted, marginBottom: 10 }}>Severity</div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {SEVERITIES.map(s => {
                        const m = SEVERITY_META[s];
                        const isActive = severity === s;
                        return (
                          <button key={s} type="button" onClick={() => setSeverity(s)}
                            style={{ flex: 1, padding: '9px 4px', borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: 'pointer', border: isActive ? `2px solid ${T.ocean}` : `2px solid ${T.line}`, background: isActive ? 'rgba(15,76,117,0.06)' : 'transparent', color: T.oceanDeep }}>
                            {m.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: T.muted, marginBottom: 8 }}>Description *</div>
                    <textarea required rows={3} value={description} onChange={e => setDescription(e.target.value)}
                      placeholder="Describe what happened and current state…"
                      style={{ ...inp, resize: 'none', display: 'block' }} />
                  </div>

                  {/* Photos */}
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: T.muted, marginBottom: 8 }}>Photo URLs (optional)</div>
                    {alertPhotos.map((url, i) => (
                      <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                        <input type="url" value={url} onChange={e => { const n = [...alertPhotos]; n[i] = e.target.value; setAlertPhotos(n); }} placeholder="https://…" style={inp} />
                        {alertPhotos.length > 1 && <button type="button" onClick={() => setAlertPhotos(alertPhotos.filter((_,j) => j !== i))} style={{ color: T.muted, background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}>×</button>}
                      </div>
                    ))}
                    <button type="button" onClick={() => setAlertPhotos([...alertPhotos, ''])} style={{ fontSize: 12.5, fontWeight: 600, color: T.ocean, background: 'none', border: 'none', cursor: 'pointer' }}>+ Add photo URL</button>
                  </div>

                  {/* Cost */}
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: T.muted, marginBottom: 8 }}>Estimated damage cost (optional)</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 14, color: T.muted }}>$</span>
                      <input type="number" min={0} value={costEstimate} onChange={e => setCostEstimate(e.target.value)} placeholder="0"
                        style={{ ...inp, width: 120 }} />
                    </div>
                  </div>
                </div>

                <button type="submit" disabled={saving || !description.trim()}
                  style={{ padding: '13px', borderRadius: 999, background: T.coral, color: 'white', fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer', opacity: (saving || !description.trim()) ? 0.5 : 1 }}>
                  {saving ? 'Logging…' : 'Log alert'}
                </button>
              </form>
            ) : (
              /* Post-alert dispatch flow */
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ padding: 18, borderRadius: 14, background: `color-mix(in oklab, ${T.green} 10%, ${T.cream})`, border: `1px solid color-mix(in oklab, ${T.green} 25%, transparent)` }}>
                  <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 18, fontWeight: 500, color: T.oceanDeep, marginBottom: 6 }}>Alert logged ✓</div>
                  <p style={{ fontSize: 13.5, color: T.muted, lineHeight: 1.55 }}>
                    {createdAlert.requiresOwnerApproval ? 'Waiting for homeowner approval before dispatch.' : 'Hands-off mode — you can dispatch a contractor now.'}
                  </p>
                </div>

                {!createdAlert.requiresOwnerApproval && (
                  <button onClick={() => setShowDispatch(!showDispatch)}
                    style={{ padding: '12px', borderRadius: 999, border: `2px solid ${T.ocean}`, background: 'transparent', fontSize: 13.5, fontWeight: 600, color: T.ocean, cursor: 'pointer' }}>
                    {showDispatch ? 'Cancel dispatch' : '+ Dispatch a contractor now'}
                  </button>
                )}

                <AnimatePresence>
                  {showDispatch && (
                    <motion.form onSubmit={submitDispatch} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      style={{ padding: 18, borderRadius: 14, background: T.cream, border: `1px solid ${T.line}`, display: 'flex', flexDirection: 'column', gap: 14 }}>
                      <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 20, fontWeight: 500, color: T.oceanDeep }}>Contractor details</div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.muted, marginBottom: 6 }}>Name *</div>
                          <input required value={contractorName} onChange={e => setContractorName(e.target.value)} placeholder="Joe's Roofing" style={inp} />
                        </div>
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.muted, marginBottom: 6 }}>Phone</div>
                          <input value={contractorPhone} onChange={e => setContractorPhone(e.target.value)} placeholder="(609) 555-0100" style={inp} />
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.muted, marginBottom: 8 }}>Trade</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {TRADES.map(t => (
                            <button key={t} type="button" onClick={() => setTrade(t)}
                              style={{ padding: '6px 14px', borderRadius: 999, fontSize: 12.5, fontWeight: 600, border: 'none', cursor: 'pointer', background: trade === t ? T.oceanDeep : `rgba(15,76,117,0.08)`, color: trade === t ? T.cream : T.oceanDeep }}>
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.muted, marginBottom: 6 }}>Work description *</div>
                        <textarea required rows={2} value={workDesc} onChange={e => setWorkDesc(e.target.value)} placeholder="Describe the work to be done…"
                          style={{ ...inp, resize: 'none', display: 'block' }} />
                      </div>

                      <div>
                        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.muted, marginBottom: 6 }}>Estimated cost</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 14, color: T.muted }}>$</span>
                          <input type="number" min={0} value={dispatchCost} onChange={e => setDispatchCost(e.target.value)} placeholder="0" style={{ ...inp, width: 120 }} />
                        </div>
                      </div>

                      <button type="submit" disabled={saving}
                        style={{ padding: '13px', borderRadius: 999, background: T.oceanDeep, color: T.cream, fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer', opacity: saving ? 0.5 : 1 }}>
                        {saving ? 'Dispatching…' : 'Confirm dispatch'}
                      </button>
                    </motion.form>
                  )}
                </AnimatePresence>

                <button onClick={() => { setCreatedAlert(null); setSuccess(''); }}
                  style={{ padding: '12px', borderRadius: 999, border: `1px solid ${T.line}`, background: 'transparent', fontSize: 13.5, fontWeight: 500, color: T.muted, cursor: 'pointer' }}>
                  Log another alert
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
