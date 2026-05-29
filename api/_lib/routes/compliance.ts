import { Router } from 'express';
import { z } from 'zod';
import prisma from '../prisma.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth('HOMEOWNER'));

const uid = (req: any): string => req.auth!.sub;

async function ownedProp(id: string, homeownerId: string) {
  return prisma.property.findFirst({ where: { id, homeownerId } });
}

// ─── Documents ────────────────────────────────────────────────────────────────

const DocSchema = z.object({
  name: z.string().min(1),
  docType: z.string().min(1),
  issueDate: z.string().optional(),
  expiryDate: z.string().optional(),
  notes: z.string().optional(),
  fileUrl: z.string().url().optional().or(z.literal('')),
});

router.get('/properties/:id/documents', async (req, res) => {
  if (!await ownedProp(req.params.id, uid(req))) {
    res.status(404).json({ error: 'Not found' }); return;
  }
  const docs = await prisma.complianceDocument.findMany({
    where: { propertyId: req.params.id },
    orderBy: { expiryDate: 'asc' },
  });
  res.json(docs);
});

router.post('/properties/:id/documents', async (req, res) => {
  if (!await ownedProp(req.params.id, uid(req))) {
    res.status(404).json({ error: 'Not found' }); return;
  }
  const parsed = DocSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }
  const { issueDate, expiryDate, fileUrl, ...rest } = parsed.data;
  const doc = await prisma.complianceDocument.create({
    data: {
      ...rest,
      propertyId: req.params.id,
      issueDate: issueDate ? new Date(issueDate) : null,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      fileUrl: fileUrl || null,
    },
  });
  res.status(201).json(doc);
});

router.put('/properties/:id/documents/:docId', async (req, res) => {
  if (!await ownedProp(req.params.id, uid(req))) {
    res.status(404).json({ error: 'Not found' }); return;
  }
  const parsed = DocSchema.partial().safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }
  const { issueDate, expiryDate, fileUrl, ...rest } = parsed.data;
  const doc = await prisma.complianceDocument.update({
    where: { id: req.params.docId },
    data: {
      ...rest,
      ...(issueDate !== undefined && { issueDate: issueDate ? new Date(issueDate) : null }),
      ...(expiryDate !== undefined && { expiryDate: expiryDate ? new Date(expiryDate) : null }),
      ...(fileUrl !== undefined && { fileUrl: fileUrl || null }),
    },
  });
  res.json(doc);
});

router.delete('/properties/:id/documents/:docId', async (req, res) => {
  if (!await ownedProp(req.params.id, uid(req))) {
    res.status(404).json({ error: 'Not found' }); return;
  }
  await prisma.complianceDocument.delete({ where: { id: req.params.docId } });
  res.status(204).end();
});

// ─── Compliance State (checklist + tax tracker) ───────────────────────────────

const StateSchema = z.object({
  selectedMuniId: z.string().optional(),
  checkedItems: z.record(z.boolean()).optional(),
  paidQuarters: z.record(z.boolean()).optional(),
  nightlyRate: z.number().positive().optional(),
});

const STATE_DEFAULTS = {
  selectedMuniId: '',
  checkedItems: {},
  paidQuarters: {},
  nightlyRate: 350,
};

router.get('/properties/:id/state', async (req, res) => {
  if (!await ownedProp(req.params.id, uid(req))) {
    res.status(404).json({ error: 'Not found' }); return;
  }
  const state = await prisma.complianceState.findUnique({
    where: { propertyId: req.params.id },
  });
  res.json(state ?? { ...STATE_DEFAULTS, propertyId: req.params.id });
});

router.put('/properties/:id/state', async (req, res) => {
  if (!await ownedProp(req.params.id, uid(req))) {
    res.status(404).json({ error: 'Not found' }); return;
  }
  const parsed = StateSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }
  const state = await prisma.complianceState.upsert({
    where: { propertyId: req.params.id },
    update: parsed.data,
    create: { ...STATE_DEFAULTS, ...parsed.data, propertyId: req.params.id },
  });
  res.json(state);
});

export default router;
