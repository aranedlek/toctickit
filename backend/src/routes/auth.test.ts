import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../index';
import { prisma } from '../prismaClient';
import bcrypt from 'bcryptjs';
import { Role } from '../../generated/prisma/client';

describe('Auth API', () => {
  let testUser: any;
  let inactiveUser: any;

  beforeAll(async () => {
    // Setup test users
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('TestPassword123!', salt);

    testUser = await prisma.user.create({
      data: {
        name: 'Test Active User',
        email: 'testactive@example.com',
        role: Role.REQUESTER,
        isActive: true,
        requiresPasswordChange: true,
        passwordHash,
      }
    });

    inactiveUser = await prisma.user.create({
      data: {
        name: 'Test Inactive User',
        email: 'testinactive@example.com',
        role: Role.REQUESTER,
        isActive: false,
        requiresPasswordChange: false,
        passwordHash,
      }
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: {
        email: { in: ['testactive@example.com', 'testinactive@example.com'] }
      }
    });
  });

  it('API-01: Valid login should return 200 and a token cookie', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'testactive@example.com', password: 'TestPassword123!' });

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('testactive@example.com');
    expect(res.headers['set-cookie']).toBeDefined();
    expect(res.headers['set-cookie'][0]).toContain('token=');
  });

  it('API-02: Invalid login should return 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'testactive@example.com', password: 'WrongPassword!' });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid email or password');
  });

  it('API-03: Inactive account login should return 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'testinactive@example.com', password: 'TestPassword123!' });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid email or password');
  });

  it('API-04: Should fetch current user details if logged in', async () => {
    // First login
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'testactive@example.com', password: 'TestPassword123!' });
    
    const cookie = loginRes.headers['set-cookie'];

    // Then fetch /me
    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Cookie', cookie);

    expect(meRes.status).toBe(200);
    expect(meRes.body.user.email).toBe('testactive@example.com');
  });

  it('Should successfully change password and update requiresPasswordChange flag', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'testactive@example.com', password: 'TestPassword123!' });
    
    const cookie = loginRes.headers['set-cookie'];

    const changeRes = await request(app)
      .post('/api/auth/change-password')
      .set('Cookie', cookie)
      .send({ currentPassword: 'TestPassword123!', newPassword: 'NewSecurePassword456!' });

    expect(changeRes.status).toBe(200);
    expect(changeRes.body.message).toBe('Password updated successfully');

    // Verify it works with the new password
    const newLoginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'testactive@example.com', password: 'NewSecurePassword456!' });
      
    expect(newLoginRes.status).toBe(200);
    expect(newLoginRes.body.user.requiresPasswordChange).toBe(false);
  });

  it('Should successfully logout and clear the token cookie', async () => {
    const res = await request(app)
      .post('/api/auth/logout');

    expect(res.status).toBe(200);
    expect(res.headers['set-cookie'][0]).toContain('token=;');
  });
});
