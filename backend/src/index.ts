import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '../generated/prisma';

const app = express();
const PORT = process.env.PORT || 3000;

const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

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

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

export default app;
