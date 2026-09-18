import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { Role } from '../../generated/prisma/client';

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
      user: {
        create: mockCreate,
        findMany: mockFindMany,
        count: mockCount,
        findUnique: mockFindUnique,
        update: mockUpdate,
      },
    }
  };
});

// Mock auth middleware to automatically log in an Admin with ID=1
vi.mock('../middleware/auth', () => ({
  authenticateUser: (req: any, res: any, next: any) => {
    const role = req.headers['x-test-role'] || Role.ADMINISTRATOR;
    req.user = { id: 1, role, requiresPasswordChange: false };
    next();
  },
  requireRole: (roles: string[]) => (req: any, res: any, next: any) => {
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' });
    next();
  },
}));

import app from '../index';

describe('Users API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Should allow ADMINISTRATOR to create a new user', async () => {
    mockFindUnique.mockResolvedValue(null); // email not taken
    mockCreate.mockResolvedValue({
      id: 2,
      name: 'New User',
      email: 'new@example.com',
      role: Role.IT_STAFF,
      isActive: true,
      requiresPasswordChange: true
    });

    const res = await request(app)
      .post('/api/users')
      .send({
        name: 'New User',
        email: 'new@example.com',
        role: Role.IT_STAFF,
        initialPassword: 'TempPassword1!'
      });

    expect(res.status).toBe(201);
    expect(res.body.email).toBe('new@example.com');
    expect(res.body.requiresPasswordChange).toBe(true);
  });

  it('Should reject duplicate emails when creating a user', async () => {
    mockFindUnique.mockResolvedValue({ id: 2, email: 'taken@example.com' });

    const res = await request(app)
      .post('/api/users')
      .send({
        name: 'New User',
        email: 'taken@example.com',
        role: Role.IT_STAFF,
        initialPassword: 'TempPassword1!'
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Email already exists');
  });

  it('Should forbid IT_STAFF from accessing users API', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('x-test-role', Role.IT_STAFF);

    expect(res.status).toBe(403);
  });

  it('Should prevent administrator from deactivating themselves', async () => {
    mockFindUnique.mockResolvedValue({ id: 1, role: Role.ADMINISTRATOR, isActive: true });

    const res = await request(app)
      .patch('/api/users/1')
      .send({ isActive: false });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('You cannot deactivate your own account');
  });

  it('Should prevent deactivating the last administrator', async () => {
    // Updating another admin (ID=2), but they are the last one active
    mockFindUnique.mockResolvedValue({ id: 2, role: Role.ADMINISTRATOR, isActive: true });
    mockCount.mockResolvedValue(1); // Only 1 active admin left

    const res = await request(app)
      .patch('/api/users/2')
      .send({ isActive: false });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Cannot deactivate the last active administrator');
  });
});
