import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { TicketStatus, Priority, Role } from '../../generated/prisma/client';
import express from 'express';
import ticketsRouter from './tickets';

// Setup Express app for testing
const app = express();
app.use(express.json());

// Mock prisma
const { mockFindUnique, mockUpdate } = vi.hoisted(() => ({
  mockFindUnique: vi.fn(),
  mockUpdate: vi.fn(),
}));

vi.mock('../prismaClient', () => ({
  prisma: {
    ticket: {
      findUnique: mockFindUnique,
      update: mockUpdate,
    }
  }
}));

// Mock auth middleware
vi.mock('../middleware/auth', () => ({
  authenticateUser: (req: any, res: any, next: any) => {
    const role = req.headers['x-test-role'] || Role.REQUESTER;
    const userId = req.headers['x-test-user-id'] ? parseInt(req.headers['x-test-user-id'], 10) : 1;
    req.user = { id: userId, role, requiresPasswordChange: false };
    next();
  },
  requireRole: (roles: string[]) => (req: any, res: any, next: any) => {
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' });
    next();
  },
}));

app.use('/api/tickets', ticketsRouter);

describe('Authorization API Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('API-06: Requester requests IT Staff Ticket Queue', () => {
    it('should return 403 when Requester tries to access a ticket they do not own', async () => {
      mockFindUnique.mockResolvedValue({
        id: 1,
        title: 'Test',
        requesterId: 2, // Belongs to user 2
      });

      const response = await request(app)
        .get('/api/tickets/1')
        .set('x-test-role', Role.REQUESTER)
        .set('x-test-user-id', '1');

      expect(response.status).toBe(403);
      expect(response.body.error).toContain('Forbidden');
    });
  });

  describe('API-12: Requester attempts to officially close ticket', () => {
    it('should return 403 when Requester tries to update ticket status via IT Staff endpoint', async () => {
      const response = await request(app)
        .patch('/api/tickets/1')
        .set('x-test-role', Role.REQUESTER)
        .set('x-test-user-id', '1')
        .send({ status: TicketStatus.CLOSED });

      expect(response.status).toBe(403);
      expect(response.body.error).toContain('Forbidden');
      expect(mockUpdate).not.toHaveBeenCalled();
    });
  });
});
