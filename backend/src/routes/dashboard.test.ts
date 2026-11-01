import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { Role } from '../../generated/prisma/client';
import express from 'express';
import dashboardRouter from './dashboard';

const app = express();
app.use(express.json());

// Mock prisma
const {
  mockTicketCount,
  mockTicketGroupBy,
  mockTicketFindMany,
  mockUserCount,
  mockUserGroupBy,
} = vi.hoisted(() => ({
  mockTicketCount: vi.fn(),
  mockTicketGroupBy: vi.fn(),
  mockTicketFindMany: vi.fn(),
  mockUserCount: vi.fn(),
  mockUserGroupBy: vi.fn(),
}));

vi.mock('../prismaClient', () => ({
  prisma: {
    ticket: {
      count: mockTicketCount,
      groupBy: mockTicketGroupBy,
      findMany: mockTicketFindMany,
    },
    user: {
      count: mockUserCount,
      groupBy: mockUserGroupBy,
    },
  },
}));

// Auth middleware mocks
let mockAuthUser: any = { id: 2, role: Role.IT_STAFF, isActive: true };

vi.mock('../middleware/auth', () => ({
  authenticateUser: (req: any, _res: any, next: any) => {
    req.user = mockAuthUser;
    next();
  },
  requireRole: (roles: Role[]) => (req: any, res: any, next: any) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'FORBIDDEN', message: 'Forbidden' });
    }
    next();
  },
}));

app.use('/', dashboardRouter);

describe('Dashboard Routes (Lab 04 - Issue 5)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthUser = { id: 2, role: Role.IT_STAFF, isActive: true };
  });

  // ==========================================
  // API-13: IT Staff Dashboard (AC-05 / BR-11)
  // ==========================================
  describe('API-13: GET /staff — IT Staff Dashboard metrics', () => {
    it('returns authoritative metrics and priority breakdown for IT Staff', async () => {
      // 6 count queries in Promise.all
      mockTicketCount
        .mockResolvedValueOnce(5)  // unassignedCount
        .mockResolvedValueOnce(12) // openCount
        .mockResolvedValueOnce(8)  // inProgressCount
        .mockResolvedValueOnce(3)  // waitingForRequesterCount
        .mockResolvedValueOnce(7)  // assignedToMeCount
        .mockResolvedValueOnce(28); // totalActiveTickets

      mockTicketGroupBy.mockResolvedValueOnce([
        { itPriority: 'URGENT', _count: { id: 2 } },
        { itPriority: 'HIGH', _count: { id: 6 } },
        { itPriority: 'MEDIUM', _count: { id: 14 } },
        { itPriority: 'LOW', _count: { id: 6 } },
      ]);

      mockTicketFindMany.mockResolvedValueOnce([
        {
          id: 1,
          number: 'TKT-001',
          title: 'Crashing PC',
          status: 'OPEN',
          priority: 'HIGH',
          itPriority: 'HIGH',
          ticketOwner: { id: 2, name: 'Michael IT' },
          requester: { id: 10, name: 'Alice' },
          updatedAt: new Date().toISOString(),
        },
      ]);

      const res = await request(app).get('/staff');

      expect(res.status).toBe(200);
      expect(res.body.metrics).toEqual({
        unassignedCount: 5,
        openCount: 12,
        inProgressCount: 8,
        waitingForRequesterCount: 3,
        assignedToMeCount: 7,
        totalActiveTickets: 28,
      });
      expect(res.body.priorityBreakdown).toEqual({
        URGENT: 2,
        HIGH: 6,
        MEDIUM: 14,
        LOW: 6,
      });
      expect(res.body.recentTickets).toHaveLength(1);
      expect(res.body.recentTickets[0].title).toBe('Crashing PC');
    });

    it('rejects Requester access with 403 Forbidden', async () => {
      mockAuthUser = { id: 10, role: Role.REQUESTER, isActive: true };

      const res = await request(app).get('/staff');
      expect(res.status).toBe(403);
    });
  });

  // ==========================================
  // API-12: Requester Dashboard (AC-06 / BR-12)
  // ==========================================
  describe('API-12: GET /requester — Requester Dashboard metrics', () => {
    it('returns metrics strictly isolated to the authenticated requester', async () => {
      mockAuthUser = { id: 10, role: Role.REQUESTER, isActive: true };

      // 5 counts: myOpen, inProgress, waiting, resolved, closed
      mockTicketCount
        .mockResolvedValueOnce(2) // myOpen (NEW, OPEN)
        .mockResolvedValueOnce(1) // inProgress
        .mockResolvedValueOnce(1) // waiting
        .mockResolvedValueOnce(3) // resolved
        .mockResolvedValueOnce(4); // closed

      mockTicketFindMany.mockResolvedValueOnce([
        {
          id: 10,
          number: 'TKT-010',
          title: 'My Printer Issue',
          status: 'OPEN',
          priority: 'MEDIUM',
          updatedAt: new Date().toISOString(),
        },
      ]);

      const res = await request(app).get('/requester');

      expect(res.status).toBe(200);
      expect(res.body.metrics).toEqual({
        myOpenTicketsCount: 2,
        inProgressCount: 1,
        waitingForRequesterCount: 1,
        resolvedCount: 3,
        closedCount: 4,
      });
      expect(res.body.recentTickets).toHaveLength(1);
      expect(res.body.recentTickets[0].title).toBe('My Printer Issue');

      // Verify BR-12 strict requesterId isolation
      expect(mockTicketCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ requesterId: 10 }),
        })
      );
      expect(mockTicketFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ requesterId: 10 }),
        })
      );
    });

    it('rejects Staff access to requester dashboard with 403 Forbidden', async () => {
      mockAuthUser = { id: 2, role: Role.IT_STAFF, isActive: true };

      const res = await request(app).get('/requester');
      expect(res.status).toBe(403);
    });
  });

  // ==========================================
  // API-14: Graceful Zero / Empty States (BR-13)
  // ==========================================
  describe('API-14: Dashboard metrics when user has 0 tickets', () => {
    it('returns 0 counts and empty recentTickets array for Requester with no tickets', async () => {
      mockAuthUser = { id: 99, role: Role.REQUESTER, isActive: true };

      mockTicketCount
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0);

      mockTicketFindMany.mockResolvedValueOnce([]);

      const res = await request(app).get('/requester');

      expect(res.status).toBe(200);
      expect(res.body.metrics).toEqual({
        myOpenTicketsCount: 0,
        inProgressCount: 0,
        waitingForRequesterCount: 0,
        resolvedCount: 0,
        closedCount: 0,
      });
      expect(res.body.recentTickets).toEqual([]);
    });

    it('returns 0 counts and empty arrays for Staff queue when empty', async () => {
      mockTicketCount
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0);

      mockTicketGroupBy.mockResolvedValueOnce([]);
      mockTicketFindMany.mockResolvedValueOnce([]);

      const res = await request(app).get('/staff');

      expect(res.status).toBe(200);
      expect(res.body.metrics).toEqual({
        unassignedCount: 0,
        openCount: 0,
        inProgressCount: 0,
        waitingForRequesterCount: 0,
        assignedToMeCount: 0,
        totalActiveTickets: 0,
      });
      expect(res.body.priorityBreakdown).toEqual({
        URGENT: 0,
        HIGH: 0,
        MEDIUM: 0,
        LOW: 0,
      });
      expect(res.body.recentTickets).toEqual([]);
    });
  });

  // ==========================================
  // Admin Dashboard
  // ==========================================
  describe('GET /admin — Admin Dashboard metrics', () => {
    it('returns staff metrics and user administration counts for Administrator', async () => {
      mockAuthUser = { id: 1, role: Role.ADMINISTRATOR, isActive: true };

      // 5 ticket counts: unassigned, open, inProgress, waiting, assignedToMe
      mockTicketCount
        .mockResolvedValueOnce(3)
        .mockResolvedValueOnce(10)
        .mockResolvedValueOnce(5)
        .mockResolvedValueOnce(2)
        .mockResolvedValueOnce(1);

      // 3 user counts: total, active, inactive
      mockUserCount
        .mockResolvedValueOnce(25)
        .mockResolvedValueOnce(23)
        .mockResolvedValueOnce(2);

      mockUserGroupBy.mockResolvedValueOnce([
        { role: 'REQUESTER', _count: { id: 18 } },
        { role: 'IT_STAFF', _count: { id: 5 } },
        { role: 'ADMINISTRATOR', _count: { id: 2 } },
      ]);

      mockTicketFindMany.mockResolvedValueOnce([]);

      const res = await request(app).get('/admin');

      expect(res.status).toBe(200);
      expect(res.body.staffMetrics).toEqual({
        unassignedCount: 3,
        openCount: 10,
        inProgressCount: 5,
        waitingForRequesterCount: 2,
        assignedToMeCount: 1,
      });
      expect(res.body.userMetrics).toEqual({
        totalUsers: 25,
        activeUsers: 23,
        inactiveUsers: 2,
        roleCounts: {
          REQUESTER: 18,
          IT_STAFF: 5,
          ADMINISTRATOR: 2,
        },
      });
    });

    it('rejects IT Staff access to admin dashboard with 403 Forbidden', async () => {
      mockAuthUser = { id: 2, role: Role.IT_STAFF, isActive: true };

      const res = await request(app).get('/admin');
      expect(res.status).toBe(403);
    });
  });
});
