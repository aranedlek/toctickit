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
      relatedSystem: {
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
    if (!role) return next();
    req.user = { id: 1, role, requiresPasswordChange: false };
    next();
  },
  requireRole: (roles: string[]) => (req: any, res: any, next: any) => {
    if (!req.user || !roles.includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' });
    next();
  },
}));

import app from '../index';

describe('Related Systems API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('GET /api/related-systems allows public access', async () => {
    mockFindMany.mockResolvedValue([{ id: 1, name: 'ERP' }]);
    const res = await request(app).get('/api/related-systems');
    expect(res.status).toBe(200);
  });

  it('POST /api/related-systems allows IT_STAFF to create system', async () => {
    mockCreate.mockResolvedValue({ id: 2, name: 'CRM' });
    const res = await request(app)
      .post('/api/related-systems')
      .set('x-test-role', Role.IT_STAFF)
      .send({ name: 'CRM' });
    
    expect(res.status).toBe(201);
  });

  it('DELETE /api/related-systems/:id rejects deletion if in use', async () => {
    mockCount.mockResolvedValue(1);
    const res = await request(app)
      .delete('/api/related-systems/1')
      .set('x-test-role', Role.ADMINISTRATOR);
    
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Cannot delete system in use by tickets');
  });
});
