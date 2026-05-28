import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ALL_TOWN_NAMES } from '../data/towns';

interface Props {
  compact?: boolean;
  initialValues?: {
    town?: string;
    checkin?: string;
    checkout?: string;
    beds?: string;
    pets?: boolean;
  };
}

export default function SearchBar({ compact = false, initialValues = {} }: Props) {
  const navigate = useNavigate();
  const [town, setTown] = useState(initialValues.town ?? '');
  const [checkin, setCheckin] = useState(initialValues.checkin ?? '');
  const [checkout, setCheckout] = useState(initialValues.checkout ?? '');
  const [beds, setBeds] = useState(initialValues.beds ?? '');
  const [pets, setPets] = useState(initialValues.pets ?? false);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (town) params.set('town', town);
    if (checkin) params.set('checkin', checkin);
    if (checkout) params.set('checkout', checkout);
    if (beds) params.set('beds', beds);
    if (pets) params.set('pets', 'true');
    navigate(`/browse?${params.toString()}`);
  }

  const selectCls = 'w-full rounded-xl border border-white/50 bg-white/70 px-3 py-2.5 text-sm text-ocean backdrop-blur-sm focus:border-ocean/40 focus:bg-white/90 transition';

  if (compact) {
    return (
      <form onSubmit={handleSearch} className="flex items-center gap-2">
        <select value={town} onChange={(e) => setTown(e.target.value)} className={`${selectCls} min-w-0 flex-1`}>
          <option value="">Any town</option>
          {ALL_TOWN_NAMES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={beds} onChange={(e) => setBeds(e.target.value)} className={`${selectCls} w-24`}>
          <option value="">Beds</option>
          {[1,2,3,4,5,6].map((n) => <option key={n} value={n}>{n}+</option>)}
        </select>
        <button type="submit" className="pill-btn-primary shrink-0 px-5">
          Search
        </button>
      </form>
    );
  }

  return (
    <form
      onSubmit={handleSearch}
      className="glass-card flex flex-col gap-4 p-5 sm:flex-row sm:items-end sm:gap-3"
    >
      <div className="flex-1">
        <label className="mb-1.5 block text-xs font-semibold text-ocean/70">Town</label>
        <select value={town} onChange={(e) => setTown(e.target.value)} className={selectCls}>
          <option value="">Any town on LBI</option>
          {ALL_TOWN_NAMES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <div className="flex-1">
        <label className="mb-1.5 block text-xs font-semibold text-ocean/70">Check-in</label>
        <input type="date" value={checkin} onChange={(e) => setCheckin(e.target.value)} className={selectCls} />
      </div>

      <div className="flex-1">
        <label className="mb-1.5 block text-xs font-semibold text-ocean/70">Check-out</label>
        <input type="date" value={checkout} onChange={(e) => setCheckout(e.target.value)} className={selectCls} />
      </div>

      <div className="w-28">
        <label className="mb-1.5 block text-xs font-semibold text-ocean/70">Beds</label>
        <select value={beds} onChange={(e) => setBeds(e.target.value)} className={selectCls}>
          <option value="">Any</option>
          {[1,2,3,4,5,6].map((n) => <option key={n} value={n}>{n}+</option>)}
        </select>
      </div>

      <label className="flex cursor-pointer items-center gap-2 pb-2.5 text-sm font-medium text-ocean/80 whitespace-nowrap">
        <input
          type="checkbox"
          checked={pets}
          onChange={(e) => setPets(e.target.checked)}
          className="h-4 w-4 rounded accent-ocean"
        />
        Pets OK
      </label>

      <button type="submit" className="pill-btn-primary shrink-0 px-7 py-2.5">
        Search
      </button>
    </form>
  );
}
