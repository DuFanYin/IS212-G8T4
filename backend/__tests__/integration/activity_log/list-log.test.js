const request = require('supertest');
const { describe, it, expect, beforeEach } = require('@jest/globals');
const app = require('../../../src/app');
const { User } = require('../../../src/db/models');
const { generateToken } = require('../../../src/services/authService');

describe('GET /api/logs', () => {
  let authToken;

  beforeEach(async () => {
    const staffUser = await User.findOne({ email: 'staff0@example.com' });
    if (staffUser) authToken = generateToken(staffUser._id);
  });

  it('should return 401 when not authenticated', async () => {
    const response = await request(app).get('/api/logs/');

    expect(response.status).toBe(401);
    expect(response.body.status).toBe('error');
    expect(response.body.message).toBe('No token provided');
  });

  it('should return all activity logs successfully for authenticated user', async () => {
    const response = await request(app)
      .get('/api/logs/')
      .set('Authorization', `Bearer ${authToken}`);
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(Array.isArray(response.body.data)).toBe(true);
  });
});


