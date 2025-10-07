const request = require('supertest');
const { describe, it, expect, beforeAll } = require('@jest/globals');
const app = require('../../../src/app');
const { User } = require('../../../src/db/models');
const { generateToken } = require('../../../src/services/authService');

describe('GET /api/users/profile', () => {
  let staffToken;

  beforeAll(async () => {
    const staffUser = await User.findOne({ email: 'staff0@example.com' });
    if (staffUser) staffToken = generateToken(staffUser._id);
  });

  it('should return authenticated user\'s profile information', async () => {
    if (!staffToken) return;

    const response = await request(app)
      .get('/api/users/profile')
      .set('Authorization', `Bearer ${staffToken}`);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.data).toEqual(
      expect.objectContaining({
        email: 'staff0@example.com',
        role: 'staff'
      })
    );
  });
});



