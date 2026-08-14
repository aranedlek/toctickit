import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '../generated/prisma/client';

const app = express();
const PORT = process.env.PORT || 3000;

const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

const SEEDED_CATEGORIES = [
  { id: 1, name: 'Account and Access' },
  { id: 2, name: 'Hardware' },
  { id: 3, name: 'Software' },
  { id: 4, name: 'Network' },
];

// GET /health — health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// GET /api/categories — return all categories from DB or fallback
app.get('/api/categories', async (_req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { id: 'asc' },
    });
    if (categories && categories.length > 0) {
      res.json({ categories });
    } else {
      res.json({ categories: SEEDED_CATEGORIES });
    }
  } catch (err) {
    // If DB is offline, provide seeded categories so app works online
    console.warn('Prisma DB query failed, returning default categories');
    res.json({ categories: SEEDED_CATEGORIES });
  }
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

export default app;
