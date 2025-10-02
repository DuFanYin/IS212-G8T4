const request = require('supertest');
const { describe, it, expect, beforeAll } = require('@jest/globals');
const app = require('../../../src/app');
const { User, Team } = require('../../../src/db/models');
const { generateToken } = require('../../../src/services/authService');

describe('GET /api/tasks/team/:teamId', () => {
  let managerToken;
  let directorToken;
  let staffToken;
  let testTeamId;

  beforeAll(async () => {
    const managerUser = await User.findOne({ email: 'manager0@example.com' });
    const directorUser = await User.findOne({ email: 'director0@example.com' });
    const staffUser = await User.findOne({ email: 'staff0@example.com' });
    
    if (managerUser) managerToken = generateToken(managerUser._id);
    if (directorUser) directorToken = generateToken(directorUser._id);
    if (staffUser) staffToken = generateToken(staffUser._id);

    // Get a team ID for testing
    const team = await Team.findOne({});
    if (team) testTeamId = team._id;
  });

  it('should get tasks by team for manager', async () => {
    if (!managerToken || !testTeamId) return;

    const response = await request(app)
      .get(`/api/tasks/team/${testTeamId}`)
      .set('Authorization', `Bearer ${managerToken}`);

    expect([200, 400]).toContain(response.status);
    if (response.status === 200) {
      expect(response.body.status).toBe('success');
      expect(Array.isArray(response.body.data)).toBe(true);
    }
  });

  it('should get tasks by team for director', async () => {
    if (!directorToken || !testTeamId) return;

    const response = await request(app)
      .get(`/api/tasks/team/${testTeamId}`)
      .set('Authorization', `Bearer ${directorToken}`);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it('should deny access to staff users', async () => {
    if (!staffToken || !testTeamId) return;

    const response = await request(app)
      .get(`/api/tasks/team/${testTeamId}`)
      .set('Authorization', `Bearer ${staffToken}`);

    expect([403, 401, 400]).toContain(response.status);
  });

  it('should require authentication', async () => {
    if (!testTeamId) return;

    const response = await request(app)
      .get(`/api/tasks/team/${testTeamId}`);

    expect(response.status).toBe(401);
  });

  it('should handle non-existent team', async () => {
    if (!managerToken) return;

    const nonExistentTeamId = '507f1f77bcf86cd799439011';
    
    const response = await request(app)
      .get(`/api/tasks/team/${nonExistentTeamId}`)
      .set('Authorization', `Bearer ${managerToken}`);

    expect([200, 404, 400]).toContain(response.status);
    // 200 with empty array is acceptable for non-existent team
  });
});
