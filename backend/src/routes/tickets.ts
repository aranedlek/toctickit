import { Router } from 'express';
import { TicketStatus, Priority, Role } from '../../generated/prisma/client';
import { prisma } from '../prismaClient';
import multer from 'multer';
import path from 'path';
import { authenticateUser, requireRole } from '../middleware/auth';

const router = Router();

// Apply authentication middleware to all ticket routes
router.use(authenticateUser);

// GET /api/tickets
router.get('/', async (req, res) => {
  const { search, status, priority, itPriority, ownerId, sortBy = 'createdAt', order = 'desc', page = '1', limit = '10' } = req.query;

  const take = parseInt(limit as string, 10);
  const skip = (parseInt(page as string, 10) - 1) * take;

  const where: any = {};

  // Role-based access control
  if (req.user!.role === Role.REQUESTER) {
    where.requesterId = req.user!.id;
  }

  // Filters
  if (search) {
    where.title = { contains: search as string, mode: 'insensitive' };
  }
  if (status) {
    where.status = status as TicketStatus;
  }
  if (priority) {
    where.priority = priority as Priority;
  }
  if (itPriority) {
    where.itPriority = itPriority as Priority;
  }
  if (ownerId) {
    where.ticketOwnerId = ownerId === 'unassigned' ? null : parseInt(ownerId as string, 10);
  }

  try {
    const [tickets, total] = await Promise.all([
      prisma.ticket.findMany({
        where,
        include: {
          category: true,
          requester: { select: { id: true, name: true } },
          ticketOwner: { select: { id: true, name: true } },
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
        requester: { select: { id: true, name: true, email: true } },
        ticketOwner: { select: { id: true, name: true, email: true } },
        attachments: {
          where: { deletedAt: null },
        },
        publicComments: {
          include: { author: { select: { id: true, name: true, role: true } } },
          orderBy: { createdAt: 'asc' }
        },
        // Only include internal notes if the user is IT_STAFF or ADMINISTRATOR
        internalNotes: req.user!.role !== Role.REQUESTER ? {
          include: { author: { select: { id: true, name: true, role: true } } },
          orderBy: { createdAt: 'asc' }
        } : false,
      },
    });

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Protect requester access
    if (req.user!.role === Role.REQUESTER && ticket.requesterId !== req.user!.id) {
      return res.status(403).json({ error: 'Forbidden: You do not own this ticket' });
    }

    res.json(ticket);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/tickets
router.post('/', async (req, res) => {
  const { title, description, categoryId, priority = Priority.MEDIUM, relatedSystemId } = req.body;

  if (!title) return res.status(400).json({ error: 'Title is required' });
  if (!description) return res.status(400).json({ error: 'Description is required' });
  if (!categoryId) return res.status(400).json({ error: 'Category is required' });

  try {
    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) return res.status(404).json({ error: 'Category not found' });

    if (priority && !Object.values(Priority).includes(priority as Priority)) {
      return res.status(400).json({ error: 'Invalid priority value' });
    }

    const ticket = await prisma.ticket.create({
      data: {
        title,
        description,
        status: TicketStatus.NEW,
        priority: priority as Priority,
        itPriority: priority as Priority, // initially copy requested priority
        requesterId: req.user!.id,
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

// PATCH /api/tickets/:id (IT Staff / Admin only)
router.patch('/:id', requireRole([Role.IT_STAFF, Role.ADMINISTRATOR]), async (req, res) => {
  const { status, itPriority, ticketOwnerId } = req.body;
  const ticketId = parseInt(req.params.id, 10);

  try {
    const existingTicket = await prisma.ticket.findUnique({ where: { id: ticketId } });
    if (!existingTicket) return res.status(404).json({ error: 'Ticket not found' });

    const updateData: any = {};
    if (status) updateData.status = status as TicketStatus;
    if (itPriority) updateData.itPriority = itPriority as Priority;
    
    if (ticketOwnerId !== undefined) {
      if (ticketOwnerId === null) {
        updateData.ticketOwnerId = null;
      } else {
        const owner = await prisma.user.findUnique({ where: { id: ticketOwnerId } });
        if (!owner || (owner.role !== Role.IT_STAFF && owner.role !== Role.ADMINISTRATOR)) {
          return res.status(400).json({ error: 'Invalid ticket owner' });
        }
        updateData.ticketOwnerId = ticketOwnerId;
      }
    }

    const updatedTicket = await prisma.ticket.update({
      where: { id: ticketId },
      data: updateData,
    });

    res.json(updatedTicket);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/tickets/:id/resolve (Requester only)
router.patch('/:id/resolve', requireRole([Role.REQUESTER]), async (req, res) => {
  const ticketId = parseInt(req.params.id, 10);

  try {
    const existingTicket = await prisma.ticket.findUnique({ where: { id: ticketId } });
    if (!existingTicket) return res.status(404).json({ error: 'Ticket not found' });

    if (existingTicket.requesterId !== req.user!.id) {
      return res.status(403).json({ error: 'Forbidden: You do not own this ticket' });
    }

    const updatedTicket = await prisma.ticket.update({
      where: { id: ticketId },
      data: { status: TicketStatus.RESOLVED },
    });

    res.json(updatedTicket);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/tickets/:id/public-comments
router.post('/:id/public-comments', async (req, res) => {
  const ticketId = parseInt(req.params.id, 10);
  const { content } = req.body;

  if (!content || content.trim() === '') {
    return res.status(400).json({ error: 'Comment content cannot be empty' });
  }

  try {
    const existingTicket = await prisma.ticket.findUnique({ where: { id: ticketId } });
    if (!existingTicket) return res.status(404).json({ error: 'Ticket not found' });

    // Requesters can only comment on their own tickets
    if (req.user!.role === Role.REQUESTER && existingTicket.requesterId !== req.user!.id) {
      return res.status(403).json({ error: 'Forbidden: You do not own this ticket' });
    }

    const comment = await prisma.publicComment.create({
      data: {
        content,
        ticketId,
        authorId: req.user!.id,
      },
      include: { author: { select: { id: true, name: true, role: true } } }
    });

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/tickets/:id/internal-notes
router.post('/:id/internal-notes', requireRole([Role.IT_STAFF, Role.ADMINISTRATOR]), async (req, res) => {
  const ticketId = parseInt(req.params.id, 10);
  const { content } = req.body;

  if (!content || content.trim() === '') {
    return res.status(400).json({ error: 'Note content cannot be empty' });
  }

  try {
    const existingTicket = await prisma.ticket.findUnique({ where: { id: ticketId } });
    if (!existingTicket) return res.status(404).json({ error: 'Ticket not found' });

    const note = await prisma.internalNote.create({
      data: {
        content,
        ticketId,
        authorId: req.user!.id,
      },
      include: { author: { select: { id: true, name: true, role: true } } }
    });

    res.status(201).json(note);
  } catch (error) {
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

      if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

      // Check ownership
      if (req.user!.role === Role.REQUESTER && ticket.requesterId !== req.user!.id) {
         return res.status(403).json({ error: 'Forbidden: You do not own this ticket' });
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
      res.status(500).json({ error: 'Internal server error' });
    }
  });
});

export default router;
