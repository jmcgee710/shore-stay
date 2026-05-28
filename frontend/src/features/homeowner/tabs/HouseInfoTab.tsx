import { useState, FormEvent } from 'react';
import { useApi } from '../../../hooks/useApi';
import type { PropertyFull } from '../types';
import { ALL_TOWN_NAMES } from '../../listing/data/towns';

interface Props { property: PropertyFull; refetch: () => void; }

const AMENITY_OPTIONS = [
  'WiFi', 'AC', 'Washer/Dryer', 'Dishwasher', 'Pool', 'Hot tub', 'Outdoor shower',
  'BBQ grill', 'Fire pit', 'Deck/patio', 'Garage parking', 'Boat dock', 'Kayak/paddleboard',
  'Beach chairs', 'Beach badges', 'Baby gear', 'Game room', 'Smart TV', 'Bikes',
];

export function HouseInfoTab({ property, refetch }: Props) {
  const api = useApi();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    // Guest-facing fields
    wifiInfo: property.wifiInfo ?? '',
    parkingInfo: property.parkingInfo ?? '',
    rules: property.rules ?? '',
    // Listing browser fields
    town: property.town ?? '',
    bedrooms: property.bedrooms != null ? String(property.bedrooms) : '',
    bathrooms: property.bathrooms != null ? String(property.bathrooms) : '',
    petFriendly: property.petFriendly ?? false,
    beachSide: property.beachSide ?? '',
    amenities: (property.amenities ?? []) as string[],
    isPublished: property.isPublished ?? false,
    nightlyRate: property.nightlyRate != null ? String(property.nightlyRate) : '',
    coverPhotoUrl: property.coverPhotoUrl ?? '',
    ownerPhone: property.ownerPhone ?? '',
    ownerEmail: property.ownerEmail ?? '',
  });

  function setField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function toggleAmenity(a: string) {
    setField('amenities', form.amenities.includes(a)
      ? form.amenities.filter((x) => x !== a)
      : [...form.amenities, a]);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    await api.put(`/api/homeowner/properties/${property.id}`, {
      ...form,
      bedrooms: form.bedrooms ? parseInt(form.bedrooms, 10) : null,
      bathrooms: form.bathrooms ? parseFloat(form.bathrooms) : null,
      nightlyRate: form.nightlyRate ? parseFloat(form.nightlyRate) : null,
    });
    await refetch();
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  const inputCls = 'mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-ocean focus:ring-2 focus:ring-ocean/20';
  const labelCls = 'block text-sm font-semibold text-slate-700';

  return (
    <div>
      <h2 className="text-lg font-bold text-ocean">House Info</h2>
      <p className="mt-1 text-sm text-slate-500">Guest-facing info and your public listing details.</p>

      <form onSubmit={handleSubmit} className="mt-5 space-y-5">

        {/* ── Public Listing Section ── */}
        <div className="rounded-2xl bg-white p-6 shadow-sm space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-semibold text-ocean">Public listing</h3>
              <p className="text-xs text-slate-500 mt-0.5">Control what renters see on Shore Stay</p>
            </div>
            <label className="flex cursor-pointer items-center gap-2">
              <span className="text-sm font-medium text-slate-600">
                {form.isPublished ? 'Published' : 'Hidden'}
              </span>
              <div
                onClick={() => setField('isPublished', !form.isPublished)}
                className={`relative h-6 w-11 rounded-full transition-colors ${form.isPublished ? 'bg-ocean' : 'bg-slate-300'}`}
              >
                <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${form.isPublished ? 'translate-x-5' : ''}`} />
              </div>
            </label>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Town */}
            <div>
              <label className={labelCls}>Town</label>
              <select value={form.town} onChange={(e) => setField('town', e.target.value)} className={inputCls}>
                <option value="">Select town…</option>
                {ALL_TOWN_NAMES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {/* Beach side */}
            <div>
              <label className={labelCls}>Location type</label>
              <select value={form.beachSide} onChange={(e) => setField('beachSide', e.target.value)} className={inputCls}>
                <option value="">Select…</option>
                <option value="ocean">Oceanside</option>
                <option value="bay">Bayside</option>
                <option value="lagoon">Lagoon / canal</option>
                <option value="both">Ocean & Bay</option>
              </select>
            </div>

            {/* Bedrooms */}
            <div>
              <label className={labelCls}>Bedrooms</label>
              <input
                type="number" min={0} max={20}
                value={form.bedrooms}
                onChange={(e) => setField('bedrooms', e.target.value)}
                className={inputCls}
                placeholder="e.g. 4"
              />
            </div>

            {/* Bathrooms */}
            <div>
              <label className={labelCls}>Bathrooms</label>
              <input
                type="number" min={0} max={20} step={0.5}
                value={form.bathrooms}
                onChange={(e) => setField('bathrooms', e.target.value)}
                className={inputCls}
                placeholder="e.g. 2.5"
              />
            </div>

            {/* Nightly rate */}
            <div>
              <label className={labelCls}>Nightly rate (display only)</label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                <input
                  type="number" min={0}
                  value={form.nightlyRate}
                  onChange={(e) => setField('nightlyRate', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 pl-7 pr-3 py-2.5 text-sm outline-none focus:border-ocean focus:ring-2 focus:ring-ocean/20"
                  placeholder="350"
                />
              </div>
            </div>

            {/* Pet friendly */}
            <div className="flex items-center gap-3 pt-5">
              <input
                id="petFriendly"
                type="checkbox"
                checked={form.petFriendly}
                onChange={(e) => setField('petFriendly', e.target.checked)}
                className="h-4 w-4 rounded accent-ocean"
              />
              <label htmlFor="petFriendly" className="cursor-pointer text-sm font-medium text-slate-700">
                Pet friendly
              </label>
            </div>
          </div>

          {/* Cover photo URL */}
          <div>
            <label className={labelCls}>Cover photo URL</label>
            <input
              type="url"
              value={form.coverPhotoUrl}
              onChange={(e) => setField('coverPhotoUrl', e.target.value)}
              className={inputCls}
              placeholder="https://…"
            />
            {form.coverPhotoUrl && (
              <img src={form.coverPhotoUrl} alt="Cover preview" className="mt-2 h-32 rounded-xl object-cover" />
            )}
          </div>

          {/* Amenities */}
          <div>
            <label className={labelCls}>Amenities</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {AMENITY_OPTIONS.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => toggleAmenity(a)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                    form.amenities.includes(a)
                      ? 'border-ocean bg-ocean text-white'
                      : 'border-slate-200 text-slate-600 hover:border-ocean/40'
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          {/* Owner contact */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Contact phone (shown to renters)</label>
              <input
                type="tel"
                value={form.ownerPhone}
                onChange={(e) => setField('ownerPhone', e.target.value)}
                className={inputCls}
                placeholder="(609) 555-0100"
              />
            </div>
            <div>
              <label className={labelCls}>Contact email (shown to renters)</label>
              <input
                type="email"
                value={form.ownerEmail}
                onChange={(e) => setField('ownerEmail', e.target.value)}
                className={inputCls}
                placeholder="you@example.com"
              />
            </div>
          </div>
        </div>

        {/* ── Guest Info Section ── */}
        <div className="rounded-2xl bg-white p-6 shadow-sm space-y-5">
          <h3 className="font-semibold text-ocean">Guest companion info</h3>
          {[
            { field: 'wifiInfo' as const, label: '📶 WiFi', placeholder: 'Network: MyNetwork\nPassword: abc123', rows: 3 },
            { field: 'parkingInfo' as const, label: '🚗 Parking', placeholder: '2 spots in the driveway…', rows: 3 },
            { field: 'rules' as const, label: '📋 House Rules', placeholder: '• No smoking\n• Quiet hours after 10pm…', rows: 6 },
          ].map(({ field, label, placeholder, rows }) => (
            <div key={field}>
              <label className={labelCls}>{label}</label>
              <textarea
                rows={rows}
                value={form[field] as string}
                onChange={(e) => setField(field, e.target.value)}
                placeholder={placeholder}
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 font-mono text-sm outline-none focus:border-ocean focus:ring-2 focus:ring-ocean/20"
              />
            </div>
          ))}
        </div>

        <button
          type="submit" disabled={saving}
          className="rounded-full bg-ocean px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-ocean/90 disabled:opacity-60"
        >
          {saved ? '✓ Saved' : saving ? 'Saving…' : 'Save changes'}
        </button>
      </form>
    </div>
  );
}
