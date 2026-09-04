import { Router } from 'express';
import { PrismaClient, TicketStatus, Priority } from '../../generated/prisma/client';
import multer from 'multer';
import path from 'path';

const router = Router();
const prisma = new PrismaClient();

// GET /api/tickets
router.get('/', async (req, res) => {
  const { requesterId, search, status, priority, sortBy = 'createdAt', order = 'desc', page = '1', limit = '10' } = req.query;

  if (!requesterId) {
    return res.status(400).json({ error: 'requesterId is required' });
  }

  const take = parseInt(limit as string, 10);
  const skip = (parseInt(page as string, 10) - 1) * take;

  const where: any = {
    requesterId: parseInt(requesterId as string, 10),
  };

  if (search) {
    where.title = { contains: search as string, mode: 'insensitive' };
  }
  if (status) {
    where.status = status as TicketStatus;
  }
  if (priority) {
    where.priority = priority as Priority;
  }

  try {
    const [tickets, total] = await Promise.all([
      prisma.ticket.findMany({
        where,
        include: {
          category: true,
        },
        orderBy: {
          [sortBy as string]: order,
        },
        take,
        skip,
      }),
      prisma.ticket.count({ where }),
    ]);

    res.json({
      data: tickets,
      total,
      page: parseInt(page as string, 10),
      limit: take,
      totalPages: Math.ceil(total / take),
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/tickets/:id
router.get('/:id', async (req, res) => {
  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id: parseInt(req.params.id, 10) },
      include: {
        category: true,
        relatedSystem: true,
        attachments: {
          where: { deletedAt: null },
        },
      },
    });

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    res.json(ticket);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/tickets
router.post('/', async (req, res) => {
  const { title, description, categoryId, priority = Priority.MEDIUM, requesterId, relatedSystemId } = req.body;

  if (!title) return res.status(400).json({ error: 'Title is required' });
  if (!description) return res.status(400).json({ error: 'Description is required' });
  if (!categoryId) return res.status(400).json({ error: 'Category is required' });
  if (!requesterId) return res.status(400).json({ error: 'Requester is required' });

  try {
    const requester = await prisma.requester.findUnique({ where: { id: requesterId } });
    if (!requester || !requester.isActive) {
      return res.status(404).json({ error: 'Requester not found' });
    }

    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    if (priority && !Object.values(Priority).includes(priority as Priority)) {
      return res.status(400).json({ error: 'Invalid priority value' });
    }

    const ticket = await prisma.ticket.create({
      data: {
        title,
        description,
        status: TicketStatus.OPEN,
        priority: priority as Priority,
        requesterId,
        categoryId,
        relatedSystemId: relatedSystemId ? relatedSystemId : null,
      },
    });

    res.status(201).json(ticket);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Multer setup for attachments
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  },
});

const fileFilter = (req: any, file: any, cb: any) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file type. Allowed: JPG, PNG, WEBP, PDF'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter,
});

// POST /api/tickets/:id/attachments
router.post('/:id/attachments', (req, res) => {
  upload.single('file')(req, res, async (err: any) => {
    if (err) {
      if (err.message === 'File too large') {
         return res.status(400).json({ error: 'File size exceeds the 5 MB limit' });
      }
      return res.status(400).json({ error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    try {
      const ticketId = parseInt(req.params.id, 10);
      const ticket = await prisma.ticket.findUnique({
        where: { id: ticketId },
        include: { attachments: { where: { deletedAt: null } } },
      });

      if (!ticket) {
        return res.status(404).json({ error: 'Ticket not found' });
      }

      if (ticket.attachments.length >= 5) {
        return res.status(400).json({ error: 'Maximum of 5 attachments per ticket' });
      }

      const attachment = await prisma.attachment.create({
        data: {
          ticketId,
          filename: req.file.originalname,
          storagePath: req.file.path,
          mimeType: req.file.mimetype,
          sizeBytes: req.file.size,
        },
      });

      res.status(201).json(attachment);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
});

export default router;
