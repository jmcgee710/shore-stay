import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../prisma.js';
import type { AuthPayload, AuthRole } from '../middleware/auth.js';

const router = Router();
const SALT_ROUNDS = 12;

function signToken(payload: AuthPayload, expiresIn: string = '7d'): string {
  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn } as jwt.SignOptions);
}

const RegisterSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

/** POST /api/auth/register — create a homeowner account */
router.post('/register', async (req, res) => {
  const parsed = RegisterSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    res.status(409).json({ error: 'Email already registered' });
    return;
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await prisma.user.create({
    data: { name, email, passwordHash, role: 'HOMEOWNER' },
  });

  const token = signToken({ sub: user.id, role: 'HOMEOWNER', email: user.email, name: user.name });
  res.status(201).json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

/** POST /api/auth/login — homeowner or property manager login */
router.post('/login', async (req, res) => {
  const parsed = LoginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.passwordHash) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const token = signToken({
    sub: user.id,
    role: user.role as AuthRole,
    email: user.email,
    name: user.name,
  });
  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
});

const PlannerLoginSchema = z.object({
  bookingId: z.string().min(1),
  name: z.string().min(1),
  pin: z.string().length(4).regex(/^\d{4}$/, 'PIN must be 4 digits'),
});

/** POST /api/auth/planner-login — trip planner access via name + 4-digit PIN */
router.post('/planner-login', async (req, res) => {
  const parsed = PlannerLoginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { bookingId, name, pin } = parsed.data;

  const planners = await prisma.tripPlanner.findMany({ where: { bookingId } });
  let matched: (typeof planners)[0] | null = null;
  for (const planner of planners) {
    if (planner.name.toLowerCase() === name.toLowerCase()) {
      const valid = await bcrypt.compare(pin, planner.pinHash);
      if (valid) {
        matched = planner;
        break;
      }
    }
  }

  if (!matched) {
    res.status(401).json({ error: 'Invalid name or PIN' });
    return;
  }

  const token = signToken(
    { sub: matched.id, role: 'TRIP_PLANNER', bookingId, name: matched.name },
    '24h'
  );
  res.json({ token, planner: { id: matched.id, name: matched.name, bookingId } });
});

/** POST /api/auth/watcher-register — create a home watcher account */
router.post('/watcher-register', async (req, res) => {
  const parsed = RegisterSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    res.status(409).json({ error: 'Email already registered' });
    return;
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await prisma.user.create({
    data: { name, email, passwordHash, role: 'HOME_WATCHER' },
  });

  const token = signToken({ sub: user.id, role: 'HOME_WATCHER', email: user.email, name: user.name });
  res.status(201).json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
});

/** POST /api/auth/watcher-accept/:inviteToken — accept a property watch invitation */
router.post('/watcher-accept/:inviteToken', async (req, res) => {
  // Requires an authenticated HOME_WATCHER JWT
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized' }); return;
  }
  let watcherId: string;
  try {
    const payload = (await import('jsonwebtoken')).default.verify(
      authHeader.slice(7), process.env.JWT_SECRET!
    ) as AuthPayload;
    if (payload.role !== 'HOME_WATCHER') {
      res.status(403).json({ error: 'Must be a Home Watcher account' }); return;
    }
    watcherId = payload.sub;
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' }); return;
  }

  const assignment = await prisma.watcherAssignment.findUnique({
    where: { inviteToken: req.params.inviteToken },
  });
  if (!assignment) {
    res.status(404).json({ error: 'Invite not found or already used' }); return;
  }
  if (assignment.inviteAccepted) {
    res.status(409).json({ error: 'Invite already accepted' }); return;
  }

  const updated = await prisma.watcherAssignment.update({
    where: { inviteToken: req.params.inviteToken },
    data: { watcherId, inviteAccepted: true },
    include: { property: { select: { id: true, name: true, address: true } } },
  });
  res.json(updated);
});

/** GET /api/auth/guest/:token — validate a QR code / share link token */
router.get('/guest/:token', async (req, res) => {
  const booking = await prisma.booking.findUnique({
    where: { qrCodeToken: req.params.token },
    include: {
      property: { select: { id: true, name: true, address: true } },
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
    booking: {
      id: booking.id,
      startDate: booking.startDate,
      endDate: booking.endDate,
      property: booking.property,
    },
  });
});

export default router;
