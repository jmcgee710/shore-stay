import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PropertyCard from './components/PropertyCard';
import { getTownBySlug, LBI_TOWNS } from './data/towns';
import type { ListingSummary } from './types';

const API = import.meta.env.VITE_API_URL ?? (import.meta.env.PROD ? '' : 'http://localhost:5000');

function WaveDivider() {
  return (
    <div className="relative overflow-hidden" style={{ height: 52 }}>
      <svg viewBox="0 0 1440 52" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden>
        <motion.path fill="rgba(255,255,255,0.12)"
          animate={{ d: [
            'M0,26 C360,52 720,0 1080,26 C1260,38 1380,14 1440,26 L1440,52 L0,52 Z',
            'M0,20 C300,46 600,4 900,20 C1100,38 1300,8 1440,20 L1440,52 L0,52 Z',
            'M0,26 C360,52 720,0 1080,26 C1260,38 1380,14 1440,26 L1440,52 L0,52 Z',
          ]}}
          transition={{ repeat: Infinity, duration: 7, ease: 'easeInOut' }}
        />
        <motion.path fill="rgba(255,255,255,0.22)"
          animate={{ d: [
            'M0,34 C240,14 480,46 720,30 C960,14 1200,46 1440,30 L1440,52 L0,52 Z',
            'M0,38 C200,18 500,50 800,32 C1050,16 1250,48 1440,36 L1440,52 L0,52 Z',
            'M0,34 C240,14 480,46 720,30 C960,14 1200,46 1440,30 L1440,52 L0,52 Z',
          ]}}
          transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut', delay: 0.5 }}
        />
        <rect x="0" y="48" width="1440" height="4" fill="rgba(228,241,251,0.9)" />
      </svg>
    </div>
  );
}

export default function TownshipPage() {
  const { town: townSlug } = useParams<{ town: string }>();
  const townInfo = getTownBySlug(townSlug ?? '');
  const [listings, setListings] = useState<ListingSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!townInfo) { setLoading(false); return; }
    fetch(`${API}/api/public/listings?town=${encodeURIComponent(townInfo.name)}&limit=24`)
      .then((r) => r.json())
      .then((d) => setListings(d.listings ?? []))
      .catch(() => setListings([]))
      .finally(() => setLoading(false));
  }, [townInfo]);

  if (!townInfo) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="glass-card p-10 text-center">
          <p className="text-xl font-bold text-ocean">Town not found</p>
          <Link to="/" className="mt-3 inline-block text-sm text-ocean/60 hover:text-ocean">← Back to home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="glass-nav sticky top-0 z-40 flex items-center gap-3 px-6 py-3">
        <Link to="/" className="text-xs font-semibold uppercase tracking-widest text-ocean/70">Shore Stay</Link>
        <span className="text-ocean/20">/</span>
        <span className="text-sm text-ocean/50">Towns</span>
        <span className="text-ocean/20">/</span>
        <span className="text-sm font-semibold text-ocean">{townInfo.name}</span>
      </nav>

      {/* Town hero */}
      <header className="bg-ocean-header">
        <div className="mx-auto max-w-4xl px-6 py-14 text-center">
          <motion.p
            className="text-xs font-semibold uppercase tracking-widest text-white/40"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          >
            Long Beach Island, NJ
          </motion.p>
          <motion.h1
            className="mt-2 text-4xl font-bold text-white sm:text-5xl"
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}
          >
            {townInfo.name}
          </motion.h1>
          <motion.p
            className="mt-2 text-lg text-white/60"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
          >
            {townInfo.tagline}
          </motion.p>
        </div>
        <WaveDivider />
      </header>

      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Info sidebar */}
          <aside className="lg:col-span-1 flex flex-col gap-4">
            <div className="glass-card p-5">
              <p className="section-label">About {townInfo.name}</p>
              <p className="text-sm leading-relaxed text-slate-600">{townInfo.description}</p>

              <p className="section-label mt-5">Highlights</p>
              <ul className="flex flex-col gap-2">
                {townInfo.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-2 text-sm text-slate-600">
                    <span className="mt-0.5 text-seafoam">✓</span> {h}
                  </li>
                ))}
              </ul>

              <div className="mt-4 rounded-2xl bg-ocean/5 px-4 py-3 text-xs text-ocean/70">
                🏖️ Beach badges required · Under 12 always free
              </div>
            </div>

            {/* Other towns */}
            <div className="glass-card-sm p-4">
              <p className="section-label">Other towns</p>
              <div className="flex flex-col gap-0.5">
                {LBI_TOWNS.filter((t) => t.slug !== townSlug).map((t) => (
                  <Link key={t.slug} to={`/lbi/${t.slug}`}
                    className="rounded-xl px-3 py-2 text-sm text-ocean/70 transition hover:bg-ocean/5 hover:text-ocean">
                    {t.name}
                  </Link>
                ))}
              </div>
            </div>
          </aside>

          {/* Listings */}
          <div className="lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-semibold text-ocean">
                {loading ? 'Loading…' : `${listings.length} propert${listings.length !== 1 ? 'ies' : 'y'}`}
              </p>
              <Link to={`/browse?town=${encodeURIComponent(townInfo.name)}`}
                className="text-xs font-medium text-ocean/60 hover:text-ocean">
                Refine search →
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="aspect-[4/3] animate-pulse rounded-3xl bg-white/60" />
                ))}
              </div>
            ) : listings.length === 0 ? (
              <div className="glass-card p-14 text-center text-slate-400">
                <p className="text-4xl">🏖️</p>
                <p className="mt-3 font-medium text-ocean">No listings yet in {townInfo.name}</p>
                <Link to="/browse" className="mt-2 inline-block text-sm text-ocean/60 hover:text-ocean">Browse all LBI →</Link>
              </div>
            ) : (
              <motion.div
                className="grid grid-cols-1 gap-4 sm:grid-cols-2"
                initial="hidden" animate="visible"
                variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
              >
                {listings.map((l) => (
                  <motion.div key={l.id} variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}>
                    <PropertyCard listing={l} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
