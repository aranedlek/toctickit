import { Router } from 'express';
import { Role, TicketStatus } from '../../generated/prisma/client';
import { prisma } from '../prismaClient';
import { authenticateUser, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticateUser);

// GET /api/dashboard/staff - IT Staff Dashboard metrics (BR-11, AC-05)
router.get('/staff', requireRole([Role.IT_STAFF, Role.ADMINISTRATOR]), async (req, res) => {
  try {
    const userId = req.user!.id;

    // Authoritative aggregation queries (BR-11)
    const [
      unassignedCount,
      openCount,
      inProgressCount,
      waitingForRequesterCount,
      assignedToMeCount,
      totalActiveTickets,
      priorityBreakdown,
      recentTickets,
    ] = await Promise.all([
      prisma.ticket.count({
        where: {
          ticketOwnerId: null,
          status: { notIn: [TicketStatus.CLOSED, TicketStatus.CANCELLED] },
        },
      }),
      prisma.ticket.count({ where: { status: TicketStatus.OPEN } }),
      prisma.ticket.count({ where: { status: TicketStatus.IN_PROGRESS } }),
      prisma.ticket.count({ where: { status: TicketStatus.WAITING_FOR_REQUESTER } }),
      prisma.ticket.count({
        where: {
          ticketOwnerId: userId,
          status: { notIn: [TicketStatus.CLOSED, TicketStatus.CANCELLED] },
        },
      }),
      prisma.ticket.count({
        where: {
          status: { notIn: [TicketStatus.CLOSED, TicketStatus.CANCELLED] },
        },
      }),
      prisma.ticket.groupBy({
        by: ['itPriority'],
        _count: { id: true },
        where: {
          status: { notIn: [TicketStatus.CLOSED, TicketStatus.CANCELLED] },
        },
      }),
      prisma.ticket.findMany({
        where: {
          status: { notIn: [TicketStatus.CLOSED, TicketStatus.CANCELLED] },
        },
        include: {
          ticketOwner: { select: { id: true, name: true } },
          requester: { select: { id: true, name: true } },
        },
        orderBy: { updatedAt: 'desc' },
        take: 10,
      }),
    ]);

    // Transform priority breakdown into a clean object with default 0s
    const priorityMap: Record<string, number> = { URGENT: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
    priorityBreakdown.forEach((item: any) => {
      if (item.itPriority) {
        priorityMap[item.itPriority] = item._count?.id ?? 0;
      }
    });

    res.json({
      metrics: {
        unassignedCount,
        openCount,
        inProgressCount,
        waitingForRequesterCount,
        assignedToMeCount,
        totalActiveTickets,
      },
      priorityBreakdown: priorityMap,
      recentTickets: recentTickets.map((t: any) => ({
        id: t.id,
        number: t.number,
        title: t.title,
        status: t.status,
        priority: t.priority,
        itPriority: t.itPriority,
        ticketOwner: t.ticketOwner ? { id: t.ticketOwner.id, name: t.ticketOwner.name } : null,
        requester: t.requester ? { id: t.requester.id, name: t.requester.name } : null,
        updatedAt: t.updatedAt,
      })),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Internal server error' });
  }
});

// GET /api/dashboard/requester - Requester Dashboard metrics (BR-12, BR-13, AC-06)
router.get('/requester', requireRole([Role.REQUESTER]), async (req, res) => {
  try {
    const userId = req.user!.id;

    // BR-12: Strict WHERE requesterId = :authUserId filter
    const baseWhere = { requesterId: userId };

    const [
      myOpenTicketsCount,
      inProgressCount,
      waitingForRequesterCount,
      resolvedCount,
      closedCount,
      recentTickets,
    ] = await Promise.all([
      prisma.ticket.count({
        where: {
          ...baseWhere,
          status: { in: [TicketStatus.NEW, TicketStatus.OPEN] },
        },
      }),
      prisma.ticket.count({
        where: {
          ...baseWhere,
          status: TicketStatus.IN_PROGRESS,
        },
      }),
      prisma.ticket.count({
        where: {
          ...baseWhere,
          status: TicketStatus.WAITING_FOR_REQUESTER,
        },
      }),
      prisma.ticket.count({
        where: {
          ...baseWhere,
          status: TicketStatus.RESOLVED,
        },
      }),
      prisma.ticket.count({
        where: {
          ...baseWhere,
          status: TicketStatus.CLOSED,
        },
      }),
      prisma.ticket.findMany({
        where: baseWhere,
        orderBy: { updatedAt: 'desc' },
        take: 10,
        select: {
          id: true,
          number: true,
          title: true,
          status: true,
          priority: true,
          updatedAt: true,
        },
      }),
    ]);

    res.json({
      metrics: {
        myOpenTicketsCount,
        inProgressCount,
        waitingForRequesterCount,
        resolvedCount,
        closedCount,
      },
      recentTickets,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Internal server error' });
  }
});

// GET /api/dashboard/admin - Admin Dashboard metrics
router.get('/admin', requireRole([Role.ADMINISTRATOR]), async (req, res) => {
  try {
    const userId = req.user!.id;

    const [
      unassignedCount,
      openCount,
      inProgressCount,
      waitingForRequesterCount,
      assignedToMeCount,
      totalUsers,
      activeUsers,
      inactiveUsers,
      roleCounts,
      recentTickets,
    ] = await Promise.all([
      prisma.ticket.count({
        where: {
          ticketOwnerId: null,
          status: { notIn: [TicketStatus.CLOSED, TicketStatus.CANCELLED] },
        },
      }),
      prisma.ticket.count({ where: { status: TicketStatus.OPEN } }),
      prisma.ticket.count({ where: { status: TicketStatus.IN_PROGRESS } }),
      prisma.ticket.count({ where: { status: TicketStatus.WAITING_FOR_REQUESTER } }),
      prisma.ticket.count({
        where: {
          ticketOwnerId: userId,
          status: { notIn: [TicketStatus.CLOSED, TicketStatus.CANCELLED] },
        },
      }),
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.user.count({ where: { isActive: false } }),
      prisma.user.groupBy({ by: ['role'], _count: { id: true } }),
      prisma.ticket.findMany({
        where: { status: { notIn: [TicketStatus.CLOSED, TicketStatus.CANCELLED] } },
        include: {
          ticketOwner: { select: { id: true, name: true } },
          requester: { select: { id: true, name: true } },
        },
        orderBy: { updatedAt: 'desc' },
        take: 10,
      }),
    ]);

    const roleMap: Record<string, number> = { REQUESTER: 0, IT_STAFF: 0, ADMINISTRATOR: 0 };
    roleCounts.forEach((item: any) => {
      roleMap[item.role] = item._count?.id ?? 0;
    });

    res.json({
      staffMetrics: {
        unassignedCount,
        openCount,
        inProgressCount,
        waitingForRequesterCount,
        assignedToMeCount,
      },
      userMetrics: {
        totalUsers,
        activeUsers,
        inactiveUsers,
        roleCounts: roleMap,
      },
      recentTickets: recentTickets.map((t: any) => ({
        id: t.id,
        number: t.number,
        title: t.title,
        status: t.status,
        priority: t.priority,
        itPriority: t.itPriority,
        ticketOwner: t.ticketOwner ? { id: t.ticketOwner.id, name: t.ticketOwner.name } : null,
        requester: t.requester ? { id: t.requester.id, name: t.requester.name } : null,
        updatedAt: t.updatedAt,
      })),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Internal server error' });
  }
});

export default router;
