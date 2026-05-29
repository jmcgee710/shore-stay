// Unified "team" routes — works for both HOME_WATCHER and PROPERTY_MANAGER roles
import { Router } from 'express';
import { z } from 'zod';
import prisma from '../prisma.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
const uid = (req: any): string => req.auth!.sub;
const role = (req: any): string => req.auth!.role;

const TEAM_ROLES = ['HOME_WATCHER', 'PROPERTY_MANAGER'] as const;

// ── GET /api/team/my-properties ──────────────────────────────────────────────
// Returns properties assigned to this watcher OR managed by this PM
router.get('/my-properties', requireAuth(...TEAM_ROLES), async (req, res) => {
  const userId = uid(req);
  const userRole = role(req);

  if (userRole === 'HOME_WATCHER') {
    const assignments = await prisma.watcherAssignment.findMany({
      where: { watcherId: userId, inviteAccepted: true },
      include: {
        property: { select: { id: true, name: true, address: true, town: true, latitude: true, longitude: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(assignments.map(a => ({
      id: a.id,
      property: a.property,
      handsOffMode: a.handsOffMode,
      role: 'watcher',
      canManage: false,
    })));
  }

  // PROPERTY_MANAGER
  const access = await prisma.propertyManagerAccess.findMany({
    where: { managerId: userId },
    include: {
      property: { select: { id: true, name: true, address: true, town: true, latitude: true, longitude: true } },
    },
  });
  return res.json(access.map(a => ({
    id: a.id,
    property: a.property,
    handsOffMode: false,
    role: 'manager',
    canManage: true,
    permissions: a.permissions,
  })));
});

// ── Submit watch report ───────────────────────────────────────────────────────
const ReportSchema = z.object({
  summary: z.string().min(1),
  overallCondition: z.enum(['good', 'fair', 'needs_attention', 'damage']),
  photoUrls: z.array(z.string()).optional(),
  notes: z.string().optional(),
  visitedAt: z.string().datetime().optional(),
});

router.post('/properties/:id/reports', requireAuth(...TEAM_ROLES), async (req, res) => {
  const parsed = ReportSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }
  const report = await prisma.watchReport.create({
    data: { ...parsed.data, propertyId: req.params.id, watcherId: uid(req), photoUrls: parsed.data.photoUrls ?? [] },
  });
  res.status(201).json(report);
});

// ── Log storm alert ───────────────────────────────────────────────────────────
const AlertSchema = z.object({
  alertType: z.enum(['storm', 'flood', 'wind_damage', 'utility_failure', 'vandalism', 'other']),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  description: z.string().min(1),
  photoUrls: z.array(z.string()).optional(),
  damageCostEstimate: z.number().optional(),
});

router.post('/properties/:id/alerts', requireAuth(...TEAM_ROLES), async (req, res) => {
  const parsed = AlertSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }

  // Check if hands-off mode is enabled for this property+watcher
  let requiresOwnerApproval = true;
  if (role(req) === 'HOME_WATCHER') {
    const assignment = await prisma.watcherAssignment.findFirst({
      where: { watcherId: uid(req), propertyId: req.params.id, inviteAccepted: true },
    });
    if (assignment?.handsOffMode) requiresOwnerApproval = false;
  } else {
    requiresOwnerApproval = false; // PMs can auto-approve
  }

  const alert = await prisma.stormAlert.create({
    data: {
      ...parsed.data,
      propertyId: req.params.id,
      reportedById: uid(req),
      photoUrls: parsed.data.photoUrls ?? [],
      requiresOwnerApproval,
    },
  });
  res.status(201).json(alert);
});

// ── Dispatch contractor ───────────────────────────────────────────────────────
const DispatchSchema = z.object({
  contractorName: z.string().min(1),
  contractorPhone: z.string().optional(),
  contractorEmail: z.string().optional(),
  trade: z.enum(['plumber', 'electrician', 'roofer', 'general', 'other']),
  workDescription: z.string().min(1),
  estimatedCost: z.number().optional(),
});

router.post('/alerts/:alertId/dispatch', requireAuth(...TEAM_ROLES), async (req, res) => {
  const parsed = DispatchSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }
  const alert = await prisma.stormAlert.findUnique({ where: { id: req.params.alertId } });
  if (!alert) { res.status(404).json({ error: 'Alert not found' }); return; }
  const status = !alert.requiresOwnerApproval ? 'approved' : 'pending';
  const dispatch = await prisma.contractorDispatch.create({
    data: { ...parsed.data, stormAlertId: req.params.alertId, propertyId: alert.propertyId, status },
  });
  res.status(201).json(dispatch);
});

// ── Get reports for a property (team member view) ─────────────────────────────
router.get('/properties/:id/reports', requireAuth(...TEAM_ROLES), async (req, res) => {
  const reports = await prisma.watchReport.findMany({
    where: { propertyId: req.params.id, watcherId: uid(req) },
    orderBy: { visitedAt: 'desc' },
    take: 20,
  });
  res.json(reports);
});

export default router;
