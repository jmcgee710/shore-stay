import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

// ── Design tokens (match prototype CSS vars exactly) ─────────────────────────
const T = {
  oceanDeep:   '#0a3457',
  ocean:       '#0f4c75',
  seafoam:     '#56cfe1',
  seafoamSoft: '#a8e3ec',
  sand:        '#fef3e2',
  sandWarm:    '#f7e6c9',
  cream:       '#fbf7ee',
  bg:          '#fbf7ee',
  muted:       '#5b6b7a',
  ink:         '#0a1f33',
  line:        'rgba(15, 76, 117, 0.12)',
  coral:       'oklch(0.74 0.13 38)',
  green:       '#5a8a5e',
};

// ── Stroke icons (ported from icons.jsx) ─────────────────────────────────────
const SVG = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props} />
);
const Icon = {
  check: (p: React.SVGProps<SVGSVGElement>) => <SVG strokeWidth="2" {...p}><path d="M5 12l5 5 9-11" /></SVG>,
  arrow: (p: React.SVGProps<SVGSVGElement>) => <SVG strokeWidth="1.8" {...p}><path d="M5 12h14M13 6l6 6-6 6" /></SVG>,
  bolt:  (p: React.SVGProps<SVGSVGElement>) => <SVG {...p}><path d="M13 3L4 14h6l-1 7 9-11h-6l1-7z" /></SVG>,
  star:  (p: React.SVGProps<SVGSVGElement>) => <svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M12 2l2.9 6.3L22 9.3l-5.2 4.7L18.2 21 12 17.6 5.8 21l1.4-7L2 9.3l7.1-1z" /></svg>,
};

// ── FakeQR (ported from showcase.jsx) ────────────────────────────────────────
function FakeQR() {
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
    <div style={{ width: 170, height: 170, display: 'grid', gridTemplateColumns: `repeat(${N}, 1fr)`, gap: 1, background: T.cream }}>
      {cells.map((on, i) => <div key={i} style={{ background: on ? T.oceanDeep : T.cream, borderRadius: 1 }} />)}
    </div>
  );
}

// ── Hero waves ────────────────────────────────────────────────────────────────
function HeroWaves() {
  return (
    <svg className="absolute inset-0 h-full w-full opacity-20" viewBox="0 0 1440 600" preserveAspectRatio="xMidYMid slice" aria-hidden>
      {[0, 80, 160, 240, 320].map((offset, i) => (
        <motion.path key={i} stroke="rgba(86,207,225,0.6)" strokeWidth="1.5" fill="none"
          d={`M-100,${200+offset} C200,${160+offset} 400,${240+offset} 700,${200+offset} C1000,${160+offset} 1200,${240+offset} 1540,${200+offset}`}
          animate={{ d: [
            `M-100,${200+offset} C200,${160+offset} 400,${240+offset} 700,${200+offset} C1000,${160+offset} 1200,${240+offset} 1540,${200+offset}`,
            `M-100,${210+offset} C250,${175+offset} 450,${225+offset} 720,${205+offset} C1020,${178+offset} 1250,${228+offset} 1540,${208+offset}`,
            `M-100,${200+offset} C200,${160+offset} 400,${240+offset} 700,${200+offset} C1000,${160+offset} 1200,${240+offset} 1540,${200+offset}`,
          ]}}
          transition={{ repeat: Infinity, duration: 6 + i * 1.2, ease: 'easeInOut' }}
        />
      ))}
    </svg>
  );
}

// ── Mockup card (hero right side) ─────────────────────────────────────────────
function MockupCard() {
  return (
    <motion.div className="relative hidden lg:block" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.8 }}>
      <div style={{ position: 'absolute', top: -16, right: 0, borderRadius: 999, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.1)', padding: '4px 12px', fontSize: 11, fontWeight: 700, color: 'white', backdropFilter: 'blur(8px)', letterSpacing: '0.05em' }}>
        OCCUPIED · Aug 8–15
      </div>
      <div style={{ width: 320, borderRadius: 24, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.1)', padding: 22, backdropFilter: 'blur(12px)' }}>
        <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>Property · LBI-204</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
          <h3 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 22, fontWeight: 500, color: 'white' }}>The Salt Box</h3>
          <span style={{ background: 'rgba(86,207,225,0.2)', color: T.seafoam, fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 5, letterSpacing: '0.05em' }}>ACTIVE</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginTop: 18 }}>
          {[['THIS WEEK', '$4,820'], ['OCCUPANCY', '92%'], ['NIGHTS', '6']].map(([l, v]) => (
            <div key={l}>
              <p style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>{l}</p>
              <p style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 20, fontWeight: 700, color: 'white', marginTop: 2 }}>{v}</p>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
          {[
            { icon: '⬛', title: 'Guest QR sent', sub: 'Henderson party · 6 guests · arriving' },
            { icon: '👤', title: 'Watch report', sub: 'Ray M. · 2 hours ago' },
          ].map((item) => (
            <div key={item.title} style={{ display: 'flex', gap: 12, alignItems: 'center', background: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: '10px 12px' }}>
              <span style={{ fontSize: 13 }}>{item.icon}</span>
              <div>
                <p style={{ fontSize: 12, fontWeight: 600, color: 'white' }}>{item.title}</p>
                <p style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.4)', marginTop: 1 }}>{item.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ── Features section ──────────────────────────────────────────────────────────
const FEATURES = [
  { icon: '⊞', title: 'Zero-friction guest access', body: 'Print a QR, hand it to your guests. House rules, WiFi, rooms, and a local guide — no app, no login.', n: '01' },
  { icon: '🛡', title: 'Off-season home watch', body: 'Storm checks, weekly walkthroughs, and contractor dispatch — handled by trusted local watchers.', n: '02' },
  { icon: '☰', title: 'Compliance, quietly tracked', body: 'LBI permits, occupancy tax quarters and your document vault all in one calm calendar.', n: '03' },
  { icon: '📅', title: 'Bookings & turn days', body: 'See every check-in, gap day, and cleaner schedule across your whole portfolio at a glance.', n: '04' },
  { icon: '👥', title: 'Group trip planner', body: 'Guests plan dinners, surf lessons and beach days inside the booking — no group chat chaos.', n: '05' },
  { icon: '⚡', title: 'Hands-off mode', body: 'Authorize watchers to greenlight contractors under a cap. Wake up to a fixed roof, not a panicked call.', n: '06' },
];

// ── Roles section (tabbed with UI peeks) ──────────────────────────────────────
const ROLES_DATA = {
  owner: {
    label: 'Owners',
    lede: 'Run your shore house like the operation it is.',
    bullets: [
      'Property dashboard with bookings, rooms, appliances and maintenance',
      'Generate guest QR codes in seconds',
      'Track LBI tax quarters and compliance documents',
      'Authorize a watcher and pick what they can dispatch',
    ],
    cta: 'Open the homeowner dashboard',
    href: '/login',
  },
  watcher: {
    label: 'Watchers',
    lede: 'Storm-check, photograph, dispatch — from the truck.',
    bullets: [
      'Properties assigned to you in one feed',
      'Submit walkthrough reports with photos in 60 seconds',
      'Log storm alerts with severity and damage notes',
      'Hands-off mode lets you greenlight repairs under a cap',
    ],
    cta: 'Open the watcher view',
    href: '/register',
  },
  guest: {
    label: 'Guests',
    lede: 'Scan a QR. Everything you need, nothing you don\'t.',
    bullets: [
      'House rules, WiFi password and room layout',
      'Local guide curated by your host — bays, bites, beaches',
      'Trip Planner: anyone with a 4-digit PIN can add events',
      'No app, no account, no friction',
    ],
    cta: 'Preview the renter hub',
    href: '/stay/tk-9f3a-22c1',
  },
};

function OwnerPeek() {
  const props = [
    { name: 'The Salt Box', town: 'Beach Haven · LBI', occ: 92, status: 'Occupied', deg: 25 },
    { name: 'Dune Lullaby', town: 'Surf City · LBI', occ: 78, status: 'Turn day', deg: 70 },
    { name: 'Northeasterly', town: 'Loveladies · LBI', occ: 64, status: 'Vacant', deg: 115 },
  ];
  return (
    <div style={{ background: T.cream, borderRadius: 18, padding: 22, color: T.ink, boxShadow: '0 40px 100px -20px rgba(0,0,0,0.5)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 19, fontWeight: 500, color: T.oceanDeep, letterSpacing: '-0.02em' }}>Properties</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <span style={{ padding: '5px 10px', borderRadius: 6, background: 'color-mix(in oklab, #56cfe1 25%, transparent)', color: T.oceanDeep, fontSize: 11, fontWeight: 600 }}>3 active</span>
          <span style={{ padding: '5px 10px', borderRadius: 6, background: T.sand, color: T.oceanDeep, fontSize: 11, fontWeight: 600 }}>+ Add</span>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {props.map((p) => (
          <div key={p.name} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto auto', alignItems: 'center', gap: 14, padding: 14, background: T.bg, borderRadius: 12, border: `1px solid ${T.line}` }}>
            <div style={{ width: 42, height: 42, borderRadius: 10, background: `repeating-linear-gradient(${p.deg}deg, ${T.seafoamSoft} 0 6px, ${T.seafoam} 6px 12px)`, opacity: 0.55 }} />
            <div>
              <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 16, fontWeight: 500, color: T.oceanDeep }}>{p.name}</div>
              <div style={{ fontSize: 11.5, color: T.muted, marginTop: 1 }}>{p.town}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: T.muted }}>Occupancy</div>
              <div style={{ fontSize: 14, fontWeight: 600, fontFamily: 'Fraunces, Georgia, serif', color: T.oceanDeep }}>{p.occ}%</div>
            </div>
            <div style={{ padding: '4px 9px', borderRadius: 5, fontSize: 10.5, fontWeight: 700, letterSpacing: '0.04em', background: p.status === 'Occupied' ? 'color-mix(in oklab, #56cfe1 30%, transparent)' : p.status === 'Turn day' ? T.sandWarm : 'rgba(15,76,117,0.08)', color: T.oceanDeep }}>
              {p.status.toUpperCase()}
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 18, padding: 14, borderRadius: 12, background: T.oceanDeep, color: T.cream, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 11, opacity: 0.7, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Q3 occupancy tax</div>
          <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 18, marginTop: 2 }}>Filed · $4,210.00</div>
        </div>
        <Icon.check style={{ width: 22, height: 22, color: T.seafoam }} />
      </div>
    </div>
  );
}

function WatcherPeek() {
  const rows = [
    { title: 'The Salt Box', sub: 'Walkthrough · Mon 9:14am', tag: 'Good', tagColor: T.seafoam, done: true },
    { title: 'Dune Lullaby', sub: 'Storm check · Tue 6:42pm', tag: 'Fair', tagColor: T.sandWarm, done: true },
    { title: 'Northeasterly', sub: 'Walkthrough · in progress', tag: 'Now', tagColor: T.coral, active: true },
    { title: 'Sandbar Cottage', sub: 'Walkthrough · scheduled Fri', tag: '—', tagColor: 'rgba(15,76,117,0.1)' },
  ];
  return (
    <div style={{ background: T.cream, borderRadius: 18, padding: 22, color: T.ink, boxShadow: '0 40px 100px -20px rgba(0,0,0,0.5)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <div>
          <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 19, fontWeight: 500, color: T.oceanDeep }}>This week's runs</div>
          <div style={{ fontSize: 11.5, color: T.muted, marginTop: 2 }}>Ray Mitchell · Beach Haven</div>
        </div>
        <div style={{ padding: '6px 12px', borderRadius: 999, background: T.oceanDeep, color: T.cream, fontSize: 11, fontWeight: 600 }}>Hands-off · ON</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {rows.map((r) => (
          <div key={r.title} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', alignItems: 'center', gap: 14, padding: 12, background: r.active ? 'color-mix(in oklab, #56cfe1 12%, #fbf7ee)' : T.bg, borderRadius: 10, border: r.active ? '1px solid color-mix(in oklab, #56cfe1 50%, transparent)' : `1px solid ${T.line}` }}>
            <div style={{ width: 22, height: 22, borderRadius: '50%', background: r.done ? T.oceanDeep : r.active ? T.coral : 'transparent', border: !r.done && !r.active ? `1.5px dashed ${T.line}` : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.cream }}>
              {r.done && <Icon.check style={{ width: 12, height: 12 }} />}
            </div>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: T.oceanDeep }}>{r.title}</div>
              <div style={{ fontSize: 11.5, color: T.muted }}>{r.sub}</div>
            </div>
            <div style={{ padding: '3px 9px', borderRadius: 6, fontSize: 10.5, fontWeight: 700, background: r.tagColor, color: T.oceanDeep }}>{r.tag}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 18, padding: 14, borderRadius: 12, background: T.sand, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: T.coral, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.cream, flexShrink: 0 }}>
          <Icon.bolt style={{ width: 16, height: 16 }} />
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: T.oceanDeep }}>Storm alert · Northeasterly</div>
          <div style={{ fontSize: 12, color: T.muted, marginTop: 2, lineHeight: 1.4 }}>Wind damage to gutter. Auto-dispatching roofer (under $500 cap).</div>
        </div>
      </div>
    </div>
  );
}

function GuestPeek() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: 300, height: 560, background: T.oceanDeep, borderRadius: 36, padding: 8, boxShadow: '0 40px 100px -20px rgba(0,0,0,0.5)', position: 'relative' }}>
        <div style={{ width: '100%', height: '100%', background: T.cream, borderRadius: 28, overflow: 'hidden', position: 'relative', color: T.ink }}>
          <div style={{ position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)', width: 80, height: 20, borderRadius: 10, background: T.oceanDeep, zIndex: 5 }} />
          <div style={{ height: 170, background: `linear-gradient(180deg, color-mix(in oklab, ${T.ocean} 80%, transparent), ${T.oceanDeep}), repeating-linear-gradient(135deg, rgba(255,255,255,0.05) 0 8px, rgba(255,255,255,0.1) 8px 16px)`, position: 'relative' }}>
            <div style={{ position: 'absolute', inset: 0, padding: '40px 16px 16px', color: T.cream, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
              <div style={{ fontSize: 9.5, opacity: 0.7, letterSpacing: '0.15em', textTransform: 'uppercase' }}>Welcome to</div>
              <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 24, fontWeight: 500, letterSpacing: '-0.02em', marginTop: 2 }}>The Salt Box</div>
              <div style={{ fontSize: 10.5, opacity: 0.7, marginTop: 2 }}>Beach Haven · 4 BR · sleeps 8</div>
            </div>
          </div>
          <div style={{ display: 'flex', padding: '0 10px', borderBottom: `1px solid ${T.line}`, gap: 2 }}>
            {['Rules','Info','Rooms','Plan','Guide'].map((t, i) => (
              <div key={t} style={{ padding: '11px 7px', fontSize: 11, fontWeight: i === 3 ? 600 : 500, color: i === 3 ? T.oceanDeep : T.muted, borderBottom: i === 3 ? `2px solid ${T.oceanDeep}` : 'none', marginBottom: -1 }}>{t}</div>
            ))}
          </div>
          <div style={{ padding: 14 }}>
            <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 15, fontWeight: 500, color: T.oceanDeep, marginBottom: 10 }}>Trip plan · 6 in group</div>
            {[
              { day: 'SAT', what: 'Arrive · grocery run', who: 'Alex' },
              { day: 'SUN', what: 'Sunrise on the bay', who: 'Maya' },
              { day: 'MON', what: 'Tucker\'s Tavern · 7pm', who: 'Alex' },
              { day: 'TUE', what: 'Surf lesson · 9am', who: 'Jamie' },
            ].map((e) => (
              <div key={e.day} style={{ display: 'flex', gap: 10, padding: '9px 0', borderBottom: `1px solid ${T.line}` }}>
                <div style={{ width: 32, textAlign: 'center', fontSize: 9.5, fontWeight: 700, letterSpacing: '0.05em', color: T.ocean, fontFamily: 'ui-monospace, monospace', paddingTop: 2 }}>{e.day}</div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: T.ink }}>{e.what}</div>
                  <div style={{ fontSize: 10, color: T.muted, marginTop: 1 }}>added by {e.who}</div>
                </div>
              </div>
            ))}
            <div style={{ marginTop: 12, padding: '9px 12px', border: `1px dashed ${T.line}`, borderRadius: 10, fontSize: 11.5, color: T.muted, textAlign: 'center' }}>+ add an event</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Pricing ───────────────────────────────────────────────────────────────────
const PRICING = [
  { name: 'Sandy', price: '$179', desc: '1 property', features: ['Public listing', 'QR guest companion', 'Availability calendar', 'Standard placement'] },
  { name: 'Coastal', price: '$369', desc: 'Up to 3 properties', features: ['Everything in Sandy', 'Elevated search placement', 'Guest analytics', 'Trip planner & group access'], highlight: true },
  { name: 'Island', price: '$749', desc: 'Unlimited properties', features: ['Everything in Coastal', 'Top search placement', 'Virtual room builder', 'Compliance tracker', 'Maintenance rolodex', 'Document vault'] },
];

// ── Page ──────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [featuredCount, setFeaturedCount] = useState(0);
  const [activeRole, setActiveRole] = useState<'owner' | 'watcher' | 'guest'>('owner');

  useEffect(() => {
    const api = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';
    fetch(`${api}/api/public/listings?limit=1`)
      .then(r => r.json()).then(d => setFeaturedCount(d.total ?? 0)).catch(() => {});
  }, []);

  const role = ROLES_DATA[activeRole];

  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.ink, fontFamily: 'Inter Tight, Inter, sans-serif' }}>

      {/* ── Nav ─────────────────────────────────────────────── */}
      <nav className="glass-nav fixed inset-x-0 top-0 z-50 flex items-center justify-between px-8 py-3.5">
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <img src="/logo.png" alt="Shore Stay" style={{ height: 34, width: 34, objectFit: 'contain' }} />
          <span style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 18, fontWeight: 500, color: T.oceanDeep, letterSpacing: '-0.01em' }}>Shore<span style={{ fontWeight: 300 }}>Stay</span></span>
        </Link>
        <div className="hidden md:flex" style={{ gap: 28, fontSize: 14, fontWeight: 500, color: T.muted, alignItems: 'center' }}>
          <Link to="/browse" style={{ color: T.muted, textDecoration: 'none' }}>Browse</Link>
          <a href="#features" style={{ color: T.muted, textDecoration: 'none' }}>Platform</a>
          <a href="#pricing" style={{ color: T.muted, textDecoration: 'none' }}>Pricing</a>
          <Link to="/login" style={{ color: T.muted, textDecoration: 'none' }}>Sign in</Link>
        </div>
        <Link to="/register" className="pill-btn-primary" style={{ fontSize: 13, padding: '8px 20px' }}>List your property</Link>
      </nav>

      {/* ── Hero ────────────────────────────────────────────── */}
      <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', overflow: 'hidden', background: `linear-gradient(160deg, #061e33 0%, ${T.oceanDeep} 40%, ${T.ocean} 100%)`, paddingTop: 64 }}>
        <HeroWaves />
        <div style={{ position: 'relative', zIndex: 10, maxWidth: 1280, margin: '0 auto', width: '100%', display: 'flex', alignItems: 'center', gap: 80, padding: '80px 56px' }}>
          <div style={{ flex: 1 }}>
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, borderRadius: 999, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.1)', padding: '6px 14px', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(8px)', marginBottom: 22 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: T.seafoam, display: 'inline-block' }} />
              Now serving Long Beach Island, NJ
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.7 }}
              style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 68, fontWeight: 400, lineHeight: 1.02, letterSpacing: '-0.03em', color: 'white', margin: '0 0 20px' }}>
              Your shore house,{' '}
              <em style={{ fontStyle: 'italic', fontWeight: 300, color: T.seafoam }}>handled.</em>
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.6 }}
              style={{ fontSize: 16, lineHeight: 1.6, color: 'rgba(255,255,255,0.6)', maxWidth: 480, marginBottom: 36 }}>
              One quiet platform for the homeowners, watchers and guests behind the best summer rentals on the Jersey Shore.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
              style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link to="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 26px', borderRadius: 999, background: 'white', color: T.oceanDeep, fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
                Get early access <Icon.arrow style={{ width: 14, height: 14 }} />
              </Link>
              <Link to="/browse" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 26px', borderRadius: 999, border: '1px solid rgba(255,255,255,0.2)', color: 'white', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
                Browse {featuredCount > 0 ? `${featuredCount} listings` : 'listings'}
              </Link>
            </motion.div>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.65 }}
              style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 16 }}>
              Free 30-day trial · No card required · Cancel anytime
            </motion.p>
          </div>
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            <MockupCard />
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────── */}
      <section id="features" style={{ padding: '100px 56px', background: T.bg }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ marginBottom: 56, maxWidth: 600 }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.22em', textTransform: 'uppercase', color: T.ocean, marginBottom: 14 }}>The platform</div>
            <h2 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 52, fontWeight: 400, lineHeight: 1.02, letterSpacing: '-0.03em', color: T.oceanDeep, margin: 0 }}>
              Everything the shore house needs
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, background: T.line, borderRadius: 20, overflow: 'hidden' }}>
            {FEATURES.map((f, i) => (
              <motion.div key={f.n} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                style={{ display: 'flex', flexDirection: 'column', gap: 16, background: 'rgba(251,247,238,0.95)', backdropFilter: 'blur(4px)', padding: 28 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: `rgba(15,76,117,0.08)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{f.icon}</div>
                <div>
                  <h3 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 20, fontWeight: 500, color: T.oceanDeep, letterSpacing: '-0.02em', marginBottom: 6 }}>{f.title}</h3>
                  <p style={{ fontSize: 14, lineHeight: 1.6, color: T.muted, margin: 0 }}>{f.body}</p>
                </div>
                <p style={{ marginTop: 'auto', fontSize: 11, fontWeight: 600, color: 'rgba(15,76,117,0.2)', fontFamily: 'ui-monospace, monospace' }}>/ {f.n}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Roles ───────────────────────────────────────────── */}
      <section style={{ padding: '100px 56px 120px', background: T.oceanDeep, color: T.cream, position: 'relative', overflow: 'hidden' }}>
        <svg viewBox="0 0 1440 200" preserveAspectRatio="none" style={{ position: 'absolute', left: 0, right: 0, top: 0, width: '100%', height: 200, opacity: 0.06 }} aria-hidden>
          <path d="M0,100 C240,140 480,60 720,100 C960,140 1200,60 1440,100" stroke={T.seafoam} strokeWidth="1" fill="none" />
          <path d="M0,140 C240,180 480,100 720,140 C960,180 1200,100 1440,140" stroke={T.seafoam} strokeWidth="1" fill="none" />
        </svg>
        <div style={{ maxWidth: 1280, margin: '0 auto', position: 'relative' }}>
          <div style={{ marginBottom: 48, maxWidth: 720 }}>
            <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.22em', textTransform: 'uppercase', color: T.seafoam, marginBottom: 18 }}>Made for everyone on the property</div>
            <h2 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 56, fontWeight: 400, lineHeight: 1.02, letterSpacing: '-0.03em', margin: 0 }}>
              One platform. <em style={{ fontStyle: 'italic', fontWeight: 300, color: T.seafoam }}>Five roles</em>.
            </h2>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.15)', marginBottom: 48 }}>
            {(Object.entries(ROLES_DATA) as [string, typeof role][]).map(([key, r]) => (
              <button key={key} onClick={() => setActiveRole(key as typeof activeRole)}
                style={{ padding: '16px 28px', color: T.cream, fontSize: 15, fontWeight: 500, letterSpacing: '-0.01em', opacity: activeRole === key ? 1 : 0.5, borderBottom: activeRole === key ? `2px solid ${T.seafoam}` : '2px solid transparent', marginBottom: -1, transition: 'opacity 150ms', background: 'none', cursor: 'pointer' }}>
                For {r.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '0.9fr 1.1fr', gap: 80, alignItems: 'center' }}>
            <div>
              <h3 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 40, fontWeight: 400, lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: 28 }}>{role.lede}</h3>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 36 }}>
                {role.bullets.map((b, i) => (
                  <li key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', fontSize: 15, lineHeight: 1.55, opacity: 0.85 }}>
                    <Icon.check style={{ width: 18, height: 18, color: T.seafoam, flexShrink: 0, marginTop: 2 }} />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              <Link to={role.href} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '13px 22px', borderRadius: 999, background: T.cream, color: T.oceanDeep, fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
                {role.cta} <Icon.arrow style={{ width: 14, height: 14 }} />
              </Link>
            </div>
            <motion.div key={activeRole} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
              {activeRole === 'owner' && <OwnerPeek />}
              {activeRole === 'watcher' && <WatcherPeek />}
              {activeRole === 'guest' && <GuestPeek />}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Showcase ────────────────────────────────────────── */}
      <section style={{ padding: '120px 56px', background: T.sand }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 80, alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.22em', textTransform: 'uppercase', color: T.ocean, marginBottom: 18 }}>How it works</div>
            <h2 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 52, fontWeight: 400, lineHeight: 1.02, letterSpacing: '-0.03em', color: T.oceanDeep, marginBottom: 40 }}>
              Set up a property in <em style={{ fontStyle: 'italic', fontWeight: 300 }}>an afternoon</em>.
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {[
                { n: '01', title: 'Add your property', body: 'House info, rooms, appliances, WiFi, rules. Drag-and-drop your existing welcome book.' },
                { n: '02', title: 'Invite your watcher', body: 'Send a one-time link. They register, accept, and start showing up in your weekly feed.' },
                { n: '03', title: 'Generate a guest QR', body: 'One per booking. Tape it to the fridge. Your guests scan and have everything they need.' },
                { n: '04', title: 'Sleep through the storm', body: 'Watcher walks the property, photographs damage, and dispatches the roofer — all before sunrise.' },
              ].map((s, i) => (
                <div key={s.n} style={{ display: 'grid', gridTemplateColumns: '60px 1fr', gap: 20, paddingBottom: i < 3 ? 24 : 0, borderBottom: i < 3 ? `1px solid ${T.line}` : 'none', paddingTop: i > 0 ? 24 : 0 }}>
                  <div style={{ fontFamily: 'ui-monospace, SFMono-Regular, monospace', fontSize: 13, fontWeight: 600, color: T.ocean, letterSpacing: '0.05em', paddingTop: 4 }}>/ {s.n}</div>
                  <div>
                    <h3 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 24, fontWeight: 500, letterSpacing: '-0.02em', color: T.oceanDeep, marginBottom: 6 }}>{s.title}</h3>
                    <p style={{ fontSize: 14.5, lineHeight: 1.55, color: T.muted, margin: 0 }}>{s.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* QR fridge illustration */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: 360, borderRadius: 20, background: T.cream, border: `1px solid ${T.line}`, boxShadow: '0 30px 80px -20px rgba(15,76,117,0.25)', padding: 32, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {/* Tape */}
              <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%) rotate(-2deg)', width: 100, height: 26, background: `color-mix(in oklab, ${T.sandWarm} 80%, transparent)`, opacity: 0.85, borderRadius: 2 }} />
              <img src="/logo.png" alt="Shore Stay" style={{ height: 48, objectFit: 'contain' }} />
              <div style={{ marginTop: 20, fontSize: 11.5, fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: T.muted }}>Welcome to The Salt Box</div>
              <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 22, fontWeight: 500, letterSpacing: '-0.02em', color: T.oceanDeep, marginTop: 4, textAlign: 'center' }}>
                Scan for everything<br />you need →
              </div>
              <div style={{ marginTop: 24, padding: 14, background: T.cream, border: `1px solid ${T.line}`, borderRadius: 14 }}>
                <FakeQR />
              </div>
              <div style={{ marginTop: 20, fontSize: 11.5, color: T.muted, textAlign: 'center', lineHeight: 1.6 }}>
                shorestay.app/stay/<br />
                <span style={{ fontFamily: 'ui-monospace, monospace', color: T.ocean }}>tk-9f3a-22c1</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonial ─────────────────────────────────────── */}
      <section style={{ padding: '100px 56px', background: T.cream }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 56, alignItems: 'center' }}>
          <div style={{ width: 220, height: 280, borderRadius: 12, background: `repeating-linear-gradient(120deg, ${T.sandWarm} 0 10px, ${T.sand} 10px 20px)`, border: `1px solid ${T.line}`, position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
            <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, transparent 60%, color-mix(in oklab, ${T.oceanDeep} 70%, transparent))` }} />
            <div style={{ position: 'absolute', left: 12, bottom: 12, fontFamily: 'ui-monospace, monospace', fontSize: 10, color: T.cream, opacity: 0.85, letterSpacing: '0.05em' }}>[ portrait · owner photo ]</div>
          </div>
          <div>
            <div style={{ display: 'flex', gap: 4, marginBottom: 24 }}>
              {[0,1,2,3,4].map(i => <Icon.star key={i} style={{ width: 16, height: 16, color: T.coral }} />)}
            </div>
            <blockquote style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 30, fontWeight: 400, lineHeight: 1.3, letterSpacing: '-0.025em', color: T.oceanDeep, margin: '0 0 28px' }}>
              "We went from <em style={{ fontStyle: 'italic', fontWeight: 300 }}>three spreadsheets, a group text, and a paper binder</em> to one page. The QR alone changed how guests show up — they actually read the rules now."
            </blockquote>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: T.oceanDeep }}>Sarah & Pete Calabrese</div>
              <div style={{ fontSize: 13, color: T.muted, marginTop: 2 }}>Owners, Beach Haven · 3 properties on Shore Stay since 2026</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing ─────────────────────────────────────────── */}
      <section id="pricing" style={{ padding: '100px 56px', background: T.bg }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.22em', textTransform: 'uppercase', color: T.ocean, marginBottom: 14 }}>Pricing</div>
            <h2 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 52, fontWeight: 400, lineHeight: 1.02, letterSpacing: '-0.03em', color: T.oceanDeep, margin: '0 0 12px' }}>Simple annual plans</h2>
            <p style={{ fontSize: 15, color: T.muted, margin: 0 }}>No per-booking fees. No surprises.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {PRICING.map((plan, i) => (
              <motion.div key={plan.name} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                style={{ position: 'relative', display: 'flex', flexDirection: 'column', borderRadius: 24, padding: 28, ...(plan.highlight ? { background: T.oceanDeep, color: T.cream, boxShadow: '0 8px 40px rgba(10,52,87,0.25)' } : { background: 'rgba(255,255,255,0.7)', border: `1px solid ${T.line}` }) }}>
                {plan.highlight && <span style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', borderRadius: 999, background: T.seafoam, padding: '3px 16px', fontSize: 11, fontWeight: 700, color: T.oceanDeep, whiteSpace: 'nowrap' }}>Most popular</span>}
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', opacity: 0.5, marginBottom: 8 }}>{plan.name}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
                  <span style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 44, fontWeight: 400, letterSpacing: '-0.025em' }}>{plan.price}</span>
                  <span style={{ fontSize: 13, opacity: 0.5 }}>/year</span>
                </div>
                <div style={{ fontSize: 13, opacity: 0.6, marginBottom: 22 }}>{plan.desc}</div>
                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
                  {plan.features.map(f => (
                    <li key={f} style={{ display: 'flex', gap: 10, fontSize: 13.5, opacity: 0.8 }}>
                      <Icon.check style={{ width: 16, height: 16, color: plan.highlight ? T.seafoam : T.ocean, flexShrink: 0, marginTop: 1 }} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to="/register" style={{ marginTop: 'auto', display: 'block', textAlign: 'center', padding: '12px', borderRadius: 999, fontSize: 14, fontWeight: 600, textDecoration: 'none', ...(plan.highlight ? { background: 'white', color: T.oceanDeep } : { border: `1px solid ${T.line}`, color: T.oceanDeep }) }}>
                  Get started
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer CTA ──────────────────────────────────────── */}
      <footer style={{ background: T.oceanDeep, padding: '80px 56px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 48, fontWeight: 400, lineHeight: 1.05, letterSpacing: '-0.03em', color: 'white', margin: '0 0 12px' }}>
          Ready to shore up your{' '}
          <em style={{ fontStyle: 'italic', fontWeight: 300, color: T.seafoam }}>summer?</em>
        </h2>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', margin: '0 0 32px' }}>Join LBI property owners already on Shore Stay.</p>
        <Link to="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 32px', borderRadius: 999, background: 'white', color: T.oceanDeep, fontSize: 15, fontWeight: 600, textDecoration: 'none' }}>
          List your property <Icon.arrow style={{ width: 14, height: 14 }} />
        </Link>
        <div style={{ marginTop: 60, fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>
          © {new Date().getFullYear()} Shore Stay · Long Beach Island, NJ
        </div>
      </footer>

    </div>
  );
}
