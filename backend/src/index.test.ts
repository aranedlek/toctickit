import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from './index';

describe('GET /api/ticks', () => {
  beforeEach(async () => {
    // reset ticks before each test
    await request(app).delete('/api/ticks');
  });

  it('returns an empty array initially', async () => {
    const res = await request(app).get('/api/ticks');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ticks: [] });
  });

  it('POST /api/ticks adds a tick and returns updated list', async () => {
    const res = await request(app).post('/api/ticks');
    expect(res.status).toBe(201);
    expect(res.body.ticks).toEqual([1]);
  });

  it('POST /api/ticks increments tick number each time', async () => {
    await request(app).post('/api/ticks');
    const res = await request(app).post('/api/ticks');
    expect(res.body.ticks).toEqual([1, 2]);
  });

  it('GET /api/ticks reflects all added ticks', async () => {
    await request(app).post('/api/ticks');
    await request(app).post('/api/ticks');
    const res = await request(app).get('/api/ticks');
    expect(res.body.ticks).toEqual([1, 2]);
  });

  it('DELETE /api/ticks resets the list', async () => {
    await request(app).post('/api/ticks');
    const res = await request(app).delete('/api/ticks');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ticks: [] });
  });
});
