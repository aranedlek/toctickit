import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// In-memory ticks store
let ticks: number[] = [];

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
