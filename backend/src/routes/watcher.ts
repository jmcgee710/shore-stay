import { Router } from 'express';
import { z } from 'zod';
import prisma from '../prisma.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const uid = (req: any): string => req.auth!.sub;

async function ownedProp(id: string, homeownerId: string) {
  return prisma.property.findFirst({ where: { id, homeownerId } });
}

async function watcherCanAccess(propertyId: string, watcherId: string) {
  return prisma.watcherAssignment.findFirst({
    where: { propertyId, watcherId, inviteAccepted: true },
  });
}

// ─── Homeowner-side: manage watcher assignments ───────────────────────────────

router.post('/properties/:id/invite', requireAuth('HOMEOWNER'), async (req, res) => {
  if (!await ownedProp(req.params.id, uid(req))) {
    res.status(404).json({ error: 'Not found' }); return;
  }
  const { randomUUID } = await import('crypto');
  const inviteToken = randomUUID();
  const assignment = await prisma.watcherAssignment.create({
    data: { propertyId: req.params.id, watcherId: uid(req), inviteToken, inviteAccepted: false },
  });
  const inviteUrl = `${process.env.FRONTEND_URL ?? 'http://localhost:5173'}/watcher/accept/${inviteToken}`;
  res.status(201).json({ assignment, inviteUrl });
});

router.get('/properties/:id/assignments', requireAuth('HOMEOWNER'), async (req, res) => {
  if (!await ownedProp(req.params.id, uid(req))) {
    res.status(404).json({ error: 'Not found' }); return;
  }
  const assignments = await prisma.watcherAssignment.findMany({
    where: { propertyId: req.params.id },
    include: { watcher: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json(assignments);
});

router.put('/properties/:id/assignments/:aid', requireAuth('HOMEOWNER'), async (req, res) => {
  if (!await ownedProp(req.params.id, uid(req))) {
    res.status(404).json({ error: 'Not found' }); return;
  }
  const parsed = z.object({ handsOffMode: z.boolean() }).safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }
  const assignment = await prisma.watcherAssignment.update({
    where: { id: req.params.aid },
    data: { handsOffMode: parsed.data.handsOffMode },
  });
  res.json(assignment);
});

router.delete('/properties/:id/assignments/:aid', requireAuth('HOMEOWNER'), async (req, res) => {
  if (!await ownedProp(req.params.id, uid(req))) {
    res.status(404).json({ error: 'Not found' }); return;
  }
  // Delete pending dispatches but keep reports as audit trail
  const assignment = await prisma.watcherAssignment.findUnique({ where: { id: req.params.aid } });
  if (assignment) {
    const alerts = await prisma.stormAlert.findMany({ where: { propertyId: req.params.id } });
    for (const alert of alerts) {
      await prisma.contractorDispatch.deleteMany({
        where: { stormAlertId: alert.id, status: 'pending' },
      });
    }
    await prisma.watcherAssignment.delete({ where: { id: req.params.aid } });
  }
  res.status(204).end();
});

router.get('/properties/:id/reports', requireAuth('HOMEOWNER'), async (req, res) => {
  if (!await ownedProp(req.params.id, uid(req))) {
    res.status(404).json({ error: 'Not found' }); return;
  }
  const page = Number(req.query.page ?? 1);
  const limit = 20;
  const reports = await prisma.watchReport.findMany({
    where: { propertyId: req.params.id },
    include: { watcher: { select: { id: true, name: true } } },
    orderBy: { visitedAt: 'desc' },
    skip: (page - 1) * limit,
    take: limit,
  });
  res.json(reports);
});

router.get('/properties/:id/alerts', requireAuth('HOMEOWNER'), async (req, res) => {
  if (!await ownedProp(req.params.id, uid(req))) {
    res.status(404).json({ error: 'Not found' }); return;
  }
  const alerts = await prisma.stormAlert.findMany({
    where: { propertyId: req.params.id },
    include: {
      reportedBy: { select: { id: true, name: true } },
      dispatches: true,
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json(alerts);
});

router.put('/alerts/:alertId/approve', requireAuth('HOMEOWNER'), async (req, res) => {
  const alert = await prisma.stormAlert.findUnique({ where: { id: req.params.alertId } });
  if (!alert) { res.status(404).json({ error: 'Not found' }); return; }
  if (!await ownedProp(alert.propertyId, uid(req))) {
    res.status(403).json({ error: 'Forbidden' }); return;
  }
  const updated = await prisma.stormAlert.update({
    where: { id: req.params.alertId },
    data: { ownerApprovedAt: new Date() },
  });
  res.json(updated);
});

router.get('/properties/:id/contractors', requireAuth('HOMEOWNER'), async (req, res) => {
  if (!await ownedProp(req.params.id, uid(req))) {
    res.status(404).json({ error: 'Not found' }); return;
  }
  const dispatches = await prisma.contractorDispatch.findMany({
    where: { propertyId: req.params.id },
    include: { stormAlert: { select: { id: true, alertType: true, severity: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json(dispatches);
});

// ─── Watcher-side: submit reports, log alerts, dispatch contractors ───────────

router.get('/my-properties', requireAuth('HOME_WATCHER'), async (req, res) => {
  const assignments = await prisma.watcherAssignment.findMany({
    where: { watcherId: uid(req), inviteAccepted: true },
    include: {
      property: {
        select: { id: true, name: true, address: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json(assignments);
});

const ReportSchema = z.object({
  summary: z.string().min(1),
  overallCondition: z.enum(['good', 'fair', 'needs_attention', 'damage']),
  photoUrls: z.array(z.string().url()).default([]),
  notes: z.string().optional(),
  visitedAt: z.string().optional(),
});

router.post('/properties/:id/reports', requireAuth('HOME_WATCHER'), async (req, res) => {
  if (!await watcherCanAccess(req.params.id, uid(req))) {
    res.status(403).json({ error: 'Not assigned to this property' }); return;
  }
  const parsed = ReportSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }
  const { visitedAt, ...rest } = parsed.data;
  const report = await prisma.watchReport.create({
    data: {
      ...rest,
      propertyId: req.params.id,
      watcherId: uid(req),
      visitedAt: visitedAt ? new Date(visitedAt) : new Date(),
    },
  });
  res.status(201).json(report);
});

const AlertSchema = z.object({
  alertType: z.enum(['storm', 'flood', 'wind_damage', 'utility_failure', 'vandalism', 'other']),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  description: z.string().min(1),
  photoUrls: z.array(z.string().url()).default([]),
  damageCostEstimate: z.number().positive().optional(),
});

router.post('/properties/:id/alerts', requireAuth('HOME_WATCHER'), async (req, res) => {
  const assignment = await watcherCanAccess(req.params.id, uid(req));
  if (!assignment) {
    res.status(403).json({ error: 'Not assigned to this property' }); return;
  }
  const parsed = AlertSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }
  const alert = await prisma.stormAlert.create({
    data: {
      ...parsed.data,
      propertyId: req.params.id,
      reportedById: uid(req),
      requiresOwnerApproval: !assignment.handsOffMode,
    },
  });
  res.status(201).json(alert);
});

const DispatchSchema = z.object({
  contractorName: z.string().min(1),
  contractorPhone: z.string().optional(),
  contractorEmail: z.string().email().optional(),
  trade: z.enum(['plumber', 'electrician', 'roofer', 'general', 'other']),
  workDescription: z.string().min(1),
  estimatedCost: z.number().positive().optional(),
});

router.post('/alerts/:alertId/dispatch', requireAuth('HOME_WATCHER'), async (req, res) => {
  const alert = await prisma.stormAlert.findUnique({ where: { id: req.params.alertId } });
  if (!alert) { res.status(404).json({ error: 'Alert not found' }); return; }
  const assignment = await watcherCanAccess(alert.propertyId, uid(req));
  if (!assignment) {
    res.status(403).json({ error: 'Not assigned to this property' }); return;
  }
  const parsed = DispatchSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }

  const isHandsOff = assignment.handsOffMode;
  const dispatch = await prisma.contractorDispatch.create({
    data: {
      ...parsed.data,
      stormAlertId: req.params.alertId,
      propertyId: alert.propertyId,
      status: isHandsOff ? 'approved' : 'pending',
      ...(isHandsOff && { approvedAt: new Date(), approvedById: uid(req) }),
    },
  });
  res.status(201).json(dispatch);
});

const DispatchUpdateSchema = z.object({
  status: z.enum(['pending', 'approved', 'scheduled', 'completed', 'cancelled']).optional(),
  scheduledDate: z.string().optional(),
  completedAt: z.string().optional(),
  invoiceUrl: z.string().url().optional(),
  notes: z.string().optional(),
});

router.put('/dispatches/:id', requireAuth('HOME_WATCHER'), async (req, res) => {
  const dispatch = await prisma.contractorDispatch.findUnique({ where: { id: req.params.id } });
  if (!dispatch) { res.status(404).json({ error: 'Not found' }); return; }
  if (!await watcherCanAccess(dispatch.propertyId, uid(req))) {
    res.status(403).json({ error: 'Forbidden' }); return;
  }
  const parsed = DispatchUpdateSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }
  const { scheduledDate, completedAt, ...rest } = parsed.data;
  const updated = await prisma.contractorDispatch.update({
    where: { id: req.params.id },
    data: {
      ...rest,
      ...(scheduledDate !== undefined && { scheduledDate: scheduledDate ? new Date(scheduledDate) : null }),
      ...(completedAt !== undefined && { completedAt: completedAt ? new Date(completedAt) : null }),
    },
  });
  res.json(updated);
});

export default router;
