import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LBI_MUNICIPALITIES,
  MUNICIPALITY_ORDER,
  COMPLIANCE_CHECKLIST,
  type ChecklistItem,
} from './municipalityData';
import { useApi } from '../../../hooks/useApi';

interface Props {
  propertyId: string;
  onMunicipalityChange?: (muniId: string) => void;
}

const CATEGORY_META = {
  permit:    { label: 'Permits & Legal',   color: 'bg-purple-100 text-purple-700', dot: 'bg-purple-400' },
  safety:    { label: 'Safety',            color: 'bg-red-100 text-red-700',       dot: 'bg-red-400' },
  insurance: { label: 'Insurance',         color: 'bg-blue-100 text-blue-700',     dot: 'bg-blue-400' },
  utilities: { label: 'Utilities & Maint', color: 'bg-amber-100 text-amber-700',   dot: 'bg-amber-400' },
  municipal: { label: 'Municipal Rules',   color: 'bg-teal-100 text-teal-700',     dot: 'bg-teal-400' },
} as const;

/** ComplianceTracker — per-municipality LBI rental compliance checklist */
export function ComplianceTracker({ propertyId, onMunicipalityChange }: Props) {
  const api = useApi();
  const [selectedMuni, setSelectedMuni] = useState<string>('');
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [expandRules, setExpandRules] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    api.get<any>(`/api/compliance/properties/${propertyId}/state`).then((s) => {
      if (s.selectedMuniId && LBI_MUNICIPALITIES[s.selectedMuniId]) {
        setSelectedMuni(s.selectedMuniId);
      }
      setChecked((s.checkedItems as Record<string, boolean>) ?? {});
      setLoaded(true);
    }).catch(() => setLoaded(true));
  }, [propertyId]);

  const persistState = useCallback((patch: Record<string, unknown>) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      api.put(`/api/compliance/properties/${propertyId}/state`, patch).catch(() => {});
    }, 500);
  }, [propertyId]);

  function handleMuniChange(muniId: string) {
    setSelectedMuni(muniId);
    persistState({ selectedMuniId: muniId });
    onMunicipalityChange?.(muniId);
  }

  function toggleItem(id: string) {
    setChecked((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      persistState({ checkedItems: next });
      return next;
    });
  }

  const muni = selectedMuni ? LBI_MUNICIPALITIES[selectedMuni] : null;

  const visibleItems: ChecklistItem[] = COMPLIANCE_CHECKLIST.filter(
    (item) =>
      !item.municipalitySpecific ||
      (selectedMuni && item.municipalitySpecific.includes(selectedMuni)),
  );

  const completedCount = visibleItems.filter((item) => checked[item.id]).length;
  const totalCount = visibleItems.length;
  const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const groups = Object.keys(CATEGORY_META) as (keyof typeof CATEGORY_META)[];

  if (!loaded) {
    return <div className="py-8 text-center text-sm text-slate-400">Loading checklist…</div>;
  }

  return (
    <div className="space-y-4">
      {/* Municipality selector */}
      <div>
        <label className="block text-[13px] font-semibold text-slate-600 mb-2">
          Which LBI municipality is your property in?
        </label>
        <div className="flex flex-wrap gap-2">
          {MUNICIPALITY_ORDER.map((id) => {
            const m = LBI_MUNICIPALITIES[id];
            return (
              <button
                key={id}
                onClick={() => handleMuniChange(id)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold border transition-all ${
                  selectedMuni === id
                    ? 'bg-ocean-600 text-white border-ocean-600 shadow-sm'
                    : 'bg-white/70 text-slate-600 border-white/60 hover:bg-white hover:border-slate-200 shadow-glass'
                }`}
              >
                {m.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Municipality quick-info */}
      <AnimatePresence>
        {muni && (
          <motion.div
            key={muni.id}
            className="glass-card-sm border-ocean/15 overflow-hidden"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="px-5 py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="font-bold text-ocean-700 text-[15px]">{muni.name}</p>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span>
                      <span className="font-semibold text-slate-700">Permit:</span>{' '}
                      {muni.permitRequired ? `Required · ${muni.permitFee}` : 'Not required'}
                    </span>
                    <span>
                      <span className="font-semibold text-slate-700">Inspection:</span>{' '}
                      {muni.inspectionRequired ? 'Required' : 'Not required'}
                    </span>
                    <span>
                      <span className="font-semibold text-slate-700">Year-round:</span> Yes
                    </span>
                    <span>
                      <span className="font-semibold text-slate-700">Occupancy:</span> {muni.maxOccupancy}
                    </span>
                  </div>
                </div>
                <a
                  href={`tel:${muni.phone}`}
                  className="shrink-0 rounded-full bg-ocean/10 px-3 py-1.5 text-xs font-semibold text-ocean-700 hover:bg-ocean/20 transition"
                >
                  📞 Clerk
                </a>
              </div>

              <button
                onClick={() => setExpandRules(!expandRules)}
                className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-ocean-500 hover:text-ocean-700 transition"
              >
                <span>{expandRules ? '▾' : '▸'}</span>
                {expandRules ? 'Hide' : 'View'} all {muni.summaryRules.length} rules
              </button>
              <AnimatePresence>
                {expandRules && (
                  <motion.ul
                    className="mt-2 space-y-1.5"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    {muni.summaryRules.map((rule, i) => (
                      <li key={i} className="flex gap-2 text-xs text-slate-600">
                        <span className="mt-0.5 shrink-0 text-ocean-400">•</span>
                        <span>{rule}</span>
                      </li>
                    ))}
                    {muni.notes && (
                      <li className="mt-2 rounded-xl bg-amber-50/80 border border-amber-200/60 px-3 py-2 text-xs text-amber-700">
                        ⚠️ {muni.notes}
                      </li>
                    )}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress bar */}
      <div className="glass-card-sm px-5 py-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[13px] font-bold text-slate-700">Compliance Progress</p>
          <span className={`text-[13px] font-bold ${
            pct === 100 ? 'text-green-600' : pct >= 70 ? 'text-amber-600' : 'text-red-500'
          }`}>
            {completedCount}/{totalCount}
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-slate-200/80 overflow-hidden">
          <motion.div
            className={`h-2 rounded-full ${
              pct === 100 ? 'bg-green-500' : pct >= 70 ? 'bg-amber-400' : 'bg-red-400'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>
        {pct === 100 && (
          <p className="mt-1.5 text-xs font-semibold text-green-600">✓ All compliance items complete!</p>
        )}
      </div>

      {/* Checklist grouped by category */}
      <div className="space-y-3">
        {groups.map((cat) => {
          const items = visibleItems.filter((i) => i.category === cat);
          if (items.length === 0) return null;
          const meta = CATEGORY_META[cat];
          const catDone = items.filter((i) => checked[i.id]).length;

          return (
            <div key={cat} className="glass-card px-5 py-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`h-2.5 w-2.5 rounded-full ${meta.dot}`} />
                  <span className="text-[12px] font-bold uppercase tracking-wide text-slate-500">
                    {meta.label}
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-slate-400">
                  {catDone}/{items.length}
                </span>
              </div>
              <div className="space-y-2">
                {items.map((item) => (
                  <label key={item.id} className="flex cursor-pointer items-start gap-3 rounded-xl p-2.5 transition hover:bg-ocean/4">
                    <div className="mt-0.5 shrink-0">
                      <div
                        onClick={() => toggleItem(item.id)}
                        className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition ${
                          checked[item.id]
                            ? 'border-green-500 bg-green-500'
                            : item.priority === 'high'
                            ? 'border-red-300 hover:border-red-400'
                            : 'border-slate-300 hover:border-ocean-300'
                        }`}
                      >
                        {checked[item.id] && (
                          <svg viewBox="0 0 10 10" className="h-2.5 w-2.5 fill-white">
                            <path d="M1.5 5.5l2.5 2.5 4.5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-[13px] leading-snug ${
                        checked[item.id] ? 'text-slate-400 line-through' : 'text-slate-700 font-medium'
                      }`}>
                        {item.label}
                        {item.priority === 'high' && !checked[item.id] && (
                          <span className="ml-2 rounded-full bg-red-100 px-1.5 py-0.5 text-[9px] font-bold text-red-600 uppercase">
                            Required
                          </span>
                        )}
                      </p>
                      {item.detail && (
                        <p className="mt-0.5 text-[11px] text-slate-400 leading-relaxed">{item.detail}</p>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-center text-[11px] text-slate-400 px-4">
        ⚠️ Rules are for informational purposes only. Always verify directly with your municipality.
      </p>
    </div>
  );
}
