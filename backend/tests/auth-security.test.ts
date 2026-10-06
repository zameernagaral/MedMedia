import request from 'supertest';
import jwt from 'jsonwebtoken';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

jest.mock('../src/data/prismaClient', () => ({
  __esModule: true,
  default: {
    $connect: jest.fn().mockResolvedValue(undefined as never),
    user: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      create: jest.fn()
    },
    post: { count: jest.fn(), findMany: jest.fn(), findUnique: jest.fn() },
    comment: { findMany: jest.fn() },
    follow: { findUnique: jest.fn() }
  }
}));

import prisma from '../src/data/prismaClient';
import { env } from '../src/config/env';
import { verificationBadgeTitle } from '../src/utils/verification';
import app from '../src/server';

const mockedPrisma = prisma as unknown as {
  user: { findFirst: jest.Mock; findMany: jest.Mock; findUnique: jest.Mock; update: jest.Mock; create: jest.Mock };
  post: { count: jest.Mock; findMany: jest.Mock; findUnique: jest.Mock };
  comment: { findMany: jest.Mock };
  follow: { findUnique: jest.Mock };
};
const mockedUser = mockedPrisma.user;

describe('Authentication security', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not label pending accounts as verified', () => {
    expect(verificationBadgeTitle('DOCTOR', 'PENDING')).toBe('Verification pending');
    expect(verificationBadgeTitle('STUDENT', 'VERIFIED')).toBe('Verified Medical Student');
  });

  it('rejects attempts to register with an elevated role', async () => {
    const response = await request(app).post('/api/auth/register').send({
      fullName: 'Test Admin',
      username: 'test-admin',
      email: 'test-admin@example.com',
      password: 'StrongPassword123',
      role: 'ADMIN'
    });

    expect(response.status).toBe(400);
    expect(mockedUser.findFirst).not.toHaveBeenCalled();
    expect(mockedUser.create).not.toHaveBeenCalled();
  });

  it('does not accept client-provided credentials as verification', async () => {
    mockedUser.findFirst.mockResolvedValue(null as never);
    mockedUser.create.mockResolvedValue({
      id: 'new-user',
      fullName: 'Test Doctor',
      username: 'test-doctor',
      email: 'test-doctor@example.com',
      avatarUrl: null,
      role: 'DOCTOR',
      verificationStatus: 'PENDING',
      doctorProfile: null,
      studentProfile: null
    } as never);

    const response = await request(app).post('/api/auth/register').send({
      fullName: 'Test Doctor',
      username: 'test-doctor',
      email: 'test-doctor@example.com',
      password: 'StrongPassword123',
      role: 'DOCTOR',
      doctorDetails: { medicalCouncilRegNumber: 'FAKE-REGISTRATION' }
    });

    expect(response.status).toBe(201);
    expect(response.body).not.toHaveProperty('token');
    const createCall = mockedUser.create.mock.calls[0][0] as { data: { verificationStatus: string } };
    expect(createCall.data.verificationStatus).toBe('PENDING');
  });

  it('returns a conflict for duplicate registration identifiers', async () => {
    mockedUser.findFirst.mockResolvedValue({ id: 'existing-user' } as never);

    const response = await request(app).post('/api/auth/register').send({
      fullName: 'Existing User',
      username: 'existing-user',
      email: 'existing@example.com',
      password: 'StrongPassword123',
      role: 'STUDENT'
    });

    expect(response.status).toBe(409);
    expect(response.body.message).toContain('already exists');
    expect(mockedUser.create).not.toHaveBeenCalled();
  });

  it('rejects missing, malformed, and expired bearer tokens', async () => {
    const missing = await request(app).post('/api/posts').send({});
    const malformed = await request(app).post('/api/posts').set('Authorization', 'Bearer not-a-jwt').send({});
    const expiredToken = jwt.sign({ userId: 'expired-user', role: 'DOCTOR' }, env.JWT_SECRET, { expiresIn: -1 });
    const expired = await request(app).post('/api/posts').set('Authorization', `Bearer ${expiredToken}`).send({});

    expect(missing.status).toBe(401);
    expect(malformed.status).toBe(401);
    expect(expired.status).toBe(401);
  });

  it('blocks cookie-authenticated writes without an allowed browser origin', async () => {
    const response = await request(app)
      .post('/api/auth/verify-otp')
      .set('Cookie', 'token=browser-session')
      .set('Origin', 'https://attacker.example')
      .send({});

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe('CSRF_ORIGIN_REJECTED');
  });

  it('allows cookie-authenticated writes from a configured web origin', async () => {
    const response = await request(app)
      .post('/api/auth/verify-otp')
      .set('Cookie', 'token=browser-session')
      .set('Origin', 'http://localhost:3000')
      .send({});

    // The route is not implemented yet; 501 confirms the CSRF guard passed it.
    expect(response.status).toBe(501);
  });

  it('does not trust an ADMIN role claim over the database account role', async () => {
    mockedUser.findUnique.mockResolvedValue({ role: 'STUDENT', verificationStatus: 'PENDING', authVersion: 0 } as never);
    const forgedPrivilegeToken = jwt.sign({ userId: 'regular-user', role: 'ADMIN', tv: 0 }, env.JWT_SECRET, { expiresIn: '1h' });

    const response = await request(app)
      .post('/api/opportunities/jobs')
      .set('Authorization', `Bearer ${forgedPrivilegeToken}`)
      .send({});

    expect(response.status).toBe(403);
  });

  it('rejects password login for accounts without a password hash', async () => {
    mockedUser.findFirst.mockResolvedValue({ id: 'oauth-user', passwordHash: null } as never);

    const response = await request(app).post('/api/auth/login').send({
      identifier: 'oauth-user@example.com',
      password: 'SomePassword123'
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Invalid credentials.');
    expect(response.body).not.toHaveProperty('token');
  });

  it('revokes the current JWT when the user logs out', async () => {
    mockedUser.findUnique.mockResolvedValue({ authVersion: 0 } as never);
    mockedUser.update.mockResolvedValue({ authVersion: 1 } as never);
    const token = jwt.sign({ userId: 'user-to-logout', role: 'STUDENT', tv: 0 }, env.JWT_SECRET, { expiresIn: '1h' });

    const response = await request(app).post('/api/auth/logout').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(mockedUser.update).toHaveBeenCalledWith({ where: { id: 'user-to-logout' }, data: { authVersion: { increment: 1 } } });
    expect(response.headers['set-cookie'][0]).toContain('token=;');

    mockedUser.findUnique.mockResolvedValue({ role: 'STUDENT', authVersion: 1 } as never);
    const rejectedSession = await request(app).post('/api/posts').set('Authorization', `Bearer ${token}`).send({});
    expect(rejectedSession.status).toBe(401);
  });

  it('does not create a development login for an unknown account', async () => {
    mockedUser.findFirst.mockResolvedValue(null as never);

    const response = await request(app).post('/api/auth/login').send({
      identifier: 'missing@example.com',
      password: 'StrongPassword123'
    });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('message', 'Invalid credentials.');
    expect(response.body).not.toHaveProperty('token');
  });

  it('masks private profiles from anonymous visitors', async () => {
    mockedUser.findUnique.mockResolvedValue({
      id: 'private-user',
      fullName: 'Private Doctor',
      username: 'private-doctor',
      avatarUrl: null,
      isPrivate: true,
      doctorProfile: { medicalCouncilRegNumber: 'PRIVATE-REGISTRATION' },
      studentProfile: null,
      _count: { followers: 2, following: 1, posts: 3 }
    } as never);

    const response = await request(app).get('/api/users/private-user');

    expect(response.status).toBe(200);
    expect(response.body.isMasked).toBe(true);
    expect(response.body.posts).toEqual([]);
    expect(response.body.user).not.toHaveProperty('doctorDetails');
    expect(mockedPrisma.post.findMany).not.toHaveBeenCalled();
  });

  it('excludes private-account posts from the public feed', async () => {
    mockedPrisma.post.count.mockResolvedValue(0 as never);
    mockedPrisma.post.findMany.mockResolvedValue([] as never);

    const response = await request(app).get('/api/posts');

    expect(response.status).toBe(200);
    expect(mockedPrisma.post.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { user: { OR: [{ isPrivate: false }] } }
    }));
  });

  it('does not expose private posts through the comments endpoint', async () => {
    mockedPrisma.post.findUnique.mockResolvedValue({ userId: 'private-owner', user: { isPrivate: true } } as never);

    const response = await request(app).get('/api/posts/private-post/comments');

    expect(response.status).toBe(403);
    expect(mockedPrisma.comment.findMany).not.toHaveBeenCalled();
  });

  it('omits private accounts from the public user directory', async () => {
    mockedUser.findMany.mockResolvedValue([] as never);

    const response = await request(app).get('/api/users');

    expect(response.status).toBe(200);
    expect(mockedUser.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { isPrivate: false } }));
  });

  it('protects admin metrics', async () => {
    const response = await request(app).get('/api/admin/metrics');
    expect(response.status).toBe(401);
  });

  it('does not require Redis for readiness when Redis is disabled', async () => {
    const response = await request(app).get('/api/ready');

    expect(response.status).toBe(200);
    expect(response.body.ready).toBe(true);
    expect((prisma as any).$connect).toHaveBeenCalled();
  });

  it('returns JSON when authentication requests are rate limited', async () => {
    let response = await request(app).post('/api/auth/login').send({});
    for (let attempt = 0; attempt < 24 && response.status !== 429; attempt += 1) {
      response = await request(app).post('/api/auth/login').send({});
    }

    expect(response.status).toBe(429);
    expect(response.headers['content-type']).toMatch(/application\/json/);
    expect(response.body).toEqual({
      success: false,
      message: 'Too many authentication attempts from this IP. Please wait 15 minutes and try again.'
    });
  });
});
