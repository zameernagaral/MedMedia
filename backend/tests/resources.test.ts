import request from 'supertest';
import jwt from 'jsonwebtoken';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

jest.mock('../src/data/prismaClient', () => ({
  __esModule: true,
  default: {
    $connect: jest.fn().mockResolvedValue(undefined as never),
    resource: { findMany: jest.fn(), create: jest.fn() },
    resourceVote: { findUnique: jest.fn(), create: jest.fn(), delete: jest.fn(), count: jest.fn() },
    user: { findUnique: jest.fn() }
  }
}));

import prisma from '../src/data/prismaClient';
import { env } from '../src/config/env';
import app from '../src/server';

const mocked = prisma as unknown as {
  resource: { findMany: jest.Mock; create: jest.Mock };
  resourceVote: { findUnique: jest.Mock; create: jest.Mock; delete: jest.Mock; count: jest.Mock };
};

describe('Persistent resource library', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it('returns library resources from Prisma with vote counts', async () => {
    mocked.resource.findMany.mockResolvedValue([{
      id: 'resource-1', title: 'ECG guide', author: { fullName: 'Dr. Lee', role: 'DOCTOR' },
      authorRole: null, specialty: 'Cardiology', category: 'Clinical Guideline',
      description: 'Clinical reference', pageCount: 12, fileSize: '2 MB',
      downloadUrl: 'https://example.com/guide.pdf', keyPearls: '["Pearl"]', aiSummary: null,
      publishedDate: '2026', _count: { votes: 3 }, votes: []
    }] as never);

    const response = await request(app).get('/api/resources');

    expect(response.status).toBe(200);
    expect(response.body.resources[0]).toMatchObject({ author: 'Dr. Lee', upvotesCount: 3, keyPearls: ['Pearl'] });
  });

  it('requires authentication before accepting a resource vote', async () => {
    const response = await request(app).post('/api/resources/resource-1/upvote');
    expect(response.status).toBe(401);
  });

  it('stores a vote against the authenticated account', async () => {
    mocked.resourceVote.findUnique.mockResolvedValueOnce(null as never).mockResolvedValueOnce({ id: 'vote-1' } as never);
    mocked.resourceVote.create.mockResolvedValue({ id: 'vote-1' } as never);
    mocked.resourceVote.count.mockResolvedValue(1 as never);
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ role: 'STUDENT', authVersion: 0 } as never);
    const token = jwt.sign({ userId: 'user-1', role: 'STUDENT', tv: 0 }, env.JWT_SECRET, { expiresIn: '1h' });

    const response = await request(app).post('/api/resources/resource-1/upvote').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ isUpvoted: true, upvotesCount: 1 });
    expect(mocked.resourceVote.create).toHaveBeenCalledWith({ data: { userId: 'user-1', resourceId: 'resource-1' } });
  });
});
