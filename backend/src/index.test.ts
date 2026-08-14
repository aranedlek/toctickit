import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';

const { mockFindMany } = vi.hoisted(() => {
  return { mockFindMany: vi.fn() };
});

vi.mock('../generated/prisma/client', () => {
  return {
    PrismaClient: class {
      category = {
        findMany: mockFindMany,
      };
      $disconnect = vi.fn();
    },
  };
});

import app from './index';

const SEEDED_CATEGORIES = [
  { id: 1, name: 'Account and Access', createdAt: new Date() },
  { id: 2, name: 'Hardware', createdAt: new Date() },
  { id: 3, name: 'Software', createdAt: new Date() },
  { id: 4, name: 'Network', createdAt: new Date() },
];

describe('API-01: GET /health', () => {
  it('returns 200 and { status: "ok" }', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});

describe('API-02: GET /api/categories', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the four seeded categories', async () => {
    mockFindMany.mockResolvedValue(SEEDED_CATEGORIES);

    const res = await request(app).get('/api/categories');
    expect(res.status).toBe(200);
    expect(res.body.categories).toHaveLength(4);

    const names = res.body.categories.map((c: any) => c.name);
    expect(names).toContain('Account and Access');
    expect(names).toContain('Hardware');
    expect(names).toContain('Software');
    expect(names).toContain('Network');
  });

  it('returns seeded categories when DB throws', async () => {
    mockFindMany.mockRejectedValue(new Error('DB connection error'));

    const res = await request(app).get('/api/categories');
    expect(res.status).toBe(200);
    expect(res.body.categories).toHaveLength(4);
  });
});
