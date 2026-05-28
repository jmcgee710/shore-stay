import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { NJ_TAX } from './municipalityData';
import type { Booking } from '../types';
import { useApi } from '../../../hooks/useApi';

interface Props {
  propertyId: string;
  bookings: Booking[];
}

interface Quarter {
  q: string;
  label: string;
  dueMonth: string;
  months: number[];
}

const QUARTERS: Quarter[] = [
  { q: 'Q1', label: 'Jan – Mar', dueMonth: 'April 20',    months: [0, 1, 2] },
  { q: 'Q2', label: 'Apr – Jun', dueMonth: 'July 20',     months: [3, 4, 5] },
  { q: 'Q3', label: 'Jul – Sep', dueMonth: 'October 20',  months: [6, 7, 8] },
  { q: 'Q4', label: 'Oct – Dec', dueMonth: 'Jan 20 +1yr', months: [9, 10, 11] },
];

function nightsInQuarter(booking: Booking, months: number[]): number {
  const year = new Date().getFullYear();
  const start = new Date(booking.startDate);
  const end = new Date(booking.endDate);
  let nights = 0;
  const cur = new Date(start);
  while (cur < end) {
    if (cur.getFullYear() === year && months.includes(cur.getMonth())) nights++;
    cur.setDate(cur.getDate() + 1);
  }
  return nights;
}

function getDueDateStatus(dueMonth: string, qMonths: number[]): 'upcoming' | 'due-soon' | 'past' {
  const currentMonth = new Date().getMonth();
  const lastQMonth = qMonths[qMonths.length - 1];
  if (currentMonth < qMonths[0]) return 'upcoming';
  if (currentMonth > lastQMonth + 1) return 'past';
  if (currentMonth === lastQMonth + 1) return 'due-soon';
  return 'upcoming';
}

/** TaxCalendar — NJ quarterly tax deadlines + estimated owed from booking data */
export function TaxCalendar({ propertyId, bookings }: Props) {
  const api = useApi();
  const year = new Date().getFullYear();
  const [paidQuarters, setPaidQuarters] = useState<Record<string, boolean>>({});
  const [nightlyRate, setNightlyRate] = useState<number>(350);
  const [editingRate, setEditingRate] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    api.get<any>(`/api/compliance/properties/${propertyId}/state`).then((s) => {
      setPaidQuarters((s.paidQuarters as Record<string, boolean>) ?? {});
      if (s.nightlyRate) setNightlyRate(s.nightlyRate);
      setLoaded(true);
    }).catch(() => setLoaded(true));
  }, [propertyId]);

  const persistState = useCallback((patch: Record<string, unknown>) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      api.put(`/api/compliance/properties/${propertyId}/state`, patch).catch(() => {});
    }, 500);
  }, [propertyId]);

  function togglePaid(q: string) {
    // Use year-scoped key so historical records survive year-end rollover
    const key = `${year}-${q}`;
    setPaidQuarters((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      persistState({ paidQuarters: next });
      return next;
    });
  }

  function saveRate(val: number) {
    setNightlyRate(val);
    persistState({ nightlyRate: val });
    setEditingRate(false);
  }

  const totalNightsThisYear = QUARTERS.reduce(
    (sum, q) => sum + bookings.reduce((s, b) => s + nightsInQuarter(b, q.months), 0),
    0,
  );
  const totalRevenue = totalNightsThisYear * nightlyRate;
  const estimatedStateTax = Math.round(totalRevenue * NJ_TAX.combinedStateRate);

  if (!loaded) {
    return <div className="py-8 text-center text-sm text-slate-400">Loading tax calendar…</div>;
  }

  return (
    <div className="space-y-4">
      {/* Header summary */}
      <div className="glass-card px-5 py-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-[13px] font-bold text-ocean-700 uppercase tracking-wide mb-1">
              {year} NJ Tax Overview
            </p>
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
              NJ Sales Tax (6.625%) + Hotel/Motel Fee (5%) = <span className="font-semibold text-slate-700">~11.625% state rate</span> on
              all rentals under 90 days. Plus municipal tax (typically 1–3%).
            </p>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-slate-400 uppercase tracking-wide">Est. State Tax Owed</p>
            <p className="text-2xl font-extrabold text-ocean-700">
              ${estimatedStateTax.toLocaleString()}
            </p>
            <p className="text-[10px] text-slate-400">{totalNightsThisYear} nights · {year}</p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3 rounded-2xl bg-ocean/5 border border-ocean/10 px-4 py-3">
          <span className="text-lg">💰</span>
          <div className="flex-1">
            <p className="text-[12px] font-semibold text-slate-600">Avg. nightly rate for estimates</p>
            {editingRate ? (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-slate-500">$</span>
                <input
                  type="number"
                  defaultValue={nightlyRate}
                  min={1}
                  onBlur={(e) => saveRate(Number(e.target.value))}
                  onKeyDown={(e) => { if (e.key === 'Enter') saveRate(Number((e.target as HTMLInputElement).value)); }}
                  className="w-24 rounded-xl border border-ocean/30 bg-white/80 px-2 py-1 text-sm font-bold text-ocean-700 focus:border-ocean-400"
                  autoFocus
                />
                <span className="text-xs text-slate-400">/night</span>
              </div>
            ) : (
              <button
                onClick={() => setEditingRate(true)}
                className="mt-0.5 flex items-center gap-1 text-sm font-bold text-ocean-600 hover:text-ocean-800 transition"
              >
                ${nightlyRate}/night <span className="text-[10px] text-slate-400">(tap to edit)</span>
              </button>
            )}
          </div>
          <a
            href={NJ_TAX.paymentPortal}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 rounded-full bg-ocean-600 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-ocean-700 transition"
          >
            File NJ-ST-50 →
          </a>
        </div>
      </div>

      {/* Quarter cards */}
      <div className="space-y-3">
        {QUARTERS.map((quarter, i) => {
          const key = `${year}-${quarter.q}`;
          const qNights = bookings.reduce((sum, b) => sum + nightsInQuarter(b, quarter.months), 0);
          const qRevenue = qNights * nightlyRate;
          const qTax = Math.round(qRevenue * NJ_TAX.combinedStateRate);
          const isPaid = paidQuarters[key] ?? false;
          const status = getDueDateStatus(quarter.dueMonth, quarter.months);
          const isCurrentQ = quarter.months.includes(new Date().getMonth());

          return (
            <motion.div
              key={quarter.q}
              className={`glass-card px-5 py-4 transition-all ${
                isPaid ? 'opacity-70' : isCurrentQ ? 'ring-1 ring-ocean-300/60' : ''
              }`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: i * 0.07 }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => togglePaid(quarter.q)}
                    className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition ${
                      isPaid ? 'border-green-500 bg-green-500' : 'border-slate-300 hover:border-green-400'
                    }`}
                    title={isPaid ? 'Mark unpaid' : 'Mark paid'}
                  >
                    {isPaid && (
                      <svg viewBox="0 0 10 10" className="h-2.5 w-2.5 fill-white">
                        <path d="M1.5 5.5l2.5 2.5 4.5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                      </svg>
                    )}
                  </button>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-ocean-700 text-[15px]">{quarter.q}</span>
                      <span className="text-sm text-slate-500">{quarter.label} {year}</span>
                      {isCurrentQ && (
                        <span className="rounded-full bg-ocean/10 px-2 py-0.5 text-[10px] font-bold text-ocean-600 uppercase">
                          Current
                        </span>
                      )}
                      {isPaid && (
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700">
                          ✓ Paid
                        </span>
                      )}
                      {!isPaid && status === 'due-soon' && (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                          Due Soon
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-[12px] text-slate-500">
                      Due: <span className="font-semibold text-slate-700">{quarter.dueMonth}</span>
                      <span className="mx-1.5 text-slate-300">·</span>
                      Form: NJ-ST-50
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className={`text-[18px] font-extrabold ${isPaid ? 'text-green-600' : 'text-ocean-700'}`}>
                    ${qTax.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-slate-400">{qNights} nights · est.</p>
                </div>
              </div>

              {qNights > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-100/80">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
                    Bookings contributing to {quarter.q}
                  </p>
                  <div className="space-y-1">
                    {bookings
                      .filter((b) => nightsInQuarter(b, quarter.months) > 0)
                      .map((b) => {
                        const n = nightsInQuarter(b, quarter.months);
                        return (
                          <div key={b.id} className="flex items-center justify-between text-xs text-slate-500">
                            <span>
                              {new Date(b.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              {' – '}
                              {new Date(b.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                            <span className="font-semibold text-slate-600">{n} night{n !== 1 ? 's' : ''}</span>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      <p className="text-center text-[11px] text-slate-400 px-4 leading-relaxed">
        Estimates use your nightly rate × 11.625% (NJ state only). Municipal taxes and platform
        (Airbnb/VRBO) remittances may differ. Consult a tax professional for exact obligations.
      </p>
    </div>
  );
}
