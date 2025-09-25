const request = require('supertest');
const { describe, it, expect, beforeEach } = require('@jest/globals');
const app = require('../../../src/app');
const { User } = require('../../../src/db/models');
const { generateToken } = require('../../../src/services/authService');

describe('GET /api/tasks/', () => {
  let staffToken;
  let managerToken;

  beforeEach(async () => {
    const staffUser = await User.findOne({ email: 'staff@example.com' });
    const managerUser = await User.findOne({ email: 'manager@example.com' });
    if (staffUser) staffToken = generateToken(staffUser._id);
    if (managerUser) managerToken = generateToken(managerUser._id);
  });

  it('should return tasks for authenticated user', async () => {
    const response = await request(app)
      .get('/api/tasks/')
      .set('Authorization', `Bearer ${staffToken}`);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it('should enforce role-based visibility', async () => {
    const staffResponse = await request(app)
      .get('/api/tasks/')
      .set('Authorization', `Bearer ${staffToken}`);

    const managerResponse = await request(app)
      .get('/api/tasks/')
      .set('Authorization', `Bearer ${managerToken}`);

    expect(staffResponse.status).toBe(200);
    expect(managerResponse.status).toBe(200);
    expect(managerResponse.body.data.length).toBeGreaterThanOrEqual(staffResponse.body.data.length);
  });
});


