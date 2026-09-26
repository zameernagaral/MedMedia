import request from 'supertest';
import app from '../src/server';
import { describe, it, expect } from '@jest/globals';

describe('Healthcheck Endpoint', () => {
  it('should return 200 and status online', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'online');
    expect(response.body).toHaveProperty('service', 'MedMedia Healthcare API');
  });
});
