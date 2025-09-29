const request = require('supertest');
const { describe, it, expect, beforeEach } = require('@jest/globals');
const app = require('../../../src/app');
const { User } = require('../../../src/db/models');
const { generateToken } = require('../../../src/services/authService');

describe('GET /api/users/team-members', () => {
  let staffToken;
  let managerToken;

  beforeEach(async () => {
    const staffUser = await User.findOne({ email: 'staff@example.com' });
    const managerUser = await User.findOne({ email: 'manager@example.com' });
    if (staffUser) staffToken = generateToken(staffUser._id);
    if (managerUser) managerToken = generateToken(managerUser._id);
  });

  it('should allow managers to see team members', async () => {
    const response = await request(app)
      .get('/api/users/team-members')
      .set('Authorization', `Bearer ${managerToken}`);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
  });

  it('should deny staff access to team members', async () => {
    const response = await request(app)
      .get('/api/users/team-members')
      .set('Authorization', `Bearer ${staffToken}`);

    expect(response.status).toBe(403);
  });

  it('should return 401 when no token provided', async () => {
    const res = await request(app)
      .get('/api/users/team-members');
    expect(res.status).toBe(401);
  });
});


