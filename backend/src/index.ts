import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '../generated/prisma';

const app = express();
const PORT = process.env.PORT || 3000;

const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// In-memory ticks store
let ticks: number[] = [];

// GET /health — health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// GET /api/categories — return all categories from DB
app.get('/api/categories', async (_req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { id: 'asc' },
    });
    res.json({ categories });
  } catch (err) {
    console.error('Failed to fetch categories:', err);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// GET /api/ticks — return all ticks
app.get('/api/ticks', (_req, res) => {
  res.json({ ticks });
});

// POST /api/ticks — add a new tick
app.post('/api/ticks', (_req, res) => {
  const nextTick = (ticks[ticks.length - 1] ?? 0) + 1;
  ticks.push(nextTick);
  res.status(201).json({ ticks });
});

// DELETE /api/ticks — reset all ticks (useful for testing)
app.delete('/api/ticks', (_req, res) => {
  ticks = [];
  res.json({ ticks });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

export default app;
