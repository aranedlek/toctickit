import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { Role } from '../../generated/prisma/client';
import express from 'express';
import ticketsRouter from './tickets';

// Setup Express app for testing
const app = express();
app.use(express.json());

// Mock prisma
const { mockCreate, mockFindUnique } = vi.hoisted(() => ({
  mockCreate: vi.fn(),
  mockFindUnique: vi.fn(),
}));

vi.mock('../prismaClient', () => ({
  prisma: {
    ticket: {
      findUnique: mockFindUnique,
    },
    internalNote: {
      create: mockCreate,
    }
  }
}));

// Mock auth middleware
vi.mock('../middleware/auth', () => ({
  authenticateUser: (req: any, res: any, next: any) => {
    const role = req.headers['x-test-role'] || Role.REQUESTER;
    req.user = { id: 1, role, requiresPasswordChange: false };
    next();
  },
  requireRole: (roles: string[]) => (req: any, res: any, next: any) => {
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' });
    next();
  },
}));

app.use('/api/tickets', ticketsRouter);

describe('Internal Notes API Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('API-08: Requester requests Internal Notes', () => {
    it('should return 403 when Requester tries to create an internal note', async () => {
      const response = await request(app)
        .post('/api/tickets/1/internal-notes')
        .set('x-test-role', Role.REQUESTER)
        .send({ content: 'Test Note' });

      expect(response.status).toBe(403);
      expect(response.body.error).toContain('Forbidden');
      expect(mockCreate).not.toHaveBeenCalled();
    });

    it('should not return internal notes when Requester fetches ticket details', async () => {
      mockFindUnique.mockResolvedValue({
        id: 1,
        title: 'Test',
        requesterId: 1,
        internalNotes: [{ id: 1, content: 'Secret Note' }] // Even if mock returns it, prisma query shouldn't have included it, but we can test the query args if we want.
      });

      const response = await request(app)
        .get('/api/tickets/1')
        .set('x-test-role', Role.REQUESTER);

      expect(response.status).toBe(200);
      // Wait, let's actually check the arguments passed to mockFindUnique
      const callArgs = mockFindUnique.mock.calls[0][0];
      
      // internalNotes should be false when Role is REQUESTER
      expect(callArgs.include.internalNotes).toBe(false);
    });
  });
});
