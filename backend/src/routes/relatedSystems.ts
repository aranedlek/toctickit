import { Router } from 'express';
import { prisma } from '../prismaClient';

const router = Router();

// GET /api/related-systems
router.get('/', async (req, res) => {
  try {
    const systems = await prisma.relatedSystem.findMany({
      orderBy: { id: 'asc' },
    });
    res.json(systems);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
