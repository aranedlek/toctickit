import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { Role } from '../../generated/prisma/client';

const { mockCreate, mockFindMany, mockUpdate, mockDelete, mockCount } = vi.hoisted(() => ({
  mockCreate: vi.fn(),
  mockFindMany: vi.fn(),
  mockUpdate: vi.fn(),
  mockDelete: vi.fn(),
  mockCount: vi.fn(),
}));

vi.mock('../prismaClient', () => {
  return {
    prisma: {
      category: {
        create: mockCreate,
        findMany: mockFindMany,
        update: mockUpdate,
        delete: mockDelete,
      },
      ticket: {
        count: mockCount,
      }
    }
  };
});

vi.mock('../middleware/auth', () => ({
  authenticateUser: (req: any, res: any, next: any) => {
    const role = req.headers['x-test-role'];
    if (!role) return next(); // Not authenticated for public GET
    req.user = { id: 1, role, requiresPasswordChange: false };
    next();
  },
  requireRole: (roles: string[]) => (req: any, res: any, next: any) => {
    if (!req.user || !roles.includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' });
    next();
  },
}));

import app from '../index';

describe('Categories API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('GET /api/categories allows public access', async () => {
    mockFindMany.mockResolvedValue([{ id: 1, name: 'Hardware' }]);
    const res = await request(app).get('/api/categories');
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
  });

  it('POST /api/categories allows IT_STAFF to create category', async () => {
    mockCreate.mockResolvedValue({ id: 2, name: 'Software' });
    const res = await request(app)
      .post('/api/categories')
      .set('x-test-role', Role.IT_STAFF)
      .send({ name: 'Software' });
    
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Software');
  });

  it('POST /api/categories forbids REQUESTER', async () => {
    const res = await request(app)
      .post('/api/categories')
      .set('x-test-role', Role.REQUESTER)
      .send({ name: 'Software' });
    
    expect(res.status).toBe(403);
  });

  it('DELETE /api/categories/:id allows deletion if not in use', async () => {
    mockCount.mockResolvedValue(0);
    const res = await request(app)
      .delete('/api/categories/1')
      .set('x-test-role', Role.ADMINISTRATOR);
    
    expect(res.status).toBe(204);
  });

  it('DELETE /api/categories/:id rejects deletion if in use', async () => {
    mockCount.mockResolvedValue(5);
    const res = await request(app)
      .delete('/api/categories/1')
      .set('x-test-role', Role.ADMINISTRATOR);
    
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Cannot delete category in use by tickets');
  });
});
