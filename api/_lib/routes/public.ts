import { Router } from 'express';
import prisma from '../prisma.js';

const router = Router();

// GET /api/public/towns — LBI towns with listing counts
router.get('/towns', async (_req, res) => {
  try {
    const counts = await prisma.property.groupBy({
      by: ['town'],
      where: { isPublished: true, town: { not: null } },
      _count: { id: true },
    });
    res.json(counts.map((r) => ({ town: r.town, count: r._count.id })));
  } catch {
    res.status(500).json({ error: 'Failed to fetch towns' });
  }
});

// GET /api/public/listings — search/filter published listings
router.get('/listings', async (req, res) => {
  try {
    const {
      town,
      minBeds,
      minBaths,
      pets,
      beachSide,
      checkin,
      checkout,
      limit = '24',
      offset = '0',
    } = req.query as Record<string, string>;

    const where: Record<string, unknown> = { isPublished: true };

    if (town) where.town = town;
    if (minBeds) where.bedrooms = { gte: parseInt(minBeds, 10) };
    if (minBaths) where.bathrooms = { gte: parseInt(minBaths, 10) };
    if (pets === 'true') where.petFriendly = true;
    if (beachSide) where.beachSide = beachSide;

    if (checkin && checkout) {
      where.NOT = {
        bookings: {
          some: {
            startDate: { lte: new Date(checkout) },
            endDate: { gte: new Date(checkin) },
          },
        },
      };
    }

    const [listings, total] = await Promise.all([
      prisma.property.findMany({
        where,
        take: parseInt(limit, 10),
        skip: parseInt(offset, 10),
        orderBy: { name: 'asc' },
        select: {
          id: true,
          name: true,
          address: true,
          town: true,
          bedrooms: true,
          bathrooms: true,
          petFriendly: true,
          beachSide: true,
          nightlyRate: true,
          coverPhotoUrl: true,
          description: true,
          amenities: true,
          photos: {
            where: { isCover: true },
            take: 1,
            select: { url: true },
          },
        },
      }),
      prisma.property.count({ where }),
    ]);

    res.json({ listings, total, limit: parseInt(limit, 10), offset: parseInt(offset, 10) });
  } catch {
    res.status(500).json({ error: 'Failed to fetch listings' });
  }
});

// GET /api/public/listings/:id — full listing detail
router.get('/listings/:id', async (req, res) => {
  try {
    const property = await prisma.property.findUnique({
      where: { id: req.params.id, isPublished: true },
      select: {
        id: true,
        name: true,
        address: true,
        town: true,
        bedrooms: true,
        bathrooms: true,
        petFriendly: true,
        beachSide: true,
        nightlyRate: true,
        coverPhotoUrl: true,
        description: true,
        amenities: true,
        ownerPhone: true,
        ownerEmail: true,
        latitude: true,
        longitude: true,
        photos: {
          orderBy: { sortOrder: 'asc' },
          select: { id: true, url: true, caption: true, isCover: true },
        },
        ownersPicks: {
          orderBy: { sortOrder: 'asc' },
          select: { id: true, name: true, category: true, ownerNote: true, link: true, photoUrl: true },
        },
        bookings: {
          select: { startDate: true, endDate: true },
          where: { endDate: { gte: new Date() } },
        },
      },
    });

    if (!property) return res.status(404).json({ error: 'Listing not found' });
    res.json(property);
  } catch {
    res.status(500).json({ error: 'Failed to fetch listing' });
  }
});

export default router;
