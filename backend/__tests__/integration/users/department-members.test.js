const request = require('supertest');
const { describe, it, expect, beforeEach } = require('@jest/globals');
const app = require('../../../src/app');
const { User } = require('../../../src/db/models');
const { generateToken } = require('../../../src/services/authService');

describe('GET /api/users/department-members', () => {
  let managerToken;
  let directorToken;

  beforeEach(async () => {
    const managerUser = await User.findOne({ email: 'manager@example.com' });
    const directorUser = await User.findOne({ email: 'director@example.com' });
    if (managerUser) managerToken = generateToken(managerUser._id);
    if (directorUser) directorToken = generateToken(directorUser._id);
  });

  it('should allow directors to see department members', async () => {
    const response = await request(app)
      .get('/api/users/department-members')
      .set('Authorization', `Bearer ${directorToken}`);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
  });

  it('should deny managers access to department members', async () => {
    const response = await request(app)
      .get('/api/users/department-members')
      .set('Authorization', `Bearer ${managerToken}`);

    expect(response.status).toBe(403);
  });

  it('should return 401 when no token provided', async () => {
    const res = await request(app)
      .get('/api/users/department-members');
    expect(res.status).toBe(401);
  });
});


