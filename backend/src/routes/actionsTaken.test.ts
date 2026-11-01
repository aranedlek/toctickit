import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { Role } from '../../generated/prisma/client';
import express from 'express';
import ticketsRouter from './tickets';

// Setup Express app for testing
const app = express();
app.use(express.json());

// Mock prisma
const { mockTicketFindUnique, mockActionFindMany, mockActionFindFirst, mockActionCreate, mockActionUpdate } = vi.hoisted(() => ({
  mockTicketFindUnique: vi.fn(),
  mockActionFindMany: vi.fn(),
  mockActionFindFirst: vi.fn(),
  mockActionCreate: vi.fn(),
  mockActionUpdate: vi.fn(),
}));

vi.mock('../prismaClient', () => ({
  prisma: {
    ticket: {
      findUnique: mockTicketFindUnique,
    },
    actionTaken: {
      findMany: mockActionFindMany,
      findFirst: mockActionFindFirst,
      create: mockActionCreate,
      update: mockActionUpdate,
    },
  },
}));

// Mock auth middleware
vi.mock('../middleware/auth', () => ({
  authenticateUser: (req: any, res: any, next: any) => {
    const role = req.headers['x-test-role'] || Role.REQUESTER;
    const userId = parseInt(req.headers['x-test-user-id'] || '1', 10);
    const isActive = req.headers['x-test-active'] !== 'false';
    req.user = { id: userId, role, isActive, requiresPasswordChange: false };
    next();
  },
  requireRole: (roles: string[]) => (req: any, res: any, next: any) => {
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' });
    next();
  },
}));

app.use('/api/tickets', ticketsRouter);

describe('Actions Taken API Tests (Sprint 4 - Issue 2)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/tickets/:id/actions', () => {
    it('API-01: IT Staff creates a valid Action Taken (auto-bound performer)', async () => {
      mockTicketFindUnique.mockResolvedValue({ id: 10, title: 'Sample Ticket', requesterId: 5 });
      mockActionCreate.mockResolvedValue({
        id: 1,
        ticketId: 10,
        actionDateTime: new Date('2026-05-12T10:00:00Z'),
        actionDescription: 'Replaced faulty memory module.',
        result: 'Diagnostics passed with 0 errors.',
        performedById: 2,
        performedBy: { id: 2, name: 'IT Staff One', role: Role.IT_STAFF },
        followUpRequired: false,
        followUpNote: null,
        attachmentNotes: 'log.txt',
      });

      const response = await request(app)
        .post('/api/tickets/10/actions')
        .set('x-test-role', Role.IT_STAFF)
        .set('x-test-user-id', '2')
        .send({
          actionDescription: 'Replaced faulty memory module.',
          result: 'Diagnostics passed with 0 errors.',
          followUpRequired: false,
          attachmentNotes: 'log.txt',
        });

      expect(response.status).toBe(201);
      expect(response.body.performedById).toBe(2);
      expect(response.body.result).toBe('Diagnostics passed with 0 errors.');
      expect(mockActionCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            ticketId: 10,
            performedById: 2,
            actionDescription: 'Replaced faulty memory module.',
            result: 'Diagnostics passed with 0 errors.',
            followUpRequired: false,
          }),
        })
      );
    });

    it('API-02: Rejects Action Taken when followUpRequired=true but followUpNote is empty (BR-04)', async () => {
      const response = await request(app)
        .post('/api/tickets/10/actions')
        .set('x-test-role', Role.IT_STAFF)
        .send({
          actionDescription: 'Ordered new power supply unit.',
          result: 'Awaiting delivery.',
          followUpRequired: true,
          followUpNote: '   ', // empty
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Follow-up note is required');
      expect(mockActionCreate).not.toHaveBeenCalled();
    });

    it('API-03: Rejects Requester attempting to create Action Taken (AC-03 / BR-05)', async () => {
      const response = await request(app)
        .post('/api/tickets/10/actions')
        .set('x-test-role', Role.REQUESTER)
        .send({
          actionDescription: 'I restarted my own computer.',
          result: 'Still broken.',
          followUpRequired: false,
        });

      expect(response.status).toBe(403);
      expect(response.body.error).toContain('Forbidden');
      expect(mockActionCreate).not.toHaveBeenCalled();
    });

    it('API-06: Different IT Staff member logs Action Taken on another staff\'s ticket (BR-02)', async () => {
      mockTicketFindUnique.mockResolvedValue({ id: 10, ticketOwnerId: 1, requesterId: 5 });
      mockActionCreate.mockResolvedValue({
        id: 2,
        ticketId: 10,
        performedById: 3, // Staff member 3, different from owner 1
        actionDescription: 'Assisted with network switch configuration.',
        result: 'VLAN routing confirmed operational.',
        followUpRequired: false,
      });

      const response = await request(app)
        .post('/api/tickets/10/actions')
        .set('x-test-role', Role.IT_STAFF)
        .set('x-test-user-id', '3')
        .send({
          actionDescription: 'Assisted with network switch configuration.',
          result: 'VLAN routing confirmed operational.',
          followUpRequired: false,
        });

      expect(response.status).toBe(201);
      expect(mockActionCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ performedById: 3 }),
        })
      );
    });

    it('Rejects inactive IT Staff member from recording actions (BR-06)', async () => {
      const response = await request(app)
        .post('/api/tickets/10/actions')
        .set('x-test-role', Role.IT_STAFF)
        .set('x-test-active', 'false')
        .send({
          actionDescription: 'Attempted action while inactive.',
          result: 'Fail',
          followUpRequired: false,
        });

      expect(response.status).toBe(403);
      expect(response.body.error).toContain('Inactive staff');
      expect(mockActionCreate).not.toHaveBeenCalled();
    });

    it('Validates min length of actionDescription and result (BR-03)', async () => {
      const response = await request(app)
        .post('/api/tickets/10/actions')
        .set('x-test-role', Role.IT_STAFF)
        .send({
          actionDescription: 'fix', // < 5 chars
          result: 'ok', // < 3 chars
          followUpRequired: false,
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Action description');
    });
  });

  describe('GET /api/tickets/:id/actions', () => {
    it('API-04: Requester views Actions Taken for own ticket (AC-04)', async () => {
      mockTicketFindUnique.mockResolvedValue({ id: 10, requesterId: 1 });
      mockActionFindMany.mockResolvedValue([
        {
          id: 1,
          ticketId: 10,
          actionDescription: 'Inspected hardware.',
          result: 'All clear.',
          performedBy: { id: 2, name: 'IT Staff One' },
        },
      ]);

      const response = await request(app)
        .get('/api/tickets/10/actions')
        .set('x-test-role', Role.REQUESTER)
        .set('x-test-user-id', '1');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].actionDescription).toBe('Inspected hardware.');
    });

    it('API-05: Requester forbidden from viewing Actions Taken for another user\'s ticket (AC-04)', async () => {
      mockTicketFindUnique.mockResolvedValue({ id: 10, requesterId: 99 }); // Not user 1

      const response = await request(app)
        .get('/api/tickets/10/actions')
        .set('x-test-role', Role.REQUESTER)
        .set('x-test-user-id', '1');

      expect(response.status).toBe(403);
      expect(response.body.error).toContain('Forbidden');
    });

    it('IT Staff can view Actions Taken for any ticket', async () => {
      mockTicketFindUnique.mockResolvedValue({ id: 10, requesterId: 99 });
      mockActionFindMany.mockResolvedValue([]);

      const response = await request(app)
        .get('/api/tickets/10/actions')
        .set('x-test-role', Role.IT_STAFF)
        .set('x-test-user-id', '2');

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
  });

  describe('PATCH /api/tickets/:id/actions/:actionId', () => {
    it('IT Staff successfully updates Action Taken details', async () => {
      mockActionFindFirst.mockResolvedValue({
        id: 5,
        ticketId: 10,
        actionDescription: 'Old description',
        result: 'Old result',
        followUpRequired: false,
        followUpNote: null,
      });

      mockActionUpdate.mockResolvedValue({
        id: 5,
        ticketId: 10,
        actionDescription: 'Updated description with more detail.',
        result: 'Updated result outcome.',
        followUpRequired: true,
        followUpNote: 'Check again in 24 hours.',
        performedBy: { id: 2, name: 'IT Staff One' },
      });

      const response = await request(app)
        .patch('/api/tickets/10/actions/5')
        .set('x-test-role', Role.IT_STAFF)
        .send({
          actionDescription: 'Updated description with more detail.',
          result: 'Updated result outcome.',
          followUpRequired: true,
          followUpNote: 'Check again in 24 hours.',
        });

      expect(response.status).toBe(200);
      expect(response.body.actionDescription).toBe('Updated description with more detail.');
      expect(mockActionUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 5 },
          data: expect.objectContaining({
            actionDescription: 'Updated description with more detail.',
            result: 'Updated result outcome.',
            followUpRequired: true,
            followUpNote: 'Check again in 24 hours.',
          }),
        })
      );
    });

    it('Requester forbidden from updating Action Taken (403)', async () => {
      const response = await request(app)
        .patch('/api/tickets/10/actions/5')
        .set('x-test-role', Role.REQUESTER)
        .send({
          actionDescription: 'Unauthorized edit',
        });

      expect(response.status).toBe(403);
      expect(mockActionUpdate).not.toHaveBeenCalled();
    });
  });
});
