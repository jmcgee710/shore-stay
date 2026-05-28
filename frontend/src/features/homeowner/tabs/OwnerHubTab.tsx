import { useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PropertyFull } from '../types';
import { ComplianceTracker } from '../ownerHub/ComplianceTracker';
import { TaxCalendar } from '../ownerHub/TaxCalendar';
import { SeasonPlanner } from '../ownerHub/SeasonPlanner';
import { DocumentVault } from '../ownerHub/DocumentVault';
import { AIAssistant } from '../ownerHub/AIAssistant';

interface Props {
  property: PropertyFull;
}

interface Section {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  accentColor: string;
  accentBg: string;
}

const SECTIONS: Section[] = [
  {
    id: 'compliance',
    icon: '🏛️',
    title: 'Compliance Tracker',
    subtitle: 'Per-municipality checklists for LBI rental regulations',
    accentColor: 'text-purple-600',
    accentBg: 'bg-purple-50',
  },
  {
    id: 'tax',
    icon: '📊',
    title: 'Tax Calendar',
    subtitle: 'NJ occupancy tax quarters + estimated owed from bookings',
    accentColor: 'text-blue-600',
    accentBg: 'bg-blue-50',
  },
  {
    id: 'season',
    icon: '🗓️',
    title: 'Rental Season Planner',
    subtitle: 'Peak, shoulder & off-season tips plus amenity tracker',
    accentColor: 'text-amber-600',
    accentBg: 'bg-amber-50',
  },
  {
    id: 'vault',
    icon: '📁',
    title: 'Document Vault',
    subtitle: 'Flood insurance, permits, inspections — with expiry alerts',
    accentColor: 'text-teal-600',
    accentBg: 'bg-teal-50',
  },
  {
    id: 'ai',
    icon: '⚖️',
    title: 'AI Compliance Assistant',
    subtitle: 'Ask anything about LBI rules, NJ taxes, or permits',
    accentColor: 'text-ocean-600',
    accentBg: 'bg-ocean/8',
  },
];

// ─── Accordion section wrapper ────────────────────────────────────────────────
function HubSection({
  section,
  defaultOpen = false,
  badge,
  children,
}: {
  section: Section;
  defaultOpen?: boolean;
  badge?: ReactNode;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="glass-card overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-4 px-5 py-4 text-left transition hover:bg-black/[0.01]"
      >
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${section.accentBg}`}>
          <span className="text-xl leading-none">{section.icon}</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className={`font-bold text-[15px] ${section.accentColor}`}>{section.title}</p>
            {badge}
          </div>
          <p className="mt-0.5 text-xs text-slate-400 leading-snug">{section.subtitle}</p>
        </div>

        <motion.span
          className="shrink-0 text-slate-400"
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <svg viewBox="0 0 16 16" className="h-4 w-4 fill-current">
            <path d="M3 6l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          </svg>
        </motion.span>
      </button>

      {/* Content */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div className="border-t border-slate-100/80 px-5 pb-5 pt-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main OwnerHubTab ─────────────────────────────────────────────────────────

/** OwnerHubTab — year-round compliance, tax, and planning dashboard for property owners */
export function OwnerHubTab({ property }: Props) {
  const [activeMuniId, setActiveMuniId] = useState<string>('');

  return (
    <div className="space-y-4">
      {/* Page header */}
      <div className="flex items-start gap-3">
        <div>
          <h2 className="text-xl font-bold text-ocean-700">Owner Hub</h2>
          <p className="mt-0.5 text-sm text-slate-500">
            Your year-round compliance, tax, and seasonal planning center.
          </p>
        </div>
        <div className="ml-auto shrink-0 rounded-full bg-ocean/10 border border-ocean/20 px-3 py-1.5">
          <p className="text-[11px] font-bold text-ocean-600 uppercase tracking-wide">
            {property.name}
          </p>
        </div>
      </div>

      {/* 1 — Compliance Tracker */}
      <HubSection section={SECTIONS[0]} defaultOpen={true}>
        <ComplianceTracker
          propertyId={property.id}
          onMunicipalityChange={setActiveMuniId}
        />
      </HubSection>

      {/* 2 — Tax Calendar */}
      <HubSection
        section={SECTIONS[1]}
        badge={
          property.bookings.length > 0 ? (
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700">
              {property.bookings.length} booking{property.bookings.length !== 1 ? 's' : ''} this yr
            </span>
          ) : undefined
        }
      >
        <TaxCalendar propertyId={property.id} bookings={property.bookings} />
      </HubSection>

      {/* 3 — Season Planner */}
      <HubSection section={SECTIONS[2]}>
        <SeasonPlanner propertyId={property.id} />
      </HubSection>

      {/* 4 — Document Vault */}
      <HubSection section={SECTIONS[3]}>
        <DocumentVault propertyId={property.id} />
      </HubSection>

      {/* 5 — AI Compliance Assistant */}
      <HubSection section={SECTIONS[4]}>
        <AIAssistant activeMuniId={activeMuniId || undefined} />
      </HubSection>
    </div>
  );
}
