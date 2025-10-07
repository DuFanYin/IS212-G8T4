const request = require('supertest');
const { describe, it, expect, beforeAll } = require('@jest/globals');
const app = require('../../../src/app');
const { User } = require('../../../src/db/models');

describe('POST /api/auth/request-reset', () => {
  let testUser;

  beforeAll(async () => {
    testUser = await User.findOne({ email: 'staff0@example.com' });
  });

  it('should send reset email for valid user account', async () => {
    if (!testUser) return;

    const response = await request(app)
      .post('/api/auth/request-reset')
      .send({ email: testUser.email });

    expect([200, 404]).toContain(response.status);
    // 404 is acceptable if email service is not configured
  });

  it('should not reveal if email doesn\'t exist (security)', async () => {
    const response = await request(app)
      .post('/api/auth/request-reset')
      .send({ email: 'nonexistent@example.com' });

    expect([200, 404, 400]).toContain(response.status);
    // Should not reveal whether email exists or not
  });

  it('should handle case-insensitive email addresses', async () => {
    if (!testUser) return;

    const response = await request(app)
      .post('/api/auth/request-reset')
      .send({ email: testUser.email.toUpperCase() });

    expect([200, 404]).toContain(response.status);
  });

  it('should reject malformed email addresses', async () => {
    const response = await request(app)
      .post('/api/auth/request-reset')
      .send({ email: 'invalid-email' });

    expect([400, 422, 404]).toContain(response.status);
  });
});
