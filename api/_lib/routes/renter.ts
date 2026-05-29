import { Router } from 'express';
import { z } from 'zod';
import prisma from '../prisma.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

async function getValidBooking(token: string) {
  const booking = await prisma.booking.findUnique({ where: { qrCodeToken: token } });
  if (!booking || new Date() > booking.endDate) return null;
  return booking;
}

/** GET /api/renter/:token — full property + booking info for guest view */
router.get('/:token', async (req, res) => {
  const booking = await prisma.booking.findUnique({
    where: { qrCodeToken: req.params.token },
    include: {
      property: {
        select: {
          id: true,
          name: true,
          address: true,
          description: true,
          rules: true,
          wifiInfo: true,
          parkingInfo: true,
          latitude: true,
          longitude: true,
          rooms: { select: { id: true, name: true, type: true, description: true } },
          guideItems: {
            select: { id: true, category: true, name: true, description: true, websiteUrl: true },
          },
        },
      },
    },
  });

  if (!booking) {
    res.status(404).json({ error: 'Invalid access link' });
    return;
  }
  if (new Date() > booking.endDate) {
    res.status(410).json({ error: 'This booking has ended' });
    return;
  }

  res.json({
    id: booking.id,
    startDate: booking.startDate,
    endDate: booking.endDate,
    property: booking.property,
  });
});

/** GET /api/renter/:token/events — all group events for this booking */
router.get('/:token/events', async (req, res) => {
  const booking = await getValidBooking(req.params.token);
  if (!booking) {
    res.status(404).json({ error: 'Invalid access link' });
    return;
  }

  const events = await prisma.groupEvent.findMany({
    where: { bookingId: booking.id },
    orderBy: { datetime: 'asc' },
  });
  res.json(events);
});

const EventSchema = z.object({
  title: z.string().min(1),
  datetime: z.string().datetime(),
  category: z.string().min(1),
  notes: z.string().optional(),
  link: z.string().url().optional().or(z.literal('')),
});

/** POST /api/renter/:token/events — add event (trip planners only) */
router.post('/:token/events', requireAuth('TRIP_PLANNER'), async (req, res) => {
  const booking = await getValidBooking(req.params.token);
  if (!booking) {
    res.status(404).json({ error: 'Invalid access link' });
    return;
  }
  if (req.auth!.bookingId !== booking.id) {
    res.status(403).json({ error: 'Access denied' });
    return;
  }

  const parsed = EventSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { title, datetime, category, notes, link } = parsed.data;
  const event = await prisma.groupEvent.create({
    data: {
      bookingId: booking.id,
      createdByPlannerId: req.auth!.sub,
      title,
      datetime: new Date(datetime),
      category,
      notes: notes ?? null,
      link: link || null,
    },
  });
  res.status(201).json(event);
});

/** DELETE /api/renter/:token/events/:id — remove event (trip planners only) */
router.delete('/:token/events/:id', requireAuth('TRIP_PLANNER'), async (req, res) => {
  const booking = await getValidBooking(req.params.token);
  if (!booking) {
    res.status(404).json({ error: 'Invalid access link' });
    return;
  }
  if (req.auth!.bookingId !== booking.id) {
    res.status(403).json({ error: 'Access denied' });
    return;
  }

  await prisma.groupEvent.deleteMany({
    where: { id: req.params.id, bookingId: booking.id },
  });
  res.status(204).end();
});

export default router;
