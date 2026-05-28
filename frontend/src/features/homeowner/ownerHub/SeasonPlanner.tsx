import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  getCurrentSeason,
  SEASON_INFO,
  OFFSEASON_AMENITIES,
  type Season,
} from './municipalityData';

interface Props {
  propertyId: string;
}

function amenityKey(propertyId: string) {
  return `ss_season_amenities_${propertyId}`;
}

const SEASON_TABS: { id: Season; label: string; emoji: string }[] = [
  { id: 'peak',      label: 'Peak',      emoji: '☀️' },
  { id: 'shoulder',  label: 'Shoulder',  emoji: '🍂' },
  { id: 'offseason', label: 'Off Season', emoji: '❄️' },
];

/** SeasonPlanner — seasonal tips and off-season amenity tracker */
export function SeasonPlanner({ propertyId }: Props) {
  const currentSeason = getCurrentSeason();
  const [activeSeason, setActiveSeason] = useState<Season>(currentSeason);
  const [checkedAmenities, setCheckedAmenities] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const saved = localStorage.getItem(amenityKey(propertyId));
    if (saved) {
      try { setCheckedAmenities(JSON.parse(saved)); } catch {}
    }
  }, [propertyId]);

  function toggleAmenity(id: string) {
    setCheckedAmenities((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      localStorage.setItem(amenityKey(propertyId), JSON.stringify(next));
      return next;
    });
  }

  const info = SEASON_INFO[activeSeason];
  const amenityDone = OFFSEASON_AMENITIES.filter((a) => checkedAmenities[a.id]).length;
  const highPriorityAmenities = OFFSEASON_AMENITIES.filter((a) => a.priority === 'high');
  const highDone = highPriorityAmenities.filter((a) => checkedAmenities[a.id]).length;

  return (
    <div className="space-y-4">
      {/* Current season badge */}
      <div className={`glass-card-sm border px-5 py-4 ${SEASON_INFO[currentSeason].bg}`}>
        <div className="flex items-center gap-3">
          <span className="text-3xl">{SEASON_INFO[currentSeason].emoji}</span>
          <div>
            <p className={`font-bold text-[15px] ${SEASON_INFO[currentSeason].color}`}>
              Currently: {SEASON_INFO[currentSeason].label}
            </p>
            <p className="text-xs text-slate-500">{SEASON_INFO[currentSeason].range}</p>
          </div>
        </div>
      </div>

      {/* Season selector */}
      <div className="flex gap-2">
        {SEASON_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSeason(tab.id)}
            className={`flex flex-1 flex-col items-center gap-0.5 rounded-2xl py-3 text-xs font-semibold border transition-all ${
              activeSeason === tab.id
                ? 'bg-ocean-600 text-white border-ocean-600 shadow-sm'
                : 'bg-white/70 text-slate-600 border-white/60 hover:bg-white shadow-glass'
            }`}
          >
            <span className="text-xl">{tab.emoji}</span>
            {tab.label}
            {tab.id === currentSeason && activeSeason !== tab.id && (
              <span className="text-[9px] opacity-60">now</span>
            )}
          </button>
        ))}
      </div>

      {/* Tips for selected season */}
      <div className="glass-card px-5 py-5">
        <p className="section-label">{info.emoji} {info.label} Tips</p>
        <div className="space-y-2">
          {info.tips.map((tip, i) => (
            <motion.div
              key={i}
              className="flex items-start gap-3"
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: i * 0.04 }}
            >
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-ocean-400" />
              <p className="text-sm text-slate-700 leading-relaxed">{tip}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Off-season amenity checklist — always visible */}
      <div className="glass-card px-5 py-5">
        <div className="flex items-center justify-between mb-1">
          <p className="section-label mb-0">❄️ Off-Season Amenity Checklist</p>
          <span className="text-[12px] font-bold text-slate-500">
            {amenityDone}/{OFFSEASON_AMENITIES.length}
          </span>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          Amenities that boost off-season bookings and command higher rates. Track what's ready.
        </p>

        {/* High priority */}
        <div className="mb-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-red-500 mb-2">
            High Impact · {highDone}/{highPriorityAmenities.length} ready
          </p>
          <div className="space-y-1.5">
            {OFFSEASON_AMENITIES.filter((a) => a.priority === 'high').map((amenity) => (
              <AmenityRow
                key={amenity.id}
                amenity={amenity}
                checked={!!checkedAmenities[amenity.id]}
                onToggle={() => toggleAmenity(amenity.id)}
              />
            ))}
          </div>
        </div>

        {/* Medium priority */}
        <div className="mb-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-500 mb-2">
            Medium Impact
          </p>
          <div className="space-y-1.5">
            {OFFSEASON_AMENITIES.filter((a) => a.priority === 'medium').map((amenity) => (
              <AmenityRow
                key={amenity.id}
                amenity={amenity}
                checked={!!checkedAmenities[amenity.id]}
                onToggle={() => toggleAmenity(amenity.id)}
              />
            ))}
          </div>
        </div>

        {/* Low priority */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Nice to Have
          </p>
          <div className="space-y-1.5">
            {OFFSEASON_AMENITIES.filter((a) => a.priority === 'low').map((amenity) => (
              <AmenityRow
                key={amenity.id}
                amenity={amenity}
                checked={!!checkedAmenities[amenity.id]}
                onToggle={() => toggleAmenity(amenity.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Amenity row sub-component ───────────────────────────────────────────────
function AmenityRow({
  amenity,
  checked,
  onToggle,
}: {
  amenity: (typeof OFFSEASON_AMENITIES)[number];
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <label
      className="flex cursor-pointer items-center gap-3 rounded-xl p-2 transition hover:bg-ocean/4"
      onClick={onToggle}
    >
      <div
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition ${
          checked ? 'border-green-500 bg-green-500' : 'border-slate-300 hover:border-green-400'
        }`}
      >
        {checked && (
          <svg viewBox="0 0 10 10" className="h-2.5 w-2.5">
            <path d="M1.5 5.5l2.5 2.5 4.5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          </svg>
        )}
      </div>
      <span className="text-lg leading-none">{amenity.icon}</span>
      <span
        className={`text-[13px] flex-1 ${
          checked ? 'text-slate-400 line-through' : 'text-slate-700 font-medium'
        }`}
      >
        {amenity.label}
      </span>
    </label>
  );
}
