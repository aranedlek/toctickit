import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '../generated/prisma/client';

const app = express();
const PORT = process.env.PORT || 3000;
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// ─── Health ───────────────────────────────────────────────────────────────────

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// ─── Requesters ───────────────────────────────────────────────────────────────

// GET /api/requesters — return active requesters only
app.get('/api/requesters', async (_req, res) => {
  try {
    const requesters = await prisma.requester.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, email: true, isActive: true, createdAt: true },
    });
    res.json(requesters);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Categories ───────────────────────────────────────────────────────────────

// GET /api/categories — return all categories
app.get('/api/categories', async (_req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { id: 'asc' },
      select: { id: true, name: true },
    });
    res.json(categories);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Related Systems ──────────────────────────────────────────────────────────

// GET /api/related-systems — return all related systems
app.get('/api/related-systems', async (_req, res) => {
  try {
    const systems = await prisma.relatedSystem.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    });
    res.json(systems);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Tickets ──────────────────────────────────────────────────────────────────

// POST /api/tickets — create a new ticket
app.post('/api/tickets', async (req, res) => {
  const { title, description, categoryId, priority, requesterId, relatedSystemId } = req.body;

  // Validation
  if (!title || title.trim() === '') {
    res.status(400).json({ error: 'Title is required' });
    return;
  }
  if (!description || description.trim() === '') {
    res.status(400).json({ error: 'Description is required' });
    return;
  }
  if (!categoryId) {
    res.status(400).json({ error: 'Category is required' });
    return;
  }
  if (!requesterId) {
    res.status(400).json({ error: 'requesterId is required' });
    return;
  }

  const validPriorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
  if (priority && !validPriorities.includes(priority)) {
    res.status(400).json({ error: 'Invalid priority value' });
    return;
  }

  try {
    // Check requester exists and is active
    const requester = await prisma.requester.findUnique({ where: { id: Number(requesterId) } });
    if (!requester || !requester.isActive) {
      res.status(404).json({ error: 'Requester not found' });
      return;
    }

    // Check category exists
    const category = await prisma.category.findUnique({ where: { id: Number(categoryId) } });
    if (!category) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }

    // Check relatedSystem exists if provided
    if (relatedSystemId) {
      const system = await prisma.relatedSystem.findUnique({ where: { id: Number(relatedSystemId) } });
      if (!system) {
        res.status(404).json({ error: 'Related system not found' });
        return;
      }
    }

    const ticket = await prisma.ticket.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        categoryId: Number(categoryId),
        priority: priority ?? 'MEDIUM',
        requesterId: Number(requesterId),
        relatedSystemId: relatedSystemId ? Number(relatedSystemId) : null,
      },
    });

    res.status(201).json(ticket);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/tickets — list tickets with search, filter, sort, pagination
app.get('/api/tickets', async (req, res) => {
  const { requesterId, search, status, priority, sortBy, order, page, limit } = req.query;

  if (!requesterId) {
    res.status(400).json({ error: 'requesterId is required' });
    return;
  }

  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(100, Math.max(1, Number(limit) || 10));
  const skip = (pageNum - 1) * limitNum;

  const validSortFields = ['createdAt', 'priority', 'updatedAt'];
  const sortField = validSortFields.includes(sortBy as string) ? (sortBy as string) : 'createdAt';
  const sortOrder = order === 'asc' ? 'asc' : 'desc';

  const where: any = {
    requesterId: Number(requesterId),
  };

  if (search) {
    where.title = { contains: search as string, mode: 'insensitive' };
  }
  if (status) {
    where.status = status;
  }
  if (priority) {
    where.priority = priority;
  }

  try {
    const [data, total] = await Promise.all([
      prisma.ticket.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { [sortField]: sortOrder },
        select: {
          id: true,
          title: true,
          status: true,
          priority: true,
          createdAt: true,
          category: { select: { id: true, name: true } },
        },
      }),
      prisma.ticket.count({ where }),
    ]);

    res.json({
      data,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/tickets/:id — get ticket detail with non-deleted attachments
app.get('/api/tickets/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: 'Invalid ticket id' });
    return;
  }

  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true } },
        relatedSystem: { select: { id: true, name: true } },
        attachments: {
          where: { deletedAt: null },
          select: { id: true, filename: true, mimeType: true, sizeBytes: true, uploadedAt: true },
          orderBy: { uploadedAt: 'asc' },
        },
      },
    });

    if (!ticket) {
      res.status(404).json({ error: 'Ticket not found' });
      return;
    }

    res.json(ticket);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Attachments ──────────────────────────────────────────────────────────────

// DELETE /api/attachments/:id — soft-delete an attachment
app.delete('/api/attachments/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: 'Invalid attachment id' });
    return;
  }

  try {
    const attachment = await prisma.attachment.findUnique({ where: { id } });

    if (!attachment) {
      res.status(404).json({ error: 'Attachment not found' });
      return;
    }
    if (attachment.deletedAt !== null) {
      res.status(400).json({ error: 'Attachment already deleted' });
      return;
    }

    const updated = await prisma.attachment.update({
      where: { id },
      data: { deletedAt: new Date() },
      select: { id: true, deletedAt: true },
    });

    res.json(updated);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Server ───────────────────────────────────────────────────────────────────

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

export default app;
