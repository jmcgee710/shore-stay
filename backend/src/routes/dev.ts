import { Router } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../prisma.js';

const router = Router();

const SEED_NAMES = ['The Salt Box', 'Dune Lullaby', 'Northeasterly', 'Sunset Bungalow', 'Sea Glass Cottage', 'Sandy Pines', 'Ocean Front Escape'];

async function wipe(name: string) {
  const p = await prisma.property.findFirst({ where: { name } });
  if (!p) return;
  await prisma.ownersPick.deleteMany({ where: { propertyId: p.id } });
  await prisma.propertyPhoto.deleteMany({ where: { propertyId: p.id } });
  await prisma.groupEvent.deleteMany({ where: { booking: { propertyId: p.id } } });
  await prisma.tripPlanner.deleteMany({ where: { booking: { propertyId: p.id } } });
  await prisma.booking.deleteMany({ where: { propertyId: p.id } });
  await prisma.localGuideItem.deleteMany({ where: { propertyId: p.id } });
  await prisma.room.deleteMany({ where: { propertyId: p.id } });
  await prisma.appliance.deleteMany({ where: { propertyId: p.id } });
  await prisma.maintenanceTask.deleteMany({ where: { propertyId: p.id } });
  await prisma.contractorDispatch.deleteMany({ where: { propertyId: p.id } });
  await prisma.stormAlert.deleteMany({ where: { propertyId: p.id } });
  await prisma.watchReport.deleteMany({ where: { propertyId: p.id } });
  await prisma.watcherAssignment.deleteMany({ where: { propertyId: p.id } });
  await prisma.complianceDocument.deleteMany({ where: { propertyId: p.id } });
  await prisma.complianceState.deleteMany({ where: { propertyId: p.id } });
  await prisma.property.delete({ where: { id: p.id } });
}

router.post('/seed', async (_req, res) => {
  for (const name of SEED_NAMES) await wipe(name);

  // ── Owner: Sarah Calabrese ─────────────────────────────────────────────────
  let owner = await prisma.user.findUnique({ where: { email: 'sarah@calabrese.co' } });
  if (!owner) {
    const hash = await bcrypt.hash('demo1234', 10);
    owner = await prisma.user.create({
      data: { name: 'Sarah Calabrese', email: 'sarah@calabrese.co', passwordHash: hash, role: 'HOMEOWNER' },
    });
  }

  // ── Property 1: The Salt Box (Beach Haven, occupied) ──────────────────────
  const saltBox = await prisma.property.create({
    data: {
      homeownerId: owner.id,
      name: 'The Salt Box',
      address: '412 Holyoke Ave, Beach Haven, NJ 08008',
      town: 'Beach Haven',
      bedrooms: 4,
      bathrooms: 2.5,
      petFriendly: false,
      beachSide: 'ocean',
      amenities: ['WiFi', 'AC', 'Washer/Dryer', 'Dishwasher', 'Deck/patio', 'Outdoor shower', 'Beach chairs', 'Beach badges', 'Smart TV', 'BBQ grill'],
      isPublished: true,
      nightlyRate: 689,
      coverPhotoUrl: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800&auto=format&fit=crop',
      ownerPhone: '(609) 555-0101',
      ownerEmail: 'sarah@calabrese.co',
      description: 'Classic Beach Haven shore house — 4 bedrooms, a wraparound deck, and a 5-minute walk to the Fantasy Island strip. Sarah\'s flagship property, 92% occupied last season.',
      rules: '• No smoking inside\n• No pets\n• Quiet hours after 10 PM\n• Max 8 guests\n• Trash pickup: Monday mornings',
      wifiInfo: 'Network: SaltBox5G\nPassword: beachhaven2025',
      parkingInfo: '2 spots in driveway. Street parking on Holyoke Ave.',
      rooms: {
        create: [
          { name: 'Captain\'s Quarters', type: 'bedroom', description: 'King bed, ocean view, 2nd floor.' },
          { name: 'The Bunk Room', type: 'bedroom', description: '2 twin bunks, sleeps 4, 2nd floor.' },
          { name: 'Cedar Room', type: 'bedroom', description: 'Queen bed, 2nd floor.' },
          { name: 'Dune Room', type: 'bedroom', description: 'Queen bed, 1st floor.' },
          { name: 'Primary Bath', type: 'bathroom', description: 'Walk-in shower, double vanity.' },
          { name: 'Hall Bath', type: 'bathroom', description: 'Tub/shower combo.' },
          { name: 'Living Room', type: 'common', description: '65" TV, sectional sofa, ocean views.' },
          { name: 'Outdoor Shower', type: 'outdoor', description: 'Hot & cold, towels in bin.' },
        ],
      },
      photos: {
        create: [
          { url: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=1200&auto=format&fit=crop', isCover: true, sortOrder: 0, caption: 'Oceanfront deck' },
          { url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop', isCover: false, sortOrder: 1, caption: 'Living room' },
          { url: 'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=800&auto=format&fit=crop', isCover: false, sortOrder: 2, caption: 'Kitchen' },
          { url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&auto=format&fit=crop', isCover: false, sortOrder: 3, caption: 'Master bedroom' },
        ],
      },
      ownersPicks: {
        create: [
          { name: 'The Chicken or the Egg', category: 'dining', ownerNote: 'Best breakfast on LBI — get there early or you\'ll wait. The egg sandwiches are legendary.', sortOrder: 0 },
          { name: 'Morrison\'s Corner Tavern', category: 'bars', ownerNote: 'Our go-to after dinner. Great craft beer and a packed porch in summer.', sortOrder: 1 },
          { name: 'Fantasy Island Amusement Park', category: 'activities', ownerNote: 'Right down the road — a must if you have kids. Old-school in the best way.', sortOrder: 2 },
          { name: 'Kapler Park Beach', category: 'beaches', ownerNote: 'Our favorite beach in town. Less crowded than the main streets.', sortOrder: 3 },
        ],
      },
      guideItems: {
        create: [
          { category: 'dining', name: 'The Chicken or the Egg', description: 'Best breakfast on LBI. Lines out the door by 9am.' },
          { category: 'bars', name: 'Morrison\'s Corner Tavern', description: 'Great craft beer, packed summer porch.' },
          { category: 'activities', name: 'Fantasy Island Amusement Park', description: 'Classic rides, great for kids.' },
          { category: 'dining', name: 'Tucker\'s', description: 'Upscale beach haven — best dinner reservation on the island.' },
          { category: 'activities', name: 'Holyoke Ave Beach', description: 'End of the street. Beautiful wide stretch.' },
        ],
      },
    },
  });

  // ── Property 2: Dune Lullaby (Surf City, turn day) ────────────────────────
  const duneLullaby = await prisma.property.create({
    data: {
      homeownerId: owner.id,
      name: 'Dune Lullaby',
      address: '1804 N Long Beach Blvd, Surf City, NJ 08008',
      town: 'Surf City',
      bedrooms: 3,
      bathrooms: 2,
      petFriendly: true,
      beachSide: 'bay',
      amenities: ['WiFi', 'AC', 'Washer/Dryer', 'Deck/patio', 'Outdoor shower', 'Beach chairs', 'Beach badges', 'Kayak/paddleboard', 'BBQ grill'],
      isPublished: true,
      nightlyRate: 459,
      coverPhotoUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&auto=format&fit=crop',
      ownerPhone: '(609) 555-0101',
      ownerEmail: 'sarah@calabrese.co',
      description: 'Bayside cottage in the heart of Surf City. Kayaks included, dogs welcome, walk to LBI Brewing.',
      rules: '• Dogs welcome (max 2)\n• No smoking\n• Quiet after 10 PM\n• Max 6 guests',
      wifiInfo: 'Network: DuneLullaby\nPassword: surfcity2025',
      parkingInfo: '2 spots in gravel pad.',
      rooms: {
        create: [
          { name: 'Main Bedroom', type: 'bedroom', description: 'Queen bed, bay views.' },
          { name: 'Guest Room', type: 'bedroom', description: 'Queen bed.' },
          { name: 'Bunk Nook', type: 'bedroom', description: 'Twin over twin.' },
        ],
      },
      ownersPicks: {
        create: [
          { name: 'LBI Brewing Company', category: 'bars', ownerNote: 'Best craft beer on the island. The outdoor patio is great on a summer night.', sortOrder: 0 },
          { name: 'Wally\'s Restaurant & Bar', category: 'dining', ownerNote: 'Best burgers and truffle fries — get a table on the deck.', sortOrder: 1 },
          { name: 'Country Kettle Fudge', category: 'shopping', ownerNote: 'A true LBI institution. Get the peanut butter fudge.', sortOrder: 2 },
        ],
      },
      guideItems: {
        create: [
          { category: 'bars', name: 'LBI Brewing Company', description: 'Best craft beer on the island.' },
          { category: 'dining', name: 'Wally\'s Restaurant & Bar', description: 'Best burgers, great deck.' },
          { category: 'shopping', name: 'Country Kettle Fudge', description: 'LBI institution. Try the peanut butter fudge.' },
        ],
      },
    },
  });

  // ── Property 3: Northeasterly (Loveladies, vacant) ────────────────────────
  const northeasterly = await prisma.property.create({
    data: {
      homeownerId: owner.id,
      name: 'Northeasterly',
      address: '8 Pelham Rd, Loveladies, NJ 08008',
      town: 'Barnegat Light',
      bedrooms: 5,
      bathrooms: 3,
      petFriendly: false,
      beachSide: 'ocean',
      amenities: ['WiFi', 'AC', 'Washer/Dryer', 'Dishwasher', 'Pool', 'Hot tub', 'Deck/patio', 'Outdoor shower', 'Beach chairs', 'Beach badges', 'Smart TV', 'Game room'],
      isPublished: true,
      nightlyRate: 1120,
      coverPhotoUrl: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&auto=format&fit=crop',
      ownerPhone: '(609) 555-0101',
      ownerEmail: 'sarah@calabrese.co',
      description: 'Loveladies oceanfront — the flagship. Private pool, 5 bedrooms, panoramic views. Sarah\'s crown jewel.',
      rules: '• No smoking\n• No pets\n• No parties\n• Max 10 guests\n• Pool hours 8am–10pm',
      wifiInfo: 'Network: Northeasterly_LBI\nPassword: loveladies2025',
      parkingInfo: '3 spots in attached garage.',
      rooms: {
        create: [
          { name: 'Ocean Suite', type: 'bedroom', description: 'King bed, private deck, direct ocean view.' },
          { name: 'North Room', type: 'bedroom', description: 'King bed, ensuite.' },
          { name: 'Garden Room', type: 'bedroom', description: 'Queen bed.' },
          { name: 'Bunk Suite', type: 'bedroom', description: 'Two bunk sets, sleeps 4.' },
          { name: 'Loft', type: 'bedroom', description: 'Queen with skylights.' },
        ],
      },
      ownersPicks: {
        create: [
          { name: 'Kubel\'s Too', category: 'dining', ownerNote: 'Best seafood in Barnegat Light. Reserve ahead — always packed.', sortOrder: 0 },
          { name: 'Old Barney Lighthouse', category: 'activities', ownerNote: '172 steps but the view is worth every one. Go early.', sortOrder: 1 },
          { name: 'Viking Village Fishermen', category: 'activities', ownerNote: 'Watch the boats unload catch in the morning. Totally unique.', sortOrder: 2 },
        ],
      },
      guideItems: {
        create: [
          { category: 'dining', name: 'Kubel\'s Too', description: 'Best seafood in Barnegat Light.' },
          { category: 'activities', name: 'Barnegat Lighthouse', description: 'Climb Old Barney for incredible views.' },
        ],
      },
    },
  });

  // ── Bookings ────────────────────────────────────────────────────────────────
  const aug = (day: number) => new Date(2026, 7, day, 15, 0, 0); // Aug is month 7 (0-indexed)

  // Salt Box bookings
  const b1 = await prisma.booking.create({ data: { propertyId: saltBox.id, startDate: aug(8), endDate: aug(15), qrCodeToken: 'tk-9f3a-22c1', shareLink: 'http://localhost:5173/stay/tk-9f3a-22c1' } });
  await prisma.booking.create({ data: { propertyId: saltBox.id, startDate: aug(16), endDate: aug(23), qrCodeToken: 'tk-7d22-91aa', shareLink: 'http://localhost:5173/stay/tk-7d22-91aa' } });
  await prisma.booking.create({ data: { propertyId: saltBox.id, startDate: aug(24), endDate: aug(31), qrCodeToken: 'tk-3c81-44de', shareLink: 'http://localhost:5173/stay/tk-3c81-44de' } });

  // Dune Lullaby bookings
  await prisma.booking.create({ data: { propertyId: duneLullaby.id, startDate: aug(1), endDate: aug(8), qrCodeToken: 'tk-1aa2-99ef', shareLink: 'http://localhost:5173/stay/tk-1aa2-99ef' } });
  await prisma.booking.create({ data: { propertyId: duneLullaby.id, startDate: aug(9), endDate: aug(16), qrCodeToken: 'tk-44b9-00cd', shareLink: 'http://localhost:5173/stay/tk-44b9-00cd' } });

  // Northeasterly booking
  await prisma.booking.create({ data: { propertyId: northeasterly.id, startDate: aug(22), endDate: aug(29), qrCodeToken: 'tk-9912-77ba', shareLink: 'http://localhost:5173/stay/tk-9912-77ba' } });

  // Trip planner on b1
  const pinHash = await bcrypt.hash('1234', 10);
  await prisma.tripPlanner.create({ data: { bookingId: b1.id, name: 'Alex', pinHash } });

  // ── Watchers ────────────────────────────────────────────────────────────────
  const { randomUUID } = await import('crypto');

  let ray = await prisma.user.findUnique({ where: { email: 'ray.mitchell@shorestay.dev' } });
  if (!ray) {
    const h = await bcrypt.hash('watcher123', 10);
    ray = await prisma.user.create({ data: { name: 'Ray Mitchell', email: 'ray.mitchell@shorestay.dev', passwordHash: h, role: 'HOME_WATCHER' } });
  }
  await prisma.watcherAssignment.upsert({
    where: { watcherId_propertyId: { watcherId: ray.id, propertyId: saltBox.id } },
    update: { inviteAccepted: true, handsOffMode: true },
    create: { watcherId: ray.id, propertyId: saltBox.id, inviteToken: randomUUID(), inviteAccepted: true, handsOffMode: true },
  });
  await prisma.watcherAssignment.upsert({
    where: { watcherId_propertyId: { watcherId: ray.id, propertyId: duneLullaby.id } },
    update: { inviteAccepted: true, handsOffMode: true },
    create: { watcherId: ray.id, propertyId: duneLullaby.id, inviteToken: randomUUID(), inviteAccepted: true, handsOffMode: true },
  });
  await prisma.watchReport.create({
    data: { propertyId: saltBox.id, watcherId: ray.id, summary: 'All clear — no issues found. Checked all windows and doors. Found one loose gate latch on the south side yard, nothing urgent.', overallCondition: 'good', photoUrls: [], notes: 'Gate latch on south side is a little wobbly. Will monitor.' },
  });

  let diane = await prisma.user.findUnique({ where: { email: 'diane.pulaski@shorestay.dev' } });
  if (!diane) {
    const h = await bcrypt.hash('watcher123', 10);
    diane = await prisma.user.create({ data: { name: 'Diane Pulaski', email: 'diane.pulaski@shorestay.dev', passwordHash: h, role: 'HOME_WATCHER' } });
  }
  await prisma.watcherAssignment.upsert({
    where: { watcherId_propertyId: { watcherId: diane.id, propertyId: northeasterly.id } },
    update: { inviteAccepted: true, handsOffMode: false },
    create: { watcherId: diane.id, propertyId: northeasterly.id, inviteToken: randomUUID(), inviteAccepted: true, handsOffMode: false },
  });
  const alert = await prisma.stormAlert.create({
    data: { propertyId: northeasterly.id, reportedById: diane.id, alertType: 'storm', severity: 'medium', description: 'Nor\'easter passed through overnight. Minor gutter damage on north side. No structural issues.', photoUrls: [], damageCostEstimate: 380, requiresOwnerApproval: true },
  });
  await prisma.contractorDispatch.create({
    data: { stormAlertId: alert.id, propertyId: northeasterly.id, contractorName: 'Coastline Exteriors', contractorPhone: '609-555-0177', trade: 'general', workDescription: 'Repair gutter damage on north elevation', estimatedCost: 380, status: 'pending' },
  });

  // ── Compliance docs ─────────────────────────────────────────────────────────
  const docs = [
    { name: 'Rental Permit 2026.pdf', docType: 'Permits', notes: 'Beach Haven Borough annual rental permit' },
    { name: 'Smoke-CO Inspection Cert.pdf', docType: 'Safety', notes: 'Pre-season inspection, Apr 22 2026' },
    { name: 'Property Insurance Declaration.pdf', docType: 'Insurance', notes: 'Homeowner policy, exp Jan 2027' },
    { name: 'Flood Insurance NFIP.pdf', docType: 'Insurance', notes: 'NFIP policy' },
    { name: 'Lead Paint Disclosure.pdf', docType: 'Safety', notes: '' },
  ];
  for (const d of docs) {
    await prisma.complianceDocument.create({ data: { propertyId: saltBox.id, ...d } });
  }

  res.json({
    message: '3 Sarah Calabrese properties seeded',
    listings: ['The Salt Box', 'Dune Lullaby', 'Northeasterly'],
    guestUrl: 'http://localhost:5173/stay/tk-9f3a-22c1',
    planner: { name: 'Alex', pin: '1234' },
    ownerLogin: { email: 'sarah@calabrese.co', password: 'demo1234' },
    watcherLogins: [
      { email: 'ray.mitchell@shorestay.dev', password: 'watcher123' },
      { email: 'diane.pulaski@shorestay.dev', password: 'watcher123' },
    ],
  });
});

export default router;
