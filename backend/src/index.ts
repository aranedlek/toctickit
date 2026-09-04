import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '../generated/prisma/client';

const app = express();
const PORT = process.env.PORT || 3000;

const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

import requestersRouter from './routes/requesters';
import categoriesRouter from './routes/categories';
import relatedSystemsRouter from './routes/relatedSystems';
import ticketsRouter from './routes/tickets';
import attachmentsRouter from './routes/attachments';

// GET /health — health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/requesters', requestersRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/related-systems', relatedSystemsRouter);
app.use('/api/tickets', ticketsRouter);
app.use('/api/attachments', attachmentsRouter);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

export default app;
