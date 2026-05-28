import { useState, useEffect, FormEvent, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DOCUMENT_TYPES, type DocumentType } from './municipalityData';
import { useApi } from '../../../hooks/useApi';

interface Props {
  propertyId: string;
}

export interface VaultDocument {
  id: string;
  name: string;
  docType: DocumentType;
  issueDate: string;
  expiryDate: string;
  notes: string;
  createdAt: string;
}

type DocStatus = 'current' | 'expiring' | 'expired' | 'no-expiry';

function toDateInput(iso: string | null): string {
  if (!iso) return '';
  return iso.split('T')[0];
}

function getStatus(expiryDate: string): DocStatus {
  if (!expiryDate) return 'no-expiry';
  const expiry = new Date(expiryDate);
  const now = new Date();
  const daysUntil = Math.floor((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (daysUntil < 0) return 'expired';
  if (daysUntil <= 60) return 'expiring';
  return 'current';
}

const STATUS_META = {
  current:    { label: 'Current',  color: 'bg-green-100 text-green-700 border-green-200/60',  dot: 'bg-green-500' },
  expiring:   { label: 'Expiring', color: 'bg-amber-100 text-amber-700 border-amber-200/60',  dot: 'bg-amber-500' },
  expired:    { label: 'Expired',  color: 'bg-red-100 text-red-700 border-red-200/60',        dot: 'bg-red-500' },
  'no-expiry':{ label: 'On file',  color: 'bg-slate-100 text-slate-600 border-slate-200/60',  dot: 'bg-slate-400' },
};

function docTypeMeta(docType: DocumentType) {
  return DOCUMENT_TYPES.find((d) => d.value === docType) ?? { label: docType, icon: '📄', required: false };
}

const EMPTY_FORM: Omit<VaultDocument, 'id' | 'createdAt'> = {
  name: '',
  docType: 'flood_insurance',
  issueDate: '',
  expiryDate: '',
  notes: '',
};

/** DocumentVault — track property compliance documents with expiry alerts */
export function DocumentVault({ propertyId }: Props) {
  const api = useApi();
  const [docs, setDocs] = useState<VaultDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadDocs = useCallback(async () => {
    try {
      const data = await api.get<any[]>(`/api/compliance/properties/${propertyId}/documents`);
      setDocs(data.map((d) => ({
        id: d.id,
        name: d.name,
        docType: d.docType,
        issueDate: toDateInput(d.issueDate),
        expiryDate: toDateInput(d.expiryDate),
        notes: d.notes ?? '',
        createdAt: d.createdAt,
      })));
    } catch {}
    setLoading(false);
  }, [propertyId]);

  useEffect(() => { loadDocs(); }, [loadDocs]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        const updated = await api.put<any>(
          `/api/compliance/properties/${propertyId}/documents/${editingId}`,
          { ...form }
        );
        setDocs((prev) => prev.map((d) => d.id === editingId ? {
          ...d, name: updated.name, docType: updated.docType,
          issueDate: toDateInput(updated.issueDate),
          expiryDate: toDateInput(updated.expiryDate),
          notes: updated.notes ?? '',
        } : d));
        setEditingId(null);
      } else {
        const created = await api.post<any>(
          `/api/compliance/properties/${propertyId}/documents`,
          { ...form }
        );
        setDocs((prev) => [...prev, {
          id: created.id, name: created.name, docType: created.docType,
          issueDate: toDateInput(created.issueDate),
          expiryDate: toDateInput(created.expiryDate),
          notes: created.notes ?? '', createdAt: created.createdAt,
        }]);
      }
      setForm(EMPTY_FORM);
      setShowForm(false);
    } catch { alert('Failed to save document'); }
    setSaving(false);
  }

  function startEdit(doc: VaultDocument) {
    setForm({ name: doc.name, docType: doc.docType, issueDate: doc.issueDate, expiryDate: doc.expiryDate, notes: doc.notes });
    setEditingId(doc.id);
    setShowForm(true);
  }

  async function deleteDoc(id: string) {
    if (!confirm('Remove this document from your vault?')) return;
    try {
      await api.del(`/api/compliance/properties/${propertyId}/documents/${id}`);
      setDocs((prev) => prev.filter((d) => d.id !== id));
    } catch { alert('Failed to remove document'); }
  }

  const sortOrder: DocStatus[] = ['expired', 'expiring', 'current', 'no-expiry'];
  const sortedDocs = [...docs].sort(
    (a, b) => sortOrder.indexOf(getStatus(a.expiryDate)) - sortOrder.indexOf(getStatus(b.expiryDate)),
  );

  const expiredCount = docs.filter((d) => getStatus(d.expiryDate) === 'expired').length;
  const expiringCount = docs.filter((d) => getStatus(d.expiryDate) === 'expiring').length;

  const missingRequired = DOCUMENT_TYPES.filter(
    (dt) => dt.required && !docs.some((d) => d.docType === dt.value),
  );

  if (loading) {
    return <div className="py-8 text-center text-sm text-slate-400">Loading vault…</div>;
  }

  return (
    <div className="space-y-4">
      {/* Alert banner */}
      {(expiredCount > 0 || expiringCount > 0) && (
        <div className={`glass-card-sm border px-4 py-3 ${
          expiredCount > 0 ? 'border-red-200/60 bg-red-50/60' : 'border-amber-200/60 bg-amber-50/60'
        }`}>
          <div className="flex items-center gap-2">
            <span className="text-lg">{expiredCount > 0 ? '🚨' : '⚠️'}</span>
            <p className="text-[13px] font-semibold text-slate-700">
              {expiredCount > 0 && `${expiredCount} document${expiredCount > 1 ? 's' : ''} expired`}
              {expiredCount > 0 && expiringCount > 0 && ' · '}
              {expiringCount > 0 && `${expiringCount} expiring within 60 days`}
            </p>
          </div>
        </div>
      )}

      {/* Missing required docs */}
      {missingRequired.length > 0 && (
        <div className="glass-card-sm border border-ocean/20 bg-ocean/4 px-4 py-3">
          <p className="text-[12px] font-bold text-ocean-700 mb-1.5">📋 Recommended documents not yet added:</p>
          <div className="flex flex-wrap gap-1.5">
            {missingRequired.map((dt) => (
              <button
                key={dt.value}
                onClick={() => {
                  setForm({ ...EMPTY_FORM, docType: dt.value as DocumentType, name: dt.label });
                  setShowForm(true);
                  setEditingId(null);
                }}
                className="rounded-full border border-ocean/25 bg-white/70 px-3 py-1 text-[11px] font-semibold text-ocean-600 hover:bg-white transition"
              >
                + {dt.icon} {dt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Add / Edit form */}
      <AnimatePresence>
        {showForm && (
          <motion.form
            key="vault-form"
            onSubmit={handleSubmit}
            className="glass-card px-5 py-5 space-y-3"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <p className="text-[13px] font-bold text-ocean-700">
              {editingId ? 'Edit Document' : 'Add Document'}
            </p>

            <div>
              <label className="block text-[12px] font-semibold text-slate-500 mb-1">Document type</label>
              <select
                value={form.docType}
                onChange={(e) => {
                  const t = e.target.value as DocumentType;
                  const meta = docTypeMeta(t);
                  setForm((f) => ({ ...f, docType: t, name: f.name || meta.label }));
                }}
                className="w-full rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-2.5 text-sm focus:border-ocean-400 transition"
              >
                {DOCUMENT_TYPES.map((dt) => (
                  <option key={dt.value} value={dt.value}>
                    {dt.icon} {dt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-slate-500 mb-1">Document name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. NFIP Flood Policy #12345"
                className="w-full rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-2.5 text-sm placeholder:text-slate-300 focus:border-ocean-400 transition"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[12px] font-semibold text-slate-500 mb-1">Issue / effective date</label>
                <input
                  type="date"
                  value={form.issueDate}
                  onChange={(e) => setForm((f) => ({ ...f, issueDate: e.target.value }))}
                  className="w-full rounded-2xl border border-slate-200/80 bg-white/80 px-3 py-2.5 text-sm focus:border-ocean-400 transition"
                />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-slate-500 mb-1">Expiry date</label>
                <input
                  type="date"
                  value={form.expiryDate}
                  onChange={(e) => setForm((f) => ({ ...f, expiryDate: e.target.value }))}
                  className="w-full rounded-2xl border border-slate-200/80 bg-white/80 px-3 py-2.5 text-sm focus:border-ocean-400 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-slate-500 mb-1">Notes (optional)</label>
              <input
                type="text"
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                placeholder="Policy number, insurer, location of physical copy…"
                className="w-full rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-2.5 text-sm placeholder:text-slate-300 focus:border-ocean-400 transition"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                disabled={saving}
                className="rounded-full bg-ocean-600 px-5 py-2 text-xs font-bold text-white hover:bg-ocean-700 transition active:scale-95 disabled:opacity-50"
              >
                {saving ? 'Saving…' : editingId ? 'Save changes' : 'Add to vault'}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setEditingId(null); setForm(EMPTY_FORM); }}
                className="rounded-full border border-slate-200 px-4 py-2 text-xs font-medium text-slate-500 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Document list */}
      {sortedDocs.length === 0 && !showForm ? (
        <div className="glass-card px-5 py-8 text-center">
          <span className="text-4xl">📁</span>
          <p className="mt-3 text-sm font-semibold text-slate-600">Your vault is empty</p>
          <p className="mt-1 text-xs text-slate-400">Add flood insurance, rental permits, and inspection certs to track expiry dates.</p>
          <button
            onClick={() => { setShowForm(true); setEditingId(null); }}
            className="mt-4 rounded-full bg-ocean-600 px-5 py-2 text-xs font-bold text-white hover:bg-ocean-700 transition"
          >
            + Add first document
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {sortedDocs.map((doc, i) => {
            const status = getStatus(doc.expiryDate);
            const meta = STATUS_META[status];
            const typeMeta = docTypeMeta(doc.docType);
            const daysLeft = doc.expiryDate
              ? Math.floor((new Date(doc.expiryDate).getTime() - Date.now()) / 86400000)
              : null;

            return (
              <motion.div
                key={doc.id}
                className={`glass-card px-5 py-4 border ${
                  status === 'expired' ? 'border-red-200/60' :
                  status === 'expiring' ? 'border-amber-200/60' : 'border-white/60'
                }`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: i * 0.05 }}
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-ocean/8 text-xl">
                    {typeMeta.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <p className="font-bold text-slate-800 text-[14px]">{doc.name}</p>
                        <p className="text-[11px] text-slate-400">{typeMeta.label}</p>
                      </div>
                      <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${meta.color}`}>
                        <span className={`mr-1 inline-block h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                        {meta.label}
                      </span>
                    </div>

                    <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-slate-400">
                      {doc.issueDate && (
                        <span>
                          Issued:{' '}
                          <span className="font-medium text-slate-600">
                            {new Date(doc.issueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </span>
                      )}
                      {doc.expiryDate && (
                        <span className={status === 'expired' ? 'text-red-500 font-semibold' : status === 'expiring' ? 'text-amber-600 font-semibold' : ''}>
                          Expires:{' '}
                          {new Date(doc.expiryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          {daysLeft !== null && daysLeft >= 0 && daysLeft <= 60 && (
                            <span className="ml-1">({daysLeft}d left)</span>
                          )}
                          {daysLeft !== null && daysLeft < 0 && (
                            <span className="ml-1">(expired {Math.abs(daysLeft)}d ago)</span>
                          )}
                        </span>
                      )}
                    </div>
                    {doc.notes && (
                      <p className="mt-1 text-[11px] text-slate-400 italic">{doc.notes}</p>
                    )}

                    <div className="mt-2 flex gap-3 text-[11px]">
                      <button
                        onClick={() => startEdit(doc)}
                        className="font-semibold text-ocean-500 hover:text-ocean-700 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteDoc(doc.id)}
                        className="text-slate-400 hover:text-red-400 transition"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}

          {!showForm && (
            <button
              onClick={() => { setShowForm(true); setEditingId(null); setForm(EMPTY_FORM); }}
              className="w-full rounded-2xl border-2 border-dashed border-slate-200/80 py-3 text-sm font-medium text-slate-400 transition hover:border-ocean/30 hover:text-ocean-500"
            >
              + Add document
            </button>
          )}
        </div>
      )}
    </div>
  );
}
