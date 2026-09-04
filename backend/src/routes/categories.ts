import { Router } from 'express';
import { PrismaClient } from '../../generated/prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /api/categories
router.get('/', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { id: 'asc' },
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
