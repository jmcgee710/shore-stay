import { ALL_TOWN_NAMES } from '../data/towns';

const T = {
  oceanDeep: '#0a3457', ocean: '#0f4c75', seafoam: '#56cfe1',
  cream: '#fbf7ee', bg: '#fbf7ee', muted: '#5b6b7a', line: 'rgba(15,76,117,0.12)',
};

interface Filters {
  town: string; minBeds: string; minBaths: string; pets: boolean; beachSide: string;
}
interface Props { filters: Filters; onChange: (f: Filters) => void; }

const sel = { width: '100%', borderRadius: 10, border: `1px solid ${T.line}`, background: T.cream, padding: '9px 12px', fontSize: 13.5, fontFamily: 'inherit', outline: 'none', color: T.oceanDeep } as const;
const lbl = { display: 'block', fontSize: 10.5, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: T.muted, marginBottom: 8 } as const;

export default function FilterPanel({ filters, onChange }: Props) {
  function set<K extends keyof Filters>(key: K, val: Filters[K]) {
    onChange({ ...filters, [key]: val });
  }

  return (
    <div style={{ background: T.cream, borderRadius: 16, border: `1px solid ${T.line}`, padding: '20px 18px', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: T.muted, margin: 0 }}>Filters</p>

      {/* Town */}
      <div>
        <label style={lbl}>Town</label>
        <select value={filters.town} onChange={e => set('town', e.target.value)} style={sel}>
          <option value="">Any town</option>
          {ALL_TOWN_NAMES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {/* Beds */}
      <div>
        <label style={lbl}>Bedrooms</label>
        <select value={filters.minBeds} onChange={e => set('minBeds', e.target.value)} style={sel}>
          <option value="">Any</option>
          {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n}+</option>)}
        </select>
      </div>

      {/* Baths */}
      <div>
        <label style={lbl}>Bathrooms</label>
        <select value={filters.minBaths} onChange={e => set('minBaths', e.target.value)} style={sel}>
          <option value="">Any</option>
          {[1,2,3,4].map(n => <option key={n} value={n}>{n}+</option>)}
        </select>
      </div>

      {/* Beach side */}
      <div>
        <label style={lbl}>Location type</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { value: '', label: 'Any' },
            { value: 'ocean', label: '🌊 Oceanside' },
            { value: 'bay', label: '⚓ Bayside' },
            { value: 'lagoon', label: '🛶 Lagoon / canal' },
          ].map(({ value, label }) => (
            <label key={value} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13.5, color: filters.beachSide === value ? T.oceanDeep : T.muted, fontWeight: filters.beachSide === value ? 600 : 400 }}>
              <input type="radio" name="beachSide" value={value} checked={filters.beachSide === value} onChange={() => set('beachSide', value)}
                style={{ accentColor: T.ocean, width: 15, height: 15 }} />
              {label}
            </label>
          ))}
        </div>
      </div>

      {/* Pets */}
      <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13.5, color: T.muted, fontWeight: filters.pets ? 600 : 400 }}>
        <input type="checkbox" checked={filters.pets} onChange={e => set('pets', e.target.checked)}
          style={{ accentColor: T.ocean, width: 15, height: 15 }} />
        <span style={{ color: T.oceanDeep }}>Pet friendly only</span>
      </label>

      {/* Clear */}
      <button onClick={() => onChange({ town: '', minBeds: '', minBaths: '', pets: false, beachSide: '' })}
        style={{ padding: '9px', borderRadius: 999, border: `1px solid ${T.line}`, background: 'transparent', fontSize: 13, cursor: 'pointer', color: T.muted, marginTop: 4 }}>
        Clear filters
      </button>
    </div>
  );
}
