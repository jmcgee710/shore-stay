export interface TownInfo {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  highlights: string[];
  vibe: string;
}

export const LBI_TOWNS: TownInfo[] = [
  {
    slug: 'barnegat-light',
    name: 'Barnegat Light',
    tagline: 'The lighthouse town',
    description:
      'At the northern tip of the island, Barnegat Light is anchored by its iconic red-and-white lighthouse. Wide, uncrowded beaches, spectacular fishing off Barnegat Inlet, and a quiet village feel make it LBI\'s most serene escape.',
    highlights: ['Old Barney Lighthouse', 'Barnegat Inlet fishing', 'Viking Village fishermen', 'Uncrowded beaches'],
    vibe: 'Quiet & classic',
  },
  {
    slug: 'harvey-cedars',
    name: 'Harvey Cedars',
    tagline: 'Laid-back bay & beach living',
    description:
      'Harvey Cedars offers some of the island\'s widest lots and best bayfront sunsets. A small downtown with a beloved local pizza spot, calm bay swimming, and easy ocean access define this understated gem.',
    highlights: ['Bay sunsets', 'Harvey Cedars Bible Conference', 'Wide beaches', 'Lagoon swimming'],
    vibe: 'Relaxed & residential',
  },
  {
    slug: 'surf-city',
    name: 'Surf City',
    tagline: 'The heart of the island',
    description:
      'Surf City is the island\'s hub — a small downtown with shops, restaurants, and the bridge to the mainland. It\'s the most walkable community on LBI, with deli culture, ice cream, and everything within easy reach.',
    highlights: ['Bay Village shops', 'Wally\'s Restaurant', 'LBI Brewing', 'Central location'],
    vibe: 'Social & walkable',
  },
  {
    slug: 'ship-bottom',
    name: 'Ship Bottom',
    tagline: 'Where the causeway meets the sea',
    description:
      'Ship Bottom is the first town you hit off the causeway — wide, flat, and perfectly positioned. Filled with rental homes of all sizes, it\'s a popular choice for large groups wanting quick access to the island\'s best dining.',
    highlights: ['Route 72 access', 'Ship Bottom Boardwalk area', 'Wide family beaches', 'Great dining nearby'],
    vibe: 'Family & accessible',
  },
  {
    slug: 'brant-beach',
    name: 'Brant Beach',
    tagline: 'Classic LBI summer',
    description:
      'Brant Beach is quintessential Long Beach Island — tight blocks, well-kept Cape Cods, and a neighborhood feel that has drawn the same families back for generations. The beach here is wide and the waves are perfect.',
    highlights: ['Classic beach houses', 'Tight-knit community', 'Great surf', 'Bay access'],
    vibe: 'Traditional & neighborly',
  },
  {
    slug: 'spray-beach',
    name: 'Spray Beach',
    tagline: 'Quiet between the towns',
    description:
      'A small, quiet community tucked between Brant Beach and Beach Haven, Spray Beach feels like a well-kept secret. Minimal traffic, wide beaches, and a peaceful pace.',
    highlights: ['Low foot traffic', 'Wide beaches', 'Quiet blocks', 'Short drive to Beach Haven'],
    vibe: 'Peaceful & unhurried',
  },
  {
    slug: 'beach-haven',
    name: 'Beach Haven',
    tagline: 'The town that never stops',
    description:
      'Beach Haven is LBI\'s most vibrant town — home to the Surflight Theatre, Fantasy Island amusement park, Kapler Park, and more bars and restaurants per block than anywhere else on the island. Perfect for groups who want it all.',
    highlights: ['Fantasy Island amusement park', 'Surflight Theatre', 'Bay Village', 'Nightlife & dining strip'],
    vibe: 'Lively & entertainment-focused',
  },
];

export function getTownBySlug(slug: string): TownInfo | undefined {
  return LBI_TOWNS.find((t) => t.slug === slug);
}

export const ALL_TOWN_NAMES = LBI_TOWNS.map((t) => t.name);
