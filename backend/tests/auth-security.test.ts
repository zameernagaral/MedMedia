import request from 'supertest';
import jwt from 'jsonwebtoken';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

jest.mock('../src/data/prismaClient', () => ({
  __esModule: true,
  default: {
    $connect: jest.fn().mockResolvedValue(undefined as never),
    user: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn()
    },
    post: { count: jest.fn(), findMany: jest.fn() },
    follow: { findUnique: jest.fn() }
  }
}));

import prisma from '../src/data/prismaClient';
import { env } from '../src/config/env';
import app from '../src/server';

const mockedPrisma = prisma as unknown as {
  user: { findFirst: jest.Mock; findUnique: jest.Mock; create: jest.Mock };
  post: { count: jest.Mock; findMany: jest.Mock };
  follow: { findUnique: jest.Mock };
};
const mockedUser = mockedPrisma.user;

describe('Authentication security', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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

  it('rejects missing, malformed, and expired bearer tokens', async () => {
    const missing = await request(app).post('/api/posts').send({});
    const malformed = await request(app).post('/api/posts').set('Authorization', 'Bearer not-a-jwt').send({});
    const expiredToken = jwt.sign({ userId: 'expired-user', role: 'DOCTOR' }, env.JWT_SECRET, { expiresIn: -1 });
    const expired = await request(app).post('/api/posts').set('Authorization', `Bearer ${expiredToken}`).send({});

    expect(missing.status).toBe(401);
    expect(malformed.status).toBe(401);
    expect(expired.status).toBe(401);
  });

  it('does not trust an ADMIN role claim over the database account role', async () => {
    mockedUser.findUnique.mockResolvedValue({ role: 'STUDENT', verificationStatus: 'PENDING' } as never);
    const forgedPrivilegeToken = jwt.sign({ userId: 'regular-user', role: 'ADMIN' }, env.JWT_SECRET, { expiresIn: '1h' });

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

  it('does not require Redis for readiness when Redis is disabled', async () => {
    const response = await request(app).get('/api/ready');

    expect(response.status).toBe(200);
    expect(response.body.ready).toBe(true);
    expect((prisma as any).$connect).toHaveBeenCalled();
  });
});