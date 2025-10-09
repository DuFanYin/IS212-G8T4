const request = require('supertest');
const { describe, it, expect, beforeAll } = require('@jest/globals');
const app = require('../../../src/app');
const { User } = require('../../../src/db/models');
const { generateToken } = require('../../../src/services/authService');

describe('GET /api/users/team-members', () => {
  let managerToken;
  let staffToken;

  beforeAll(async () => {
    const managerUser = await User.findOne({ email: 'manager0@example.com' });
    const staffUser = await User.findOne({ email: 'staff0@example.com' });
    
    if (managerUser) managerToken = generateToken(managerUser._id);
    if (staffUser) staffToken = generateToken(staffUser._id);
  });

  it('should allow managers to view their team members', async () => {
    if (!managerToken) return;

    const response = await request(app)
      .get('/api/users/team-members')
      .set('Authorization', `Bearer ${managerToken}`);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it('should deny staff members from viewing team members', async () => {
    if (!staffToken) return;

    const response = await request(app)
      .get('/api/users/team-members')
      .set('Authorization', `Bearer ${staffToken}`);

    expect([403, 401]).toContain(response.status);
  });

  it('should require authentication to access team members', async () => {
    const response = await request(app)
      .get('/api/users/team-members');

    expect(response.status).toBe(401);
  });
});
