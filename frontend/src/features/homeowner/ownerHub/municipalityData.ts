/**
 * LBI Municipality Compliance Data
 * ─────────────────────────────────
 * Informational only — owners should always verify rules directly with
 * their municipality, as regulations change frequently.
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export interface MunicipalityData {
  id: string;
  name: string;
  permitRequired: boolean;
  permitFee: string;
  yearRoundRental: boolean;
  minimumStay: string;
  maxOccupancy: string;
  inspectionRequired: boolean;
  summaryRules: string[];
  phone: string;
  clerkUrl?: string;
  notes?: string;
}

export interface ChecklistItem {
  id: string;
  label: string;
  category: 'permit' | 'safety' | 'insurance' | 'utilities' | 'municipal';
  priority: 'high' | 'medium' | 'low';
  detail?: string;
  municipalitySpecific?: string[]; // municipality IDs this is specific to
}

export interface AIPattern {
  patterns: string[];
  topics: string[];
  respond: (muni?: MunicipalityData) => string;
}

// ─── Municipality Records ─────────────────────────────────────────────────────

export const LBI_MUNICIPALITIES: Record<string, MunicipalityData> = {
  barnegat_light: {
    id: 'barnegat_light',
    name: 'Barnegat Light',
    permitRequired: true,
    permitFee: '~$100/year',
    yearRoundRental: true,
    minimumStay: 'None specified',
    maxOccupancy: '2 per bedroom + 2',
    inspectionRequired: false,
    phone: '(609) 494-9196',
    summaryRules: [
      'Annual rental registration required — file with Borough Clerk',
      'Maximum 2 vehicles per rental unit on property',
      'Noise curfew enforced: 10 PM – 8 AM daily',
      'No outdoor amplified music after 9 PM',
      'Trash placed curbside morning of pickup only — no overnight bins',
      'Owner must file tenant/contact info with borough annually',
      'Smoke & CO detectors required in all bedrooms and hallways',
    ],
    notes: 'Barnegat Light has strict parking enforcement in summer. Confirm current fee with clerk.',
  },

  harvey_cedars: {
    id: 'harvey_cedars',
    name: 'Harvey Cedars',
    permitRequired: true,
    permitFee: '~$50/year',
    yearRoundRental: true,
    minimumStay: 'None specified',
    maxOccupancy: '2 per bedroom + 2',
    inspectionRequired: false,
    phone: '(609) 494-2843',
    summaryRules: [
      'Annual rental certificate required — file with Borough Clerk',
      'Maximum 2 cars per rental unit at any time',
      'Garbage and recycling bins must be stored out of public view between pickups',
      'No overnight street parking during summer months (June–Sept)',
      'Quiet hours strictly enforced: 10 PM – 8 AM',
      'Owner must maintain valid liability insurance coverage',
      'No outdoor cooking equipment within 10 ft of structure',
    ],
    notes: 'Harvey Cedars has very active code enforcement in summer. Verify current fee/requirements.',
  },

  surf_city: {
    id: 'surf_city',
    name: 'Surf City',
    permitRequired: true,
    permitFee: '~$100/year',
    yearRoundRental: true,
    minimumStay: 'None specified',
    maxOccupancy: 'Per NJ UCC standards',
    inspectionRequired: false,
    phone: '(609) 494-3064',
    summaryRules: [
      'Annual rental registration required',
      'Certificate of Continued Occupancy (CCO) may be required for initial rental',
      'Noise ordinance strictly enforced: 11 PM – 7 AM weekdays / 11 PM weekends',
      'No recreational vehicles, boats, or trailers stored on property overnight',
      'Maximum 3 vehicles per unit during July–August peak season',
      'Fireworks prohibited — strictly enforced near beach areas',
      'All windows and doors must have working screens (summer requirement)',
    ],
    notes: 'Surf City is one of the busiest LBI municipalities. Contact clerk directly for CCO status.',
  },

  ship_bottom: {
    id: 'ship_bottom',
    name: 'Ship Bottom',
    permitRequired: true,
    permitFee: '~$75/year',
    yearRoundRental: true,
    minimumStay: 'None specified',
    maxOccupancy: '2 per bedroom + 2',
    inspectionRequired: true,
    phone: '(609) 494-2171',
    summaryRules: [
      'Annual rental permit required — includes property inspection',
      'Certificate of Occupancy must be current and posted on premises',
      'Septic/sewer inspection may be required for older properties',
      'Smoke detectors and CO detectors must be in certified working order',
      'Maximum 2 vehicles per unit; no parking on Route 72 overnight',
      'Landlord must register contact info with Borough Clerk annually',
      'Pool/spa must have current inspection certificate (if applicable)',
    ],
    notes: 'Ship Bottom requires an actual property inspection for the permit — schedule early (Jan–Feb).',
  },

  long_beach_township: {
    id: 'long_beach_township',
    name: 'Long Beach Township',
    permitRequired: true,
    permitFee: '~$125/year',
    yearRoundRental: true,
    minimumStay: 'None specified',
    maxOccupancy: 'Per Certificate of Occupancy',
    inspectionRequired: false,
    phone: '(609) 361-1000',
    clerkUrl: 'https://www.longbeachtownship.com',
    summaryRules: [
      'Annual rental registration required — file online or at Municipal Building',
      'Flood insurance certificate must be on file with township',
      'FEMA elevation certificate required for any property in flood zone AE',
      'No more than 2 vehicles per bedroom (e.g., 4-bedroom = max 8 cars)',
      'Quiet hours: 10 PM – 8 AM — violations result in fines',
      'Tenant/guest contact list must be submitted to township for active bookings',
      'Smoke and CO detectors required; self-certification form provided annually',
    ],
    notes: 'LBT covers a large area (Loveladies to Holgate). Rules apply township-wide. Flood zone compliance is strictly enforced.',
  },

  beach_haven: {
    id: 'beach_haven',
    name: 'Beach Haven',
    permitRequired: true,
    permitFee: '~$150/year',
    yearRoundRental: true,
    minimumStay: 'None specified',
    maxOccupancy: '2 per bedroom + 2',
    inspectionRequired: true,
    phone: '(609) 492-0111',
    summaryRules: [
      'Annual rental license required ($150) — new properties require initial inspection',
      'Occupancy license must be displayed on premises at all times during rental',
      'No rental permitted without current Certificate of Occupancy on file',
      'Affidavit of Compliance must be submitted annually with license renewal',
      'Noise ordinance: 10 PM – 8 AM weeknights; 11 PM Fri–Sat',
      'Maximum 2 vehicles per bedroom; no overnight street parking July–August',
      'Checkout time must be specified in rental agreement (typically 10 AM)',
    ],
    notes: 'Beach Haven is LBI\'s most commercial municipality. Enforcement is high-priority in peak season.',
  },
};

export const MUNICIPALITY_ORDER = [
  'barnegat_light',
  'harvey_cedars',
  'surf_city',
  'ship_bottom',
  'long_beach_township',
  'beach_haven',
];

// ─── Standard Compliance Checklist ───────────────────────────────────────────

export const COMPLIANCE_CHECKLIST: ChecklistItem[] = [
  // Permit & Legal
  {
    id: 'permit_filed',
    label: 'Rental permit / license filed and paid for current year',
    category: 'permit',
    priority: 'high',
    detail: 'Required in all LBI municipalities. File with Borough Clerk by January.',
  },
  {
    id: 'co_current',
    label: 'Certificate of Occupancy is current and on premises',
    category: 'permit',
    priority: 'high',
    detail: 'Must be displayed during all rental periods.',
  },
  {
    id: 'tenant_filed',
    label: 'Tenant/guest contact list filed with municipality',
    category: 'municipal',
    priority: 'high',
    detail: 'Required before any rental period. Varies by town — confirm with clerk.',
  },

  // Safety
  {
    id: 'smoke_detectors',
    label: 'Smoke detectors tested in all bedrooms and hallways',
    category: 'safety',
    priority: 'high',
    detail: 'Replace batteries twice yearly (Daylight Saving transitions). Replace units every 10 years.',
  },
  {
    id: 'co_detectors',
    label: 'Carbon monoxide detectors tested and certified',
    category: 'safety',
    priority: 'high',
    detail: 'Required by NJ law near all sleeping areas. Replace units every 7 years.',
  },
  {
    id: 'fire_extinguisher',
    label: 'Fire extinguisher serviced within the last 12 months',
    category: 'safety',
    priority: 'high',
    detail: 'Must be ABC-rated and easily accessible in kitchen area.',
  },
  {
    id: 'egress_clear',
    label: 'All egress windows and emergency exits unobstructed',
    category: 'safety',
    priority: 'medium',
    detail: 'Required by NJ UCC. Check basement/loft sleeping areas especially.',
  },

  // Insurance
  {
    id: 'flood_insurance',
    label: 'Flood insurance policy current (if in flood zone)',
    category: 'insurance',
    priority: 'high',
    detail: 'NFIP or private flood policy. Most LBI properties are in AE or VE flood zones.',
  },
  {
    id: 'homeowners_insurance',
    label: 'Homeowner\'s / landlord insurance covers short-term rentals',
    category: 'insurance',
    priority: 'high',
    detail: 'Confirm with insurer that STR coverage is included. Many standard policies exclude it.',
  },
  {
    id: 'fema_elevation',
    label: 'FEMA elevation certificate on file (flood zone properties)',
    category: 'insurance',
    priority: 'medium',
    detail: 'Required for properties in FEMA Special Flood Hazard Areas. Available from your municipal engineer.',
  },

  // Utilities & Maintenance
  {
    id: 'septic_inspection',
    label: 'Septic system inspected (if applicable)',
    category: 'utilities',
    priority: 'medium',
    detail: 'Required in Ship Bottom for permit. Recommended every 3 years for all systems.',
    municipalitySpecific: ['ship_bottom'],
  },
  {
    id: 'hvac_serviced',
    label: 'HVAC / heating system serviced this season',
    category: 'utilities',
    priority: 'medium',
    detail: 'Annual service recommended. Replace filters before each rental season.',
  },
  {
    id: 'pool_inspection',
    label: 'Pool / hot tub inspection current (if applicable)',
    category: 'utilities',
    priority: 'medium',
    detail: 'Pool fencing and safety equipment required by NJ law for residential pools.',
  },

  // Accessibility
  {
    id: 'parking_plan',
    label: 'Parking plan communicated to guests (vehicle limits per borough)',
    category: 'municipal',
    priority: 'medium',
    detail: 'All LBI towns have strict parking limits. Include in guest welcome materials.',
  },
  {
    id: 'noise_rules',
    label: 'Quiet hour rules documented in rental agreement',
    category: 'municipal',
    priority: 'low',
    detail: 'Include applicable quiet hours (10–11 PM depending on town) in your lease.',
  },
  {
    id: 'trash_schedule',
    label: 'Trash/recycling schedule provided to guests',
    category: 'municipal',
    priority: 'low',
    detail: 'LBI municipalities fine for improper trash placement and timing.',
  },
];

// ─── NJ Tax Data ──────────────────────────────────────────────────────────────

export const NJ_TAX = {
  salesTaxRate: 0.06625,          // 6.625% NJ Sales Tax
  hotelMotelRate: 0.05,           // 5% NJ Hotel/Motel Fee (rentals < 90 days)
  combinedStateRate: 0.11625,     // ~11.625% combined state rate
  municipalRateRange: '1%–3%',
  effectiveTotal: '~12%–14%',
  filingForm: 'NJ-ST-50 (Quarterly Sales Tax Return)',
  paymentPortal: 'https://www.njtaxation.org',
  quarters: [
    { q: 'Q1', label: 'Jan–Mar', dueMonth: 'April 20' },
    { q: 'Q2', label: 'Apr–Jun', dueMonth: 'July 20' },
    { q: 'Q3', label: 'Jul–Sep', dueMonth: 'October 20' },
    { q: 'Q4', label: 'Oct–Dec', dueMonth: 'January 20 (next year)' },
  ],
};

// ─── Season Definitions ───────────────────────────────────────────────────────

export type Season = 'peak' | 'shoulder' | 'offseason';

export function getCurrentSeason(): Season {
  const m = new Date().getMonth() + 1; // 1–12
  if (m >= 6 && m <= 8) return 'peak';          // Jun–Aug
  if (m === 5 || m === 9 || m === 10) return 'shoulder'; // May, Sep, Oct
  return 'offseason';
}

export const SEASON_INFO = {
  peak: {
    label: 'Peak Season',
    range: 'Memorial Day – Labor Day',
    emoji: '☀️',
    color: 'text-amber-600',
    bg: 'bg-amber-50 border-amber-200/60',
    tips: [
      'Ensure QR codes / share links are fresh for each new booking',
      'Stock extra beach gear: umbrellas, towels, boogie boards, cornhole',
      'Keep outdoor shower serviced and stocked with soap/rinse bins',
      'Have cleaning crew on a 24-hour turnover schedule',
      'Confirm parking stickers/permits for guests if your town requires them',
      'Stock the pantry with essentials: coffee, oil, salt/pepper, trash bags',
      'Post house rules and emergency contacts prominently near front door',
      'Test all AC units before June 1',
    ],
  },
  shoulder: {
    label: 'Shoulder Season',
    range: 'May & September–October',
    emoji: '🍂',
    color: 'text-orange-600',
    bg: 'bg-orange-50 border-orange-200/60',
    tips: [
      'Consider lower nightly rates to attract remote workers and couples',
      'LBI shoulder season is ideal for fishing, surfing, and wine weekends',
      'Fall surf is excellent — stock extra wetsuits if you have them',
      'Add a "digital nomad" bundle: external monitor, quality desk lamp, coffee setup',
      'Promote 3–5 night midweek stays (higher ROI than weekend-only)',
      'Check that outdoor gas grill/firepit is clean and stocked',
      'Confirm all mechanical systems before the heating season begins (Sept)',
      'Attract couples/small groups with a bottle of local wine on arrival',
    ],
  },
  offseason: {
    label: 'Off Season',
    range: 'November – April',
    emoji: '❄️',
    color: 'text-blue-600',
    bg: 'bg-blue-50 border-blue-200/60',
    tips: [
      'Drain and winterize outdoor plumbing, hose bibs, irrigation systems',
      'Set thermostat to minimum 55°F to prevent pipe freeze',
      'Have boiler/heating system serviced before November 1',
      'Off-season renters (3+ months) can provide year-round income — explore LBT long-term lease rules',
      'Schedule your annual permit renewal and any required inspections now',
      'Check roof, gutters, and storm shutters before nor\'easter season',
      'Review and renew flood insurance and homeowners policies in October',
      'Off-season is ideal for renovations — no lost rental income',
    ],
  },
};

export const OFFSEASON_AMENITIES = [
  { id: 'fireplace', label: 'Fireplace cleaned, inspected, and wood stocked', icon: '🔥', priority: 'high' as const },
  { id: 'workspace', label: 'Dedicated workspace: desk, external monitor, lamp', icon: '💻', priority: 'high' as const },
  { id: 'hot_tub', label: 'Hot tub serviced, heated, and covered', icon: '♨️', priority: 'high' as const },
  { id: 'streaming', label: 'Streaming services set up (Netflix, Disney+, etc.)', icon: '📺', priority: 'medium' as const },
  { id: 'board_games', label: 'Board games, puzzles, and books stocked', icon: '🎲', priority: 'medium' as const },
  { id: 'blankets', label: 'Extra warm blankets and flannel bedding available', icon: '🛏️', priority: 'medium' as const },
  { id: 'fire_pit', label: 'Outdoor fire pit with firewood supply', icon: '🪵', priority: 'medium' as const },
  { id: 'coffee', label: 'Quality coffee setup (grinder, good beans)', icon: '☕', priority: 'medium' as const },
  { id: 'wetsuit', label: 'Wetsuits available for fall surfing / water activities', icon: '🏄', priority: 'low' as const },
  { id: 'bikes', label: 'Bikes in good repair, stored and accessible', icon: '🚲', priority: 'low' as const },
  { id: 'kayak', label: 'Kayak / paddleboard stored and accessible (if applicable)', icon: '🛶', priority: 'low' as const },
  { id: 'heated_shower', label: 'Outdoor shower drained or heated (if winter use)', icon: '🚿', priority: 'low' as const },
];

// ─── Document Types ───────────────────────────────────────────────────────────

export const DOCUMENT_TYPES = [
  { value: 'flood_insurance', label: 'Flood Insurance Policy', icon: '🌊', required: true },
  { value: 'homeowners_insurance', label: 'Homeowner\'s Insurance', icon: '🏠', required: true },
  { value: 'rental_permit', label: 'Rental Permit / License', icon: '📋', required: true },
  { value: 'certificate_occupancy', label: 'Certificate of Occupancy', icon: '🏛️', required: true },
  { value: 'fema_elevation', label: 'FEMA Elevation Certificate', icon: '📐', required: false },
  { value: 'septic_inspection', label: 'Septic Inspection Certificate', icon: '🔧', required: false },
  { value: 'fire_inspection', label: 'Fire Safety Inspection', icon: '🔥', required: false },
  { value: 'hvac_service', label: 'HVAC Service Record', icon: '❄️', required: false },
  { value: 'pest_control', label: 'Pest Control Certificate', icon: '🪲', required: false },
  { value: 'pool_inspection', label: 'Pool / Hot Tub Inspection', icon: '🏊', required: false },
  { value: 'other', label: 'Other Document', icon: '📄', required: false },
] as const;

export type DocumentType = (typeof DOCUMENT_TYPES)[number]['value'];

// ─── AI FAQ Patterns ──────────────────────────────────────────────────────────

export interface AIResponse {
  answer: string;
  relatedTopics?: string[];
}

/**
 * Generates an AI-style response from the question and detected municipality.
 * Structured for easy replacement with a real API call.
 */
export function getAIResponse(question: string, activeMuni?: MunicipalityData | null): AIResponse {
  const q = question.toLowerCase();

  // ── Detect municipality from question ──
  const mentionedMuni = Object.values(LBI_MUNICIPALITIES).find(
    (m) =>
      q.includes(m.name.toLowerCase()) ||
      q.includes(m.id.replace('_', ' ')) ||
      (m.id === 'long_beach_township' && (q.includes('lbt') || q.includes('long beach township') || q.includes('loveladies') || q.includes('brant beach'))),
  ) ?? activeMuni ?? null;

  const muniName = mentionedMuni?.name ?? 'your LBI municipality';

  // ── Year-round rental ──
  if (/(year.round|year round|winter rental|off.season rent|rent in winter|rent all year)/i.test(q)) {
    if (mentionedMuni) {
      return {
        answer: `Yes — **${mentionedMuni.name}** allows year-round short-term rentals. All six LBI municipalities permit year-round rental activity as long as your annual permit is current and you comply with all ordinances. Keep in mind that off-season renters (especially long-term 30+ day stays) may have different legal protections under NJ landlord-tenant law — consult an attorney for any rental exceeding 30 consecutive days.`,
        relatedTopics: ['Permit requirements', 'Off-season amenities', 'Tax implications'],
      };
    }
    return {
      answer: `All six LBI municipalities (Barnegat Light, Harvey Cedars, Surf City, Ship Bottom, Long Beach Township, and Beach Haven) allow year-round short-term rentals. You'll need an active annual permit in each case. Note: NJ landlord-tenant law kicks in for stays over 30 days, which may complicate eviction if needed. Use the Compliance Tracker above to select your municipality for specific rules.`,
      relatedTopics: ['Permit requirements', 'Off-season planning', 'NJ landlord-tenant law'],
    };
  }

  // ── Permit ──
  if (/(permit|license|registration|register)/i.test(q)) {
    if (mentionedMuni) {
      const fee = mentionedMuni.permitFee;
      const inspection = mentionedMuni.inspectionRequired
        ? 'An **in-person property inspection** is also required.'
        : 'No property inspection required for permit renewal (initial may vary).';
      return {
        answer: `**${mentionedMuni.name}** requires an annual rental permit/registration. The current fee is approximately ${fee}. ${inspection} File with the Borough Clerk — ${mentionedMuni.phone}. It's best to renew in January before the summer rush. Failing to have a valid permit can result in fines and an order to cease rental activity.`,
        relatedTopics: ['Compliance checklist', 'Certificate of Occupancy', 'Inspection requirements'],
      };
    }
    return {
      answer: `All LBI municipalities require an annual rental permit or registration. Fees range from approximately $50 (Harvey Cedars) to $150 (Beach Haven). **Ship Bottom** and **Beach Haven** additionally require a property inspection. I recommend filing permits in January–February — contact your Borough Clerk with questions. Select your municipality in the Compliance Tracker for exact details.`,
      relatedTopics: ['Permit fees by town', 'Inspection checklist', 'Filing deadlines'],
    };
  }

  // ── Tax ──
  if (/(tax|taxes|sales tax|hotel tax|occupancy tax|what do i owe|how much tax)/i.test(q)) {
    return {
      answer: `NJ short-term rental (under 90 days) taxes break down as follows:\n\n• **NJ Sales Tax**: 6.625%\n• **NJ Hotel/Motel Fee**: 5%\n• **Combined state rate**: ~11.625%\n• **Municipal occupancy tax**: typically 1–3% additional\n• **Effective total**: ~12–14% depending on municipality\n\nYou must file **NJ-ST-50 Quarterly Sales Tax Returns** by January 20, April 20, July 20, and October 20. Platforms like Airbnb collect and remit state/local taxes automatically — but for direct bookings, you are responsible. See the Tax Calendar section above for due dates based on your bookings.`,
      relatedTopics: ['Filing deadlines', 'NJ ST-50 form', 'Quarterly payment schedule'],
    };
  }

  // ── Tax filing / deadlines ──
  if (/(when.*due|filing.*deadline|quarterly|due date|when.*file|when.*pay)/i.test(q)) {
    return {
      answer: `NJ Sales Tax (ST-50) quarterly due dates:\n\n• **Q1** (Jan–Mar): due **April 20**\n• **Q2** (Apr–Jun): due **July 20**\n• **Q3** (Jul–Sep): due **October 20**\n• **Q4** (Oct–Dec): due **January 20** of the following year\n\nFor high-volume operators (>$30K/month in sales), monthly filing may be required. File online at njtaxation.org. The Tax Calendar above can track which quarters you've paid.`,
      relatedTopics: ['NJ tax rates', 'Estimated tax owed', 'Monthly vs quarterly filing'],
    };
  }

  // ── Occupancy / max guests ──
  if (/(occupancy|max guests|how many people|guest limit|capacity|how many guests)/i.test(q)) {
    if (mentionedMuni) {
      return {
        answer: `**${mentionedMuni.name}** follows the standard LBI occupancy formula: **${mentionedMuni.maxOccupancy}**. This aligns with NJ Uniform Construction Code (UCC) standards. Your actual Certificate of Occupancy will specify the maximum for your specific property — that number is legally binding. Always disclose maximum occupancy in your rental agreement and include it in your Shore Stay house rules.`,
        relatedTopics: ['Certificate of Occupancy', 'Rental agreement tips', 'Guest safety'],
      };
    }
    return {
      answer: `Most LBI municipalities follow NJ UCC standards: **2 guests per bedroom + 2 additional** (e.g., a 4-bedroom home = max 10 guests). Your actual Certificate of Occupancy may specify a different number — that document controls. Always put your maximum occupancy in writing in your rental agreement. Exceeding stated occupancy can void your insurance and trigger municipal fines.`,
      relatedTopics: ['Certificate of Occupancy', 'Insurance implications', 'Guest registration'],
    };
  }

  // ── Noise / quiet hours ──
  if (/(noise|quiet hours|quiet time|loud|curfew|music|party)/i.test(q)) {
    if (mentionedMuni) {
      const rules = mentionedMuni.summaryRules.filter(
        (r) => r.toLowerCase().includes('noise') || r.toLowerCase().includes('quiet') || r.toLowerCase().includes('music'),
      );
      return {
        answer: `**${mentionedMuni.name}** noise ordinance:\n\n${rules.map((r) => `• ${r}`).join('\n')}\n\nViolations are actively enforced in summer. I recommend putting quiet hours explicitly in your rental agreement and posting them on the fridge or welcome binder. Your Shore Stay guest view already surfaces house rules — make sure noise rules are listed there.`,
        relatedTopics: ['House rules setup', 'Rental agreement tips', 'Code enforcement'],
      };
    }
    return {
      answer: `Quiet hours across LBI municipalities:\n\n• **Barnegat Light, Harvey Cedars, Long Beach Township**: 10 PM – 8 AM\n• **Surf City**: 11 PM – 7 AM\n• **Ship Bottom**: 10 PM – 8 AM\n• **Beach Haven**: 10 PM Sun–Thu / 11 PM Fri–Sat\n\nAll towns ban outdoor amplified music in residential areas after 9–10 PM. Noise violations can trigger municipal fines starting at $250–$500. Post quiet hours prominently and include in your rental agreement.`,
      relatedTopics: ['House rules', 'Municipal fines', 'Rental agreements'],
    };
  }

  // ── Parking ──
  if (/(parking|car|vehicle|truck|how many cars)/i.test(q)) {
    if (mentionedMuni) {
      const parkingRules = mentionedMuni.summaryRules.filter((r) =>
        r.toLowerCase().includes('vehicle') || r.toLowerCase().includes('parking') || r.toLowerCase().includes('car'),
      );
      return {
        answer: `**${mentionedMuni.name}** parking rules:\n\n${parkingRules.map((r) => `• ${r}`).join('\n')}\n\nParking enforcement is one of the most common complaint sources in LBI. I recommend including the vehicle limit and any permit requirements in your Shore Stay welcome info and rental agreement. If your town offers summer parking permits/stickers, obtain them in advance.`,
        relatedTopics: ['Municipal parking permits', 'House rules', 'Code enforcement'],
      };
    }
    return {
      answer: `Parking limits vary by LBI town — generally **2 vehicles per unit**, though Long Beach Township scales it to **2 per bedroom**. Street parking restrictions apply town-wide in July–August (often no overnight street parking). Some towns issue seasonal parking permits for properties. Always include the vehicle count limit in your rental agreement and Shore Stay welcome info.`,
      relatedTopics: ['Parking by municipality', 'Municipal permits', 'Rental agreement tips'],
    };
  }

  // ── Flood / insurance ──
  if (/(flood|fema|elevation|insurance|nfip|surge)/i.test(q)) {
    return {
      answer: `Most LBI properties are in **FEMA Special Flood Hazard Areas (SFHA)** — zones AE or VE. Key requirements:\n\n• **Flood insurance**: Required by all lenders; strongly advised even without a mortgage. Policies through NFIP or private carriers.\n• **FEMA Elevation Certificate**: Required by Long Beach Township and recommended for all SFHA properties — it can significantly lower your flood insurance premium.\n• **VE-zone properties** (ocean-front) face the highest risk and premiums; building elevation is critical.\n\nFor rental permit purposes: LBT explicitly requires a flood insurance certificate on file. Other towns don't require it for permits but your homeowner's insurance may require it for STR coverage.`,
      relatedTopics: ['FEMA elevation certificate', 'Long Beach Township requirements', 'Document Vault'],
    };
  }

  // ── Certificate of Occupancy ──
  if (/(certificate of occupancy|co |c\.o\.|occupancy cert)/i.test(q)) {
    return {
      answer: `A **Certificate of Occupancy (CO)** certifies that your property meets all building codes and is safe for habitation. For LBI rentals:\n\n• Required in **all municipalities** — you cannot legally rent without one\n• Must be **posted on the premises** during any rental period (Beach Haven requires this explicitly)\n• If you've done recent renovations, you may need a **new or updated CO** — check with your municipality's Construction Office\n• Ship Bottom requires a current CO as part of its rental permit inspection\n\nNever rent a property without a valid CO. If yours is outdated, contact your municipality's Construction Code Official.`,
      relatedTopics: ['Permit requirements', 'Property inspections', 'Renovation compliance'],
    };
  }

  // ── Airbnb / VRBO ──
  if (/(airbnb|vrbo|short.term|str|vacation rental platform)/i.test(q)) {
    return {
      answer: `NJ law recognizes short-term rentals (under 90 days) as taxable transient accommodations — **regardless of platform**. If you use Airbnb or VRBO:\n\n• Airbnb and VRBO generally collect and remit NJ Sales Tax (6.625%) and Hotel/Motel Fee (5%) automatically\n• You may still owe **municipal occupancy taxes** — check with your town\n• You still need a **local rental permit** — platforms don't handle local compliance\n• Some LBI municipalities require disclosure that your property is listed on STR platforms\n\nFor direct bookings (not through a platform), you are fully responsible for tax collection and remittance via NJ-ST-50.`,
      relatedTopics: ['NJ tax obligations', 'Local permits', 'Direct booking compliance'],
    };
  }

  // ── Minimum stay ──
  if (/(minimum stay|min stay|minimum night|how long|weekly only|week.long)/i.test(q)) {
    return {
      answer: `Currently, **no LBI municipality has a mandated minimum stay** for short-term rentals in state law. Historically, some LBI towns were exclusively weekly rentals (Saturday-to-Saturday) by local custom and HOA rules — but this is market convention, not law.\n\nYou are free to set your own minimum stay. Many LBI owners use:\n• 7-night minimum in peak season (July–August)\n• 3–4 night minimum in shoulder season\n• Flexible (1–3 nights) in off-season\n\nCheck any **HOA or condo rules** if applicable — those may impose minimums that override individual preference.`,
      relatedTopics: ['Seasonal pricing strategy', 'HOA rules', 'Short-term vs long-term'],
    };
  }

  // ── Default fallback ──
  return {
    answer: `That's a great question about LBI rental compliance. I don't have a specific answer for that exact query, but here are some resources:\n\n• **NJ Division of Taxation** — njtaxation.org (for STR tax questions)\n• **Your Borough Clerk** — contact info is in the Compliance Tracker for each municipality\n• **NJ REALTORS STR Guide** — njrealtors.com/strs\n• **Ocean County Bar Association** — for landlord-tenant questions\n\nFor municipality-specific questions, make sure you've selected your town in the Compliance Tracker above, and I'll be able to give more targeted answers. You can also ask about: permits, taxes, occupancy limits, noise rules, parking, flood insurance, Certificates of Occupancy, minimum stays, or seasonal planning.`,
    relatedTopics: ['Compliance Tracker', 'Tax Calendar', 'Document requirements'],
  };
}
