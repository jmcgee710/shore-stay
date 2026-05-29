import { Router } from 'express';
import prisma from '../prisma.js';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

router.get('/properties', async (_req, res) => {
  const properties = await prisma.property.findMany({
    take: 10
  });
  res.json(properties);
});

export default router;
