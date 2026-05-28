import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../context/AuthContext';
import type { PropertyFull } from './types';
import { HouseInfoTab } from './tabs/HouseInfoTab';
import { RoomsTab } from './tabs/RoomsTab';
import { BookingsTab } from './tabs/BookingsTab';
import { AppliancesTab } from './tabs/AppliancesTab';
import { MaintenanceTab } from './tabs/MaintenanceTab';
import { GuideManageTab } from './tabs/GuideManageTab';
import { OwnerHubTab } from './tabs/OwnerHubTab';
import { WatchersTab } from './tabs/WatchersTab';
import { OwnerPicksTab } from './tabs/OwnerPicksTab';

// ── Design tokens ────────────────────────────────────────────────────────────
const T = {
  oceanDeep: '#0a3457',
  ocean:     '#0f4c75',
  seafoam:   '#56cfe1',
  cream:     '#fbf7ee',
  bg:        '#fbf7ee',
  muted:     '#5b6b7a',
  ink:       '#0a1f33',
  line:      'rgba(15, 76, 117, 0.12)',
  green:     '#5a8a5e',
  coral:     'oklch(0.74 0.13 38)',
};

// ── Stroke icons ─────────────────────────────────────────────────────────────
const S = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p} />
);
export const DashIcon = {
  house:       (p: React.SVGProps<SVGSVGElement>) => <S {...p}><path d="M3 11l9-7 9 7v9a1 1 0 01-1 1h-5v-6h-6v6H4a1 1 0 01-1-1z"/></S>,
  calendar:    (p: React.SVGProps<SVGSVGElement>) => <S {...p}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></S>,
  compass:     (p: React.SVGProps<SVGSVGElement>) => <S {...p}><circle cx="12" cy="12" r="9"/><path d="M16 8l-2.5 5.5L8 16l2.5-5.5z"/></S>,
  bolt:        (p: React.SVGProps<SVGSVGElement>) => <S {...p}><path d="M13 3L4 14h6l-1 7 9-11h-6l1-7z"/></S>,
  shield:      (p: React.SVGProps<SVGSVGElement>) => <S {...p}><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z"/><path d="M9 12l2 2 4-4"/></S>,
  users:       (p: React.SVGProps<SVGSVGElement>) => <S {...p}><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.5 3-6 6.5-6s6.5 2.5 6.5 6"/><circle cx="17" cy="9" r="2.5"/><path d="M15.5 14.5c2.8.4 5 2.5 5 5.5"/></S>,
  receipt:     (p: React.SVGProps<SVGSVGElement>) => <S {...p}><path d="M5 3v18l2-1.5L9 21l2-1.5L13 21l2-1.5L17 21l2-1.5V3"/><path d="M8 8h8M8 12h8M8 16h5"/></S>,
  key:         (p: React.SVGProps<SVGSVGElement>) => <S {...p}><circle cx="8" cy="15" r="4"/><path d="M11 13l9-9M16 8l3 3"/></S>,
  star:        (p: React.SVGProps<SVGSVGElement>) => <S {...p}><path d="M12 2l2.9 6.3L22 9.3l-5.2 4.7L18.2 21 12 17.6 5.8 21l1.4-7L2 9.3l7.1-1z"/></S>,
  qr:          (p: React.SVGProps<SVGSVGElement>) => <S {...p}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3M21 14v0M14 21h0M17 21h4M21 17v4"/></S>,
  check:       (p: React.SVGProps<SVGSVGElement>) => <S strokeWidth="2" {...p}><path d="M5 12l5 5 9-11"/></S>,
};

// ── FakeQR (shared) ───────────────────────────────────────────────────────────
export function FakeQR({ size = 170 }: { size?: number }) {
  const N = 17;
  const cells = useMemo(() => {
    const arr: boolean[] = [];
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
      const corner = (r < 3 && c < 3) || (r < 3 && c > N - 4) || (r > N - 4 && c < 3);
      const cornerInner = (r === 1 && c === 1) || (r === 1 && c === N-2) || (r === N-2 && c === 1);
      const cornerEdge = ((r === 0 || r === 2) && (c < 3 || c > N-4)) ||
        ((r === N-1 || r === N-3) && c < 3) ||
        ((c === 0 || c === 2) && (r < 3 || r > N-4)) ||
        ((c === N-1 || c === N-3) && r < 3);
      arr.push(corner ? (cornerEdge || cornerInner) : ((r * 7 + c * 13 + r*c) % 5 < 2));
    }
    return arr;
  }, []);
  return (
    <div style={{ width: size, height: size, display: 'grid', gridTemplateColumns: `repeat(${N}, 1fr)`, gap: 1, background: T.cream, padding: 8 }}>
      {cells.map((on, i) => <div key={i} style={{ background: on ? T.oceanDeep : T.cream, borderRadius: 1 }} />)}
    </div>
  );
}

// ── PageHeader (shared across tabs) ──────────────────────────────────────────
export function PageHeader({ eyebrow, title, sub, action }: { eyebrow?: string; title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28, gap: 16 }}>
      <div>
        {eyebrow && <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: T.ocean, marginBottom: 8 }}>{eyebrow}</div>}
        <h1 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 36, fontWeight: 400, lineHeight: 1.05, letterSpacing: '-0.03em', color: T.oceanDeep, margin: 0 }}>{title}</h1>
        {sub && <div style={{ fontSize: 14, color: T.muted, marginTop: 8, maxWidth: 600, lineHeight: 1.55 }}>{sub}</div>}
      </div>
      {action}
    </div>
  );
}

// ── Tab definitions ───────────────────────────────────────────────────────────
const TABS = [
  { id: 'info',        label: 'House Info',    icon: DashIcon.house },
  { id: 'bookings',    label: 'Bookings',      icon: DashIcon.calendar },
  { id: 'rooms',       label: 'Rooms',         icon: DashIcon.compass },
  { id: 'appliances',  label: 'Appliances',    icon: DashIcon.bolt },
  { id: 'maintenance', label: 'Maintenance',   icon: DashIcon.shield },
  { id: 'guide',       label: 'Guest guide',   icon: DashIcon.compass },
  { id: 'picks',       label: 'Owner\'s Picks',icon: DashIcon.star },
  { id: 'watchers',    label: 'Watchers',      icon: DashIcon.users },
  { id: 'hub',         label: 'Owner Hub',     icon: DashIcon.receipt },
  { id: 'settings',    label: 'Settings',      icon: DashIcon.key },
] as const;
type TabId = (typeof TABS)[number]['id'];

function patternAngle(id: string) {
  return (id.split('').reduce((s, c) => s + c.charCodeAt(0), 0) % 4) * 30 + 25;
}

export default function PropertyDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, logout } = useAuth();
  const api = useApi();
  const [property, setProperty] = useState<PropertyFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>('info');

  const refetch = useCallback(() => {
    if (!id) return;
    return api.get<PropertyFull>(`/api/homeowner/properties/${id}`).then(setProperty);
  }, [id]);

  useEffect(() => { refetch()?.finally(() => setLoading(false)); }, [refetch]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {[0,1,2].map(i => (
            <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: T.seafoam, animation: `pulse 1.2s ease-in-out ${i*0.2}s infinite` }} />
          ))}
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div style={{ minHeight: '100vh', background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ padding: 32, borderRadius: 18, background: T.cream, border: `1px solid ${T.line}`, textAlign: 'center' }}>
          <p style={{ color: T.muted }}>Property not found.</p>
          <Link to="/homeowner" style={{ display: 'inline-block', marginTop: 12, fontSize: 13, fontWeight: 600, color: T.ocean, textDecoration: 'none' }}>← Back to dashboard</Link>
        </div>
      </div>
    );
  }

  const deg = patternAngle(property.id);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: T.bg, fontFamily: 'Inter Tight, Inter, sans-serif' }}>

      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside style={{ width: 240, flexShrink: 0, background: T.oceanDeep, color: T.cream, display: 'flex', flexDirection: 'column', padding: '20px 14px' }}>
        {/* Logo + wordmark */}
        <div style={{ padding: '4px 10px 22px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/logo.png" alt="Shore Stay" style={{ height: 32, width: 32, objectFit: 'contain' }} />
          <span style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 17, fontWeight: 500, letterSpacing: '-0.01em' }}>
            Shore<span style={{ fontWeight: 300 }}>Stay</span>
          </span>
        </div>

        {/* Back to portfolio */}
        <Link to="/homeowner" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 8, marginBottom: 8, fontSize: 12, fontWeight: 500, color: 'rgba(251,247,238,0.55)', textDecoration: 'none' }}>
          ← All properties
        </Link>

        {/* Property thumb */}
        <div style={{ padding: '10px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: `repeating-linear-gradient(${deg}deg, #a8e3ec 0 6px, #f7e6c9 6px 12px)`, opacity: 0.7, flexShrink: 0 }} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 14, fontWeight: 500, letterSpacing: '-0.01em', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{property.name}</div>
            <div style={{ fontSize: 10.5, opacity: 0.5, marginTop: 2 }}>{property.town ?? property.address.split(',')[1]?.trim()}</div>
          </div>
        </div>

        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.4, padding: '4px 12px 6px' }}>Property</div>

        {/* Nav */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {TABS.map(t => {
            const isActive = t.id === activeTab;
            const Ic = t.icon;
            return (
              <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 12px', borderRadius: 8,
                fontSize: 13.5, fontWeight: isActive ? 600 : 500,
                color: isActive ? T.cream : 'rgba(251,247,238,0.65)',
                background: isActive ? 'rgba(86,207,225,0.15)' : 'transparent',
                textAlign: 'left', cursor: 'pointer', border: 'none', width: '100%',
                transition: 'all 150ms',
              }}>
                <Ic style={{ width: 16, height: 16, color: isActive ? T.seafoam : 'currentColor', flexShrink: 0 }} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </nav>

        <div style={{ flex: 1 }} />

        {/* Concierge card */}
        <div style={{ padding: 12, borderRadius: 12, background: 'rgba(255,255,255,0.06)', marginBottom: 12 }}>
          <div style={{ fontSize: 11, opacity: 0.55, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 5 }}>Need a hand?</div>
          <div style={{ fontSize: 12.5, fontWeight: 500, lineHeight: 1.4, marginBottom: 8 }}>Concierge text line, 7am–10pm.</div>
          <div style={{ display: 'inline-block', padding: '6px 12px', borderRadius: 999, background: T.seafoam, color: T.oceanDeep, fontSize: 11, fontWeight: 600 }}>Text concierge</div>
        </div>

        {/* User */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: T.ocean, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
              {user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div style={{ fontSize: 12, fontWeight: 500 }}>{user?.name?.split(' ')[0]}</div>
          </div>
          <button onClick={logout} style={{ fontSize: 11, opacity: 0.4, color: T.cream, cursor: 'pointer', background: 'none', border: 'none' }}>Sign out</button>
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 32px', background: T.cream, borderBottom: `1px solid ${T.line}`, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: `repeating-linear-gradient(${deg}deg, #a8e3ec 0 6px, #f7e6c9 6px 12px)`, opacity: 0.7 }} />
            <div>
              <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.muted }}>Viewing</div>
              <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 18, fontWeight: 500, color: T.oceanDeep, letterSpacing: '-0.01em' }}>{property.name}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button
              onClick={() => setActiveTab('bookings')}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px', borderRadius: 999, background: T.bg, border: `1px solid ${T.line}`, fontSize: 13, fontWeight: 500, color: T.oceanDeep, cursor: 'pointer' }}>
              <DashIcon.qr style={{ width: 15, height: 15 }} /> Generate QR
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px', borderRadius: 999, background: T.oceanDeep, color: T.cream, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: 'none' }}>
              <DashIcon.calendar style={{ width: 15, height: 15 }} /> New booking
            </button>
          </div>
        </div>

        {/* Tab content */}
        <div style={{ flex: 1, overflow: 'auto', padding: '32px 36px 48px' }}>
          {activeTab === 'info'        && <HouseInfoTab property={property} refetch={refetch} />}
          {activeTab === 'bookings'    && <BookingsTab property={property} refetch={refetch} />}
          {activeTab === 'rooms'       && <RoomsTab property={property} refetch={refetch} />}
          {activeTab === 'appliances'  && <AppliancesTab property={property} refetch={refetch} />}
          {activeTab === 'maintenance' && <MaintenanceTab property={property} refetch={refetch} />}
          {activeTab === 'guide'       && <GuideManageTab property={property} refetch={refetch} />}
          {activeTab === 'picks'       && <OwnerPicksTab propertyId={property.id} />}

          {activeTab === 'watchers'    && <WatchersTab property={property} refetch={refetch} />}
          {activeTab === 'hub'         && <OwnerHubTab property={property} />}
          {activeTab === 'settings'    && (
            <div>
              <PageHeader eyebrow="Settings" title="Account & billing" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div style={{ padding: 18, borderRadius: 14, background: T.cream, border: `1px solid ${T.line}` }}>
                  <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: T.muted, marginBottom: 8 }}>Account</div>
                  <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 18, fontWeight: 500, color: T.oceanDeep }}>{user?.name}</div>
                  <div style={{ fontSize: 13, color: T.muted, marginTop: 2 }}>{user?.email}</div>
                </div>
                <div style={{ padding: 18, borderRadius: 14, background: T.cream, border: `1px solid ${T.line}` }}>
                  <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: T.muted, marginBottom: 8 }}>Plan</div>
                  <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 18, fontWeight: 500, color: T.oceanDeep }}>Coastal · 3 properties</div>
                  <div style={{ fontSize: 13, color: T.muted, marginTop: 2 }}>$369/yr · renews Jan 2027</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
