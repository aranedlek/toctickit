import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { TicketStatus, Priority, Role } from '../../generated/prisma/client';

const { mockCreate, mockFindMany, mockCount, mockFindUnique, mockUpdate } = vi.hoisted(() => ({
  mockCreate: vi.fn(),
  mockFindMany: vi.fn(),
  mockCount: vi.fn(),
  mockFindUnique: vi.fn(),
  mockUpdate: vi.fn(),
}));

vi.mock('../prismaClient', () => {
  return {
    prisma: {
      ticket: {
        create: mockCreate,
        findMany: mockFindMany,
        count: mockCount,
        findUnique: mockFindUnique,
        update: mockUpdate,
      },
      category: {
        findUnique: mockFindUnique,
      },
      relatedSystem: {
        findUnique: mockFindUnique,
      },
      publicComment: {
        create: mockCreate,
      },
      internalNote: {
        create: mockCreate,
      }
    }
  };
});

// Mock auth middleware to automatically log in a Requester with ID=1
vi.mock('../middleware/auth', () => ({
  authenticateUser: (req: any, res: any, next: any) => {
    // Determine role based on a custom header for testing, default to REQUESTER
    const role = req.headers['x-test-role'] || Role.REQUESTER;
    req.user = { id: 1, role, requiresPasswordChange: false };
    next();
  },
  requireRole: (roles: string[]) => (req: any, res: any, next: any) => {
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' });
    next();
  },
}));

import app from '../index';

describe('Tickets API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('API-05: POST /api/tickets creates a valid ticket using authenticated user', async () => {
    mockFindUnique.mockResolvedValue({ isActive: true }); // Mocks category/system
    
    mockCreate.mockResolvedValue({
      id: 1,
      title: 'API Test Ticket',
      description: 'Testing the creation endpoint',
      categoryId: 1,
      priority: Priority.HIGH,
      requesterId: 1,
      status: TicketStatus.NEW,
    });

    const res = await request(app)
      .post('/api/tickets')
      .send({
        title: 'API Test Ticket',
        description: 'Testing the creation endpoint',
        categoryId: 1,
        priority: Priority.HIGH,
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id', 1);
    expect(res.body.title).toBe('API Test Ticket');
    expect(res.body.status).toBe(TicketStatus.NEW);
  });

  it('API-06: POST /api/tickets missing title', async () => {
    const res = await request(app)
      .post('/api/tickets')
      .send({
        description: 'Testing the creation endpoint',
        categoryId: 1,
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Title is required');
  });

  it('API-10: GET /api/tickets returns paginated list for authenticated user', async () => {
    mockFindMany.mockResolvedValue([
      { id: 1, title: 'T1' },
      { id: 2, title: 'T2' }
    ]);
    mockCount.mockResolvedValue(2);

    const res = await request(app)
      .get(`/api/tickets`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('total', 2);
    expect(res.body.data).toHaveLength(2);
  });

  it('Should allow IT_STAFF to update ticket status', async () => {
    mockFindUnique.mockResolvedValue({ id: 1, title: 'Test Ticket' });
    mockUpdate.mockResolvedValue({ id: 1, status: TicketStatus.IN_PROGRESS });

    const res = await request(app)
      .patch('/api/tickets/1')
      .set('x-test-role', Role.IT_STAFF)
      .send({ status: TicketStatus.IN_PROGRESS });
    
    expect(res.status).toBe(200);
    expect(res.body.status).toBe(TicketStatus.IN_PROGRESS);
  });

  it('Should forbid REQUESTER from updating ticket status directly', async () => {
    const res = await request(app)
      .patch('/api/tickets/1')
      .set('x-test-role', Role.REQUESTER)
      .send({ status: TicketStatus.IN_PROGRESS });
    
    expect(res.status).toBe(403);
  });

  it('Should allow REQUESTER to resolve their own ticket', async () => {
    mockFindUnique.mockResolvedValue({ id: 1, requesterId: 1 });
    mockUpdate.mockResolvedValue({ id: 1, status: TicketStatus.RESOLVED });

    const res = await request(app)
      .patch('/api/tickets/1/resolve')
      .set('x-test-role', Role.REQUESTER);
    
    expect(res.status).toBe(200);
  });
});
