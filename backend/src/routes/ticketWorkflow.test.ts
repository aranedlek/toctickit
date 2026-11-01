import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { TicketStatus, Role } from '../../generated/prisma/client';
import express from 'express';
import ticketWorkflowRouter from './ticketWorkflow';

const app = express();
app.use(express.json());

// Mock prisma
const {
  mockTicketFindUnique,
  mockTicketUpdate,
  mockCommentCreate,
} = vi.hoisted(() => ({
  mockTicketFindUnique: vi.fn(),
  mockTicketUpdate: vi.fn(),
  mockCommentCreate: vi.fn(),
}));

vi.mock('../prismaClient', () => ({
  prisma: {
    ticket: {
      findUnique: mockTicketFindUnique,
      update: mockTicketUpdate,
    },
    publicComment: {
      create: mockCommentCreate,
    },
  },
}));

// Auth middleware mocks
const mockAuthenticateUser = vi.fn((req: any, _res: any, next: any) => {
  req.user = { id: 2, role: Role.IT_STAFF, isActive: true };
  next();
});

vi.mock('../middleware/auth', () => ({
  authenticateUser: (req: any, res: any, next: any) => mockAuthenticateUser(req, res, next),
  requireRole: (roles: Role[]) => (req: any, res: any, next: any) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'FORBIDDEN', message: 'Forbidden' });
    }
    next();
  },
}));

app.use('/', ticketWorkflowRouter);

const OPEN_TICKET = {
  id: 1,
  number: 'TKT-001',
  status: TicketStatus.OPEN,
  version: 1,
  requesterId: 10,
  ticketOwnerId: 2,
};

describe('ticketWorkflow routes (Lab 04 – Issue 4)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthenticateUser.mockImplementation((req: any, _res: any, next: any) => {
      req.user = { id: 2, role: Role.IT_STAFF, isActive: true };
      next();
    });
  });

  // ----- API-07: Valid status transition -----
  describe('API-07: PATCH /:id/status — valid transition OPEN → IN_PROGRESS', () => {
    it('returns 200 and incremented version on valid transition', async () => {
      mockTicketFindUnique.mockResolvedValue(OPEN_TICKET);
      mockTicketUpdate.mockResolvedValue({ ...OPEN_TICKET, status: TicketStatus.IN_PROGRESS, version: 2 });

      const res = await request(app)
        .patch('/1/status')
        .send({ status: 'IN_PROGRESS', version: 1 });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('IN_PROGRESS');
      expect(res.body.version).toBe(2);
      expect(mockTicketUpdate).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ status: 'IN_PROGRESS', version: { increment: 1 } }),
      }));
    });
  });

  // ----- API-08: Illegal status jump -----
  describe('API-08: PATCH /:id/status — illegal transition NEW → RESOLVED', () => {
    it('returns 422 INVALID_TRANSITION', async () => {
      mockTicketFindUnique.mockResolvedValue({ ...OPEN_TICKET, status: TicketStatus.NEW, version: 1 });

      const res = await request(app)
        .patch('/1/status')
        .send({ status: 'RESOLVED', version: 1 });

      expect(res.status).toBe(422);
      expect(res.body.error).toBe('INVALID_TRANSITION');
      expect(res.body.currentStatus).toBe('NEW');
      expect(mockTicketUpdate).not.toHaveBeenCalled();
    });
  });

  // ----- API-09: Requester attempts RESOLVED -----
  describe('API-09: PATCH /:id/status — Requester attempts to set RESOLVED', () => {
    it('returns 403 FORBIDDEN', async () => {
      mockAuthenticateUser.mockImplementation((req: any, _res: any, next: any) => {
        req.user = { id: 10, role: Role.REQUESTER, isActive: true };
        next();
      });
      mockTicketFindUnique.mockResolvedValue({ ...OPEN_TICKET, status: TicketStatus.IN_PROGRESS, requesterId: 10, version: 1 });

      const res = await request(app)
        .patch('/1/status')
        .send({ status: 'RESOLVED', version: 1 });

      expect(res.status).toBe(403);
      expect(res.body.error).toBe('FORBIDDEN');
      expect(mockTicketUpdate).not.toHaveBeenCalled();
    });
  });

  // ----- API-11: Optimistic concurrency conflict -----
  describe('API-11: PATCH /:id/status — stale version returns 409', () => {
    it('returns 409 CONFLICT when version does not match', async () => {
      mockTicketFindUnique.mockResolvedValue({ ...OPEN_TICKET, status: TicketStatus.OPEN, version: 5 });

      const res = await request(app)
        .patch('/1/status')
        .send({ status: 'IN_PROGRESS', version: 1 }); // stale version

      expect(res.status).toBe(409);
      expect(res.body.error).toBe('CONFLICT');
      expect(res.body.currentVersion).toBe(5);
      expect(mockTicketUpdate).not.toHaveBeenCalled();
    });
  });

  // ----- Validation: missing status -----
  it('returns 400 when status is missing', async () => {
    mockTicketFindUnique.mockResolvedValue(OPEN_TICKET);
    const res = await request(app)
      .patch('/1/status')
      .send({ version: 1 });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('BAD_REQUEST');
  });

  // ----- Validation: missing version -----
  it('returns 400 when version is missing', async () => {
    mockTicketFindUnique.mockResolvedValue(OPEN_TICKET);
    const res = await request(app)
      .patch('/1/status')
      .send({ status: 'IN_PROGRESS' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('BAD_REQUEST');
  });

  // ----- Ticket not found -----
  it('returns 404 when ticket does not exist', async () => {
    mockTicketFindUnique.mockResolvedValue(null);
    const res = await request(app)
      .patch('/999/status')
      .send({ status: 'IN_PROGRESS', version: 1 });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('NOT_FOUND');
  });

  // ----- API-10: Requester advisory resolution -----
  describe('API-10: POST /:id/resolve-advisory — Requester submits advisory', () => {
    it('records advisory comment and returns 200 without changing status', async () => {
      mockAuthenticateUser.mockImplementation((req: any, _res: any, next: any) => {
        req.user = { id: 10, role: Role.REQUESTER, isActive: true };
        next();
      });
      mockTicketFindUnique.mockResolvedValue({
        ...OPEN_TICKET,
        status: TicketStatus.WAITING_FOR_REQUESTER,
        requesterId: 10,
      });
      mockCommentCreate.mockResolvedValue({ id: 55 });

      const res = await request(app)
        .post('/1/resolve-advisory')
        .send({ note: 'The issue seems to be resolved on my end.' });

      expect(res.status).toBe(200);
      expect(res.body.ticketId).toBe(1);
      expect(res.body.status).toBe('WAITING_FOR_REQUESTER'); // status NOT changed
      expect(res.body.advisoryCommentId).toBe(55);
      expect(mockTicketUpdate).not.toHaveBeenCalled();
      expect(mockCommentCreate).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          ticketId: 1,
          authorId: 10,
          content: expect.stringContaining('[Advisory Resolution]'),
        }),
      }));
    });

    it('returns 403 when Requester does not own the ticket', async () => {
      mockAuthenticateUser.mockImplementation((req: any, _res: any, next: any) => {
        req.user = { id: 99, role: Role.REQUESTER, isActive: true };
        next();
      });
      mockTicketFindUnique.mockResolvedValue({
        ...OPEN_TICKET,
        status: TicketStatus.IN_PROGRESS,
        requesterId: 10,
      });

      const res = await request(app)
        .post('/1/resolve-advisory')
        .send({ note: 'Fixed' });

      expect(res.status).toBe(403);
      expect(res.body.error).toBe('FORBIDDEN');
    });

    it('returns 422 when ticket is already CLOSED', async () => {
      mockAuthenticateUser.mockImplementation((req: any, _res: any, next: any) => {
        req.user = { id: 10, role: Role.REQUESTER, isActive: true };
        next();
      });
      mockTicketFindUnique.mockResolvedValue({
        ...OPEN_TICKET,
        status: TicketStatus.CLOSED,
        requesterId: 10,
      });

      const res = await request(app)
        .post('/1/resolve-advisory')
        .send({ note: 'All good' });

      expect(res.status).toBe(422);
      expect(res.body.error).toBe('INVALID_STATE');
    });

    it('returns 403 when called by IT Staff (REQUESTER role required)', async () => {
      // IT_STAFF calling the REQUESTER-only endpoint
      mockAuthenticateUser.mockImplementation((req: any, _res: any, next: any) => {
        req.user = { id: 2, role: Role.IT_STAFF, isActive: true };
        next();
      });

      const res = await request(app)
        .post('/1/resolve-advisory')
        .send({ note: 'Staff tried advisory' });

      expect(res.status).toBe(403);
    });
  });

  // ----- CLOSED → REOPENED Admin only -----
  describe('CLOSED → REOPENED: Administrator only', () => {
    it('returns 403 when IT_STAFF tries to reopen CLOSED ticket', async () => {
      mockTicketFindUnique.mockResolvedValue({
        ...OPEN_TICKET,
        status: TicketStatus.CLOSED,
        version: 1,
      });

      const res = await request(app)
        .patch('/1/status')
        .send({ status: 'REOPENED', version: 1 });

      expect(res.status).toBe(403);
      expect(res.body.error).toBe('FORBIDDEN');
    });

    it('allows ADMINISTRATOR to reopen CLOSED ticket', async () => {
      mockAuthenticateUser.mockImplementation((req: any, _res: any, next: any) => {
        req.user = { id: 1, role: Role.ADMINISTRATOR, isActive: true };
        next();
      });
      mockTicketFindUnique.mockResolvedValue({
        ...OPEN_TICKET,
        status: TicketStatus.CLOSED,
        version: 1,
      });
      mockTicketUpdate.mockResolvedValue({
        ...OPEN_TICKET,
        status: TicketStatus.REOPENED,
        version: 2,
      });

      const res = await request(app)
        .patch('/1/status')
        .send({ status: 'REOPENED', version: 1 });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('REOPENED');
    });
  });
});
