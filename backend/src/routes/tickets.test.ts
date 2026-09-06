import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';

const { mockCreate, mockFindMany, mockCount, mockFindUnique } = vi.hoisted(() => ({
  mockCreate: vi.fn(),
  mockFindMany: vi.fn(),
  mockCount: vi.fn(),
  mockFindUnique: vi.fn(),
}));

vi.mock('../prismaClient', () => {
  return {
    prisma: {
      ticket: {
        create: mockCreate,
        findMany: mockFindMany,
        count: mockCount,
      },
      requester: {
        findUnique: mockFindUnique,
      },
      category: {
        findUnique: mockFindUnique,
      },
      relatedSystem: {
        findUnique: mockFindUnique,
      }
    }
  };
});

import app from '../index';
import { TicketStatus, Priority } from '../../generated/prisma/client';

describe('Tickets API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('API-05: POST /api/tickets creates a valid ticket', async () => {
    mockFindUnique.mockResolvedValue({ isActive: true }); // Mocks requester, category, relatedSystem checks to pass
    
    mockCreate.mockResolvedValue({
      id: 1,
      title: 'API Test Ticket',
      description: 'Testing the creation endpoint',
      categoryId: 1,
      priority: Priority.HIGH,
      requesterId: 1,
      status: TicketStatus.OPEN,
    });

    const res = await request(app)
      .post('/api/tickets')
      .send({
        title: 'API Test Ticket',
        description: 'Testing the creation endpoint',
        categoryId: 1,
        priority: Priority.HIGH,
        requesterId: 1,
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id', 1);
    expect(res.body.title).toBe('API Test Ticket');
    expect(res.body.status).toBe(TicketStatus.OPEN);
    expect(res.body.priority).toBe(Priority.HIGH);
  });

  it('API-06: POST /api/tickets missing title', async () => {
    const res = await request(app)
      .post('/api/tickets')
      .send({
        description: 'Testing the creation endpoint',
        categoryId: 1,
        requesterId: 1,
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Title is required');
  });

  it('API-10: GET /api/tickets?requesterId=X returns paginated list', async () => {
    mockFindMany.mockResolvedValue([
      { id: 1, title: 'T1' },
      { id: 2, title: 'T2' }
    ]);
    mockCount.mockResolvedValue(2);

    const res = await request(app)
      .get(`/api/tickets?requesterId=1`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('total', 2);
    expect(res.body).toHaveProperty('page', 1);
    expect(res.body.data).toHaveLength(2);
  });
});
