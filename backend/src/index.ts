import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

import requestersRouter from './routes/requesters';
import categoriesRouter from './routes/categories';
import relatedSystemsRouter from './routes/relatedSystems';
import ticketsRouter from './routes/tickets';
import attachmentsRouter from './routes/attachments';
import authRouter from './routes/auth';

// GET /health — health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/requesters', requestersRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/related-systems', relatedSystemsRouter);
app.use('/api/tickets', ticketsRouter);
app.use('/api/attachments', attachmentsRouter);
app.use('/api/auth', authRouter);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

export default app;
