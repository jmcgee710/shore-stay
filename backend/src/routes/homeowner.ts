import { Router } from 'express';
import { randomUUID } from 'crypto';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import prisma from '../prisma.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth('HOMEOWNER'));

const uid = (req: any): string => req.auth!.sub;

async function ownedProp(id: string, homeownerId: string) {
  return prisma.property.findFirst({ where: { id, homeownerId } });
}

// ─── Properties ──────────────────────────────────────────────────────────────

const PropertySchema = z.object({
  name: z.string().min(1),
  address: z.string().min(1),
  description: z.string().optional(),
  rules: z.string().optional(),
  wifiInfo: z.string().optional(),
  parkingInfo: z.string().optional(),
  // Listing browser fields
  town: z.string().optional().nullable(),
  bedrooms: z.number().int().min(0).optional().nullable(),
  bathrooms: z.number().min(0).optional().nullable(),
  petFriendly: z.boolean().optional(),
  beachSide: z.enum(['ocean', 'bay', 'lagoon', 'both']).optional().nullable(),
  amenities: z.array(z.string()).optional(),
  isPublished: z.boolean().optional(),
  nightlyRate: z.number().min(0).optional().nullable(),
  coverPhotoUrl: z.string().url().optional().nullable().or(z.literal('')),
  ownerPhone: z.string().optional().nullable(),
  ownerEmail: z.string().email().optional().nullable().or(z.literal('')),
});

router.get('/properties', async (req, res) => {
  const props = await prisma.property.findMany({
    where: { homeownerId: uid(req) },
    include: { _count: { select: { bookings: true, rooms: true } } },
    orderBy: { name: 'asc' },
  });
  res.json(props);
});

router.post('/properties', async (req, res) => {
  const parsed = PropertySchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }
  const property = await prisma.property.create({ data: { ...parsed.data, homeownerId: uid(req) } });
  res.status(201).json(property);
});

router.get('/properties/:id', async (req, res) => {
  if (!await ownedProp(req.params.id, uid(req))) { res.status(404).json({ error: 'Not found' }); return; }
  const property = await prisma.property.findUnique({
    where: { id: req.params.id },
    include: {
      rooms: { orderBy: { name: 'asc' } },
      appliances: { orderBy: { name: 'asc' } },
      maintenanceTasks: { orderBy: { dueDate: 'asc' } },
      guideItems: { orderBy: { category: 'asc' } },
      bookings: {
        orderBy: { startDate: 'desc' },
        include: { tripPlanners: { select: { id: true, name: true } } },
      },
    },
  });
  res.json(property);
});

router.put('/properties/:id', async (req, res) => {
  if (!await ownedProp(req.params.id, uid(req))) { res.status(404).json({ error: 'Not found' }); return; }
  const parsed = PropertySchema.partial().safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }
  const updated = await prisma.property.update({ where: { id: req.params.id }, data: parsed.data });
  res.json(updated);
});

// ─── Rooms ───────────────────────────────────────────────────────────────────

const RoomSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['bedroom', 'bathroom', 'common', 'outdoor']),
  description: z.string().optional(),
});

router.post('/properties/:id/rooms', async (req, res) => {
  if (!await ownedProp(req.params.id, uid(req))) { res.status(404).json({ error: 'Not found' }); return; }
  const parsed = RoomSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }
  const room = await prisma.room.create({ data: { ...parsed.data, propertyId: req.params.id } });
  res.status(201).json(room);
});

router.put('/properties/:id/rooms/:roomId', async (req, res) => {
  if (!await ownedProp(req.params.id, uid(req))) { res.status(404).json({ error: 'Not found' }); return; }
  const parsed = RoomSchema.partial().safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }
  const room = await prisma.room.update({ where: { id: req.params.roomId }, data: parsed.data });
  res.json(room);
});

router.delete('/properties/:id/rooms/:roomId', async (req, res) => {
  if (!await ownedProp(req.params.id, uid(req))) { res.status(404).json({ error: 'Not found' }); return; }
  await prisma.room.delete({ where: { id: req.params.roomId } });
  res.status(204).end();
});

// ─── Bookings ────────────────────────────────────────────────────────────────

const BookingSchema = z.object({
  startDate: z.string(),
  endDate: z.string(),
  planners: z
    .array(z.object({ name: z.string().min(1), pin: z.string().length(4).regex(/^\d{4}$/) }))
    .max(2)
    .optional(),
});

router.get('/properties/:id/bookings', async (req, res) => {
  if (!await ownedProp(req.params.id, uid(req))) { res.status(404).json({ error: 'Not found' }); return; }
  const bookings = await prisma.booking.findMany({
    where: { propertyId: req.params.id },
    orderBy: { startDate: 'desc' },
    include: { tripPlanners: { select: { id: true, name: true } } },
  });
  res.json(bookings);
});

router.post('/properties/:id/bookings', async (req, res) => {
  if (!await ownedProp(req.params.id, uid(req))) { res.status(404).json({ error: 'Not found' }); return; }
  const parsed = BookingSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }

  const { startDate, endDate, planners = [] } = parsed.data;
  const token = randomUUID();
  const base = process.env.FRONTEND_URL ?? 'http://localhost:5173';
  const shareLink = `${base}/stay/${token}`;

  const plannerData = await Promise.all(
    planners.map(async (p) => ({ name: p.name, pinHash: await bcrypt.hash(p.pin, 10) }))
  );

  const booking = await prisma.booking.create({
    data: {
      propertyId: req.params.id,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      qrCodeToken: token,
      shareLink,
      tripPlanners: { create: plannerData },
    },
    include: { tripPlanners: { select: { id: true, name: true } } },
  });
  res.status(201).json(booking);
});

router.delete('/properties/:id/bookings/:bookingId', async (req, res) => {
  if (!await ownedProp(req.params.id, uid(req))) { res.status(404).json({ error: 'Not found' }); return; }
  await prisma.groupEvent.deleteMany({ where: { bookingId: req.params.bookingId } });
  await prisma.tripPlanner.deleteMany({ where: { bookingId: req.params.bookingId } });
  await prisma.booking.delete({ where: { id: req.params.bookingId } });
  res.status(204).end();
});

// ─── Appliances ──────────────────────────────────────────────────────────────

const ApplianceSchema = z.object({
  name: z.string().min(1),
  make: z.string().optional(),
  model: z.string().optional(),
  purchaseDate: z.string().optional(),
  maintenanceNotes: z.string().optional(),
});

router.post('/properties/:id/appliances', async (req, res) => {
  if (!await ownedProp(req.params.id, uid(req))) { res.status(404).json({ error: 'Not found' }); return; }
  const parsed = ApplianceSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }
  const { purchaseDate, ...rest } = parsed.data;
  const appliance = await prisma.appliance.create({
    data: { ...rest, propertyId: req.params.id, purchaseDate: purchaseDate ? new Date(purchaseDate) : null },
  });
  res.status(201).json(appliance);
});

router.put('/properties/:id/appliances/:aid', async (req, res) => {
  if (!await ownedProp(req.params.id, uid(req))) { res.status(404).json({ error: 'Not found' }); return; }
  const parsed = ApplianceSchema.partial().safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }
  const { purchaseDate, ...rest } = parsed.data;
  const appliance = await prisma.appliance.update({
    where: { id: req.params.aid },
    data: { ...rest, ...(purchaseDate !== undefined ? { purchaseDate: purchaseDate ? new Date(purchaseDate) : null } : {}) },
  });
  res.json(appliance);
});

router.delete('/properties/:id/appliances/:aid', async (req, res) => {
  if (!await ownedProp(req.params.id, uid(req))) { res.status(404).json({ error: 'Not found' }); return; }
  await prisma.appliance.delete({ where: { id: req.params.aid } });
  res.status(204).end();
});

// ─── Maintenance ─────────────────────────────────────────────────────────────

const MaintenanceSchema = z.object({
  title: z.string().min(1),
  dueDate: z.string(),
  recurrence: z.string().optional(),
});

router.post('/properties/:id/maintenance', async (req, res) => {
  if (!await ownedProp(req.params.id, uid(req))) { res.status(404).json({ error: 'Not found' }); return; }
  const parsed = MaintenanceSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }
  const task = await prisma.maintenanceTask.create({
    data: { ...parsed.data, propertyId: req.params.id, dueDate: new Date(parsed.data.dueDate) },
  });
  res.status(201).json(task);
});

router.put('/properties/:id/maintenance/:tid', async (req, res) => {
  if (!await ownedProp(req.params.id, uid(req))) { res.status(404).json({ error: 'Not found' }); return; }
  const parsed = MaintenanceSchema.partial()
    .extend({ completedAt: z.string().nullable().optional() })
    .safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }
  const { dueDate, completedAt, ...rest } = parsed.data;
  const task = await prisma.maintenanceTask.update({
    where: { id: req.params.tid },
    data: {
      ...rest,
      ...(dueDate ? { dueDate: new Date(dueDate) } : {}),
      ...(completedAt !== undefined ? { completedAt: completedAt ? new Date(completedAt) : null } : {}),
    },
  });
  res.json(task);
});

router.delete('/properties/:id/maintenance/:tid', async (req, res) => {
  if (!await ownedProp(req.params.id, uid(req))) { res.status(404).json({ error: 'Not found' }); return; }
  await prisma.maintenanceTask.delete({ where: { id: req.params.tid } });
  res.status(204).end();
});

// ─── Local Guide ─────────────────────────────────────────────────────────────

const GuideSchema = z.object({
  category: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  websiteUrl: z.string().url().optional().or(z.literal('')),
});

router.post('/properties/:id/guide', async (req, res) => {
  if (!await ownedProp(req.params.id, uid(req))) { res.status(404).json({ error: 'Not found' }); return; }
  const parsed = GuideSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }
  const item = await prisma.localGuideItem.create({
    data: { ...parsed.data, websiteUrl: parsed.data.websiteUrl || null, propertyId: req.params.id },
  });
  res.status(201).json(item);
});

router.put('/properties/:id/guide/:gid', async (req, res) => {
  if (!await ownedProp(req.params.id, uid(req))) { res.status(404).json({ error: 'Not found' }); return; }
  const parsed = GuideSchema.partial().safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }
  const item = await prisma.localGuideItem.update({
    where: { id: req.params.gid },
    data: { ...parsed.data, websiteUrl: parsed.data.websiteUrl || null },
  });
  res.json(item);
});

router.delete('/properties/:id/guide/:gid', async (req, res) => {
  if (!await ownedProp(req.params.id, uid(req))) { res.status(404).json({ error: 'Not found' }); return; }
  await prisma.localGuideItem.delete({ where: { id: req.params.gid } });
  res.status(204).end();
});

// ─── Owner's Picks ────────────────────────────────────────────────────────────

const PickSchema = z.object({
  name: z.string().min(1),
  category: z.enum(['dining', 'bars', 'beaches', 'activities', 'shopping', 'other']),
  ownerNote: z.string().optional().nullable(),
  link: z.string().url().optional().nullable().or(z.literal('')),
  photoUrl: z.string().url().optional().nullable().or(z.literal('')),
  sortOrder: z.number().int().optional(),
});

router.get('/properties/:id/picks', async (req, res) => {
  if (!await ownedProp(req.params.id, uid(req))) { res.status(404).json({ error: 'Not found' }); return; }
  const picks = await prisma.ownersPick.findMany({
    where: { propertyId: req.params.id },
    orderBy: { sortOrder: 'asc' },
  });
  res.json(picks);
});

router.post('/properties/:id/picks', async (req, res) => {
  if (!await ownedProp(req.params.id, uid(req))) { res.status(404).json({ error: 'Not found' }); return; }
  const parsed = PickSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }
  const count = await prisma.ownersPick.count({ where: { propertyId: req.params.id } });
  const pick = await prisma.ownersPick.create({
    data: {
      ...parsed.data,
      link: parsed.data.link || null,
      photoUrl: parsed.data.photoUrl || null,
      sortOrder: parsed.data.sortOrder ?? count,
      propertyId: req.params.id,
    },
  });
  res.status(201).json(pick);
});

router.put('/properties/:id/picks/:pid', async (req, res) => {
  if (!await ownedProp(req.params.id, uid(req))) { res.status(404).json({ error: 'Not found' }); return; }
  const parsed = PickSchema.partial().safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }
  const pick = await prisma.ownersPick.update({
    where: { id: req.params.pid },
    data: {
      ...parsed.data,
      link: parsed.data.link || null,
      photoUrl: parsed.data.photoUrl || null,
    },
  });
  res.json(pick);
});

router.delete('/properties/:id/picks/:pid', async (req, res) => {
  if (!await ownedProp(req.params.id, uid(req))) { res.status(404).json({ error: 'Not found' }); return; }
  await prisma.ownersPick.delete({ where: { id: req.params.pid } });
  res.status(204).end();
});

export default router;
