import { Router } from 'express';
import { prisma } from '../prismaClient';

const router = Router();

// GET /api/requesters
router.get('/', async (req, res) => {
  try {
    const requesters = await prisma.requester.findMany({
      where: { isActive: true },
    });
    res.json(requesters);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
