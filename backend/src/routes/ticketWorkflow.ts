import { Router } from 'express';
import { TicketStatus, Role } from '../../generated/prisma/client';
import { prisma } from '../prismaClient';
import { authenticateUser, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticateUser);

// Permitted Status Transition Matrix (BR-08)
const TRANSITION_MATRIX: Record<string, TicketStatus[]> = {
  NEW: [TicketStatus.OPEN, TicketStatus.CANCELLED],
  OPEN: [TicketStatus.IN_PROGRESS, TicketStatus.WAITING_FOR_REQUESTER, TicketStatus.CANCELLED],
  IN_PROGRESS: [TicketStatus.WAITING_FOR_REQUESTER, TicketStatus.RESOLVED, TicketStatus.CANCELLED],
  WAITING_FOR_REQUESTER: [TicketStatus.IN_PROGRESS, TicketStatus.RESOLVED, TicketStatus.CANCELLED],
  RESOLVED: [TicketStatus.CLOSED, TicketStatus.REOPENED],
  REOPENED: [TicketStatus.IN_PROGRESS, TicketStatus.WAITING_FOR_REQUESTER, TicketStatus.CANCELLED],
  CLOSED: [TicketStatus.REOPENED], // Admin only
  CANCELLED: [], // Terminal
};

// PATCH /api/tickets/:id/status — Transition ticket status (BR-08, BR-09, BR-10)
router.patch('/:id/status', async (req, res) => {
  const ticketId = parseInt(req.params.id, 10);
  if (isNaN(ticketId)) return res.status(400).json({ error: 'BAD_REQUEST', message: 'Invalid ticket ID.' });

  const { status: targetStatus, version } = req.body;

  if (!targetStatus) {
    return res.status(400).json({ error: 'BAD_REQUEST', message: 'Target status is required.' });
  }

  if (!Object.values(TicketStatus).includes(targetStatus as TicketStatus)) {
    return res.status(400).json({ error: 'BAD_REQUEST', message: 'Invalid status value.' });
  }

  if (version === undefined || version === null) {
    return res.status(400).json({ error: 'BAD_REQUEST', message: 'Version is required for concurrency control.' });
  }

  try {
    const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
    if (!ticket) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Ticket not found.' });
    }

    // BR-09: Requesters cannot directly set RESOLVED or CLOSED
    if (req.user!.role === Role.REQUESTER) {
      if (targetStatus === TicketStatus.RESOLVED || targetStatus === TicketStatus.CLOSED) {
        return res.status(403).json({
          error: 'FORBIDDEN',
          message: 'Requesters cannot directly resolve or close tickets. Use the advisory resolution endpoint instead.',
        });
      }
      // Requesters may only move WAITING_FOR_REQUESTER → IN_PROGRESS (advisory reply)
      if (ticket.status !== TicketStatus.WAITING_FOR_REQUESTER || targetStatus !== TicketStatus.IN_PROGRESS) {
        return res.status(403).json({
          error: 'FORBIDDEN',
          message: 'Requesters can only respond when a ticket is waiting for their input.',
        });
      }
    }

    // CLOSED → REOPENED: Administrator only
    if (
      ticket.status === TicketStatus.CLOSED &&
      targetStatus === TicketStatus.REOPENED &&
      req.user!.role !== Role.ADMINISTRATOR
    ) {
      return res.status(403).json({
        error: 'FORBIDDEN',
        message: 'Only administrators can reopen closed tickets.',
      });
    }

    // Validate transition matrix (BR-08)
    const permitted = TRANSITION_MATRIX[ticket.status] || [];
    if (!permitted.includes(targetStatus as TicketStatus)) {
      return res.status(422).json({
        error: 'INVALID_TRANSITION',
        message: `Cannot transition from ${ticket.status} to ${targetStatus}.`,
        currentStatus: ticket.status,
        permittedTransitions: permitted,
      });
    }

    // Optimistic Concurrency Control (BR-10)
    if (ticket.version !== Number(version)) {
      return res.status(409).json({
        error: 'CONFLICT',
        message: 'This ticket was modified by another user while you were editing. Please refresh and retry.',
        currentVersion: ticket.version,
      });
    }

    // Commit status update with version increment
    const updatedTicket = await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        status: targetStatus as TicketStatus,
        version: { increment: 1 },
      },
      include: {
        requester: { select: { id: true, name: true } },
        ticketOwner: { select: { id: true, name: true } },
      },
    });

    return res.json(updatedTicket);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Internal server error' });
  }
});

// POST /api/tickets/:id/resolve-advisory — Requester advisory resolution (BR-09)
router.post('/:id/resolve-advisory', requireRole([Role.REQUESTER]), async (req, res) => {
  const ticketId = parseInt(req.params.id, 10);
  if (isNaN(ticketId)) return res.status(400).json({ error: 'BAD_REQUEST', message: 'Invalid ticket ID.' });

  const { note } = req.body;

  try {
    const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
    if (!ticket) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Ticket not found.' });
    }

    // Ownership check
    if (ticket.requesterId !== req.user!.id) {
      return res.status(403).json({ error: 'FORBIDDEN', message: 'You do not own this ticket.' });
    }

    // Only allowed in active states
    const allowedStatuses: TicketStatus[] = [
      TicketStatus.OPEN,
      TicketStatus.IN_PROGRESS,
      TicketStatus.WAITING_FOR_REQUESTER,
    ];
    if (!allowedStatuses.includes(ticket.status)) {
      return res.status(422).json({
        error: 'INVALID_STATE',
        message: 'Advisory resolution can only be submitted for tickets in active states.',
        currentStatus: ticket.status,
      });
    }

    // Record advisory as a public comment
    const commentContent = note?.trim()
      ? `[Advisory Resolution] ${note.trim()}`
      : '[Advisory Resolution] The requester indicates the problem appears resolved.';

    const comment = await prisma.publicComment.create({
      data: {
        content: commentContent,
        ticketId,
        authorId: req.user!.id,
      },
    });

    return res.json({
      message: 'Advisory resolution recorded. IT Staff will review and formally close the ticket.',
      ticketId,
      status: ticket.status,
      advisoryCommentId: comment.id,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Internal server error' });
  }
});

export default router;
