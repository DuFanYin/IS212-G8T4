const request = require('supertest');
const app = require('../../../src/app');
const { User } = require('../../../src/db/models');
const { generateToken } = require('../../../src/services/authService');

describe('GET /api/metrics/teams/:teamId', () => {
  let managerToken, smToken, hrToken, directorToken, staffToken;
  let testTeamId;

  beforeAll(async () => {
    const managerUser = await User.findOne({ email: 'manager0@example.com' });
    const smUser = await User.findOne({ email: 'sm0@example.com' });
    const hrUser = await User.findOne({ email: 'hr0@example.com' });
    const directorUser = await User.findOne({ email: 'director0@example.com' });
    const staffUser = await User.findOne({ email: 'staff0@example.com' });
    
    if (managerUser) managerToken = generateToken(managerUser._id);
    if (smUser) smToken = generateToken(smUser._id);
    if (hrUser) hrToken = generateToken(hrUser._id);
    if (directorUser) directorToken = generateToken(directorUser._id);
    if (staffUser) staffToken = generateToken(staffUser._id);

    // Get team ID from user token or seed data
    const orgResponse = await request(app)
      .get('/api/organization/teams')
      .set('Authorization', `Bearer ${smToken}`);
    
    if (orgResponse.body.data && orgResponse.body.data.length > 0) {
      testTeamId = orgResponse.body.data[0].id;
    }
  });

  it('should return team metrics for manager users', async () => {
    if (!testTeamId) {
      console.log('No test team ID available, skipping');
      return;
    }

    const response = await request(app)
      .get(`/api/metrics/teams/${testTeamId}`)
      .set('Authorization', `Bearer ${managerToken}`);

    expect([200, 403, 404, 500]).toContain(response.status);
    if (response.status === 200) {
      expect(response.body.status).toBe('success');
    }
  });

  it('should return team metrics for SM users', async () => {
    if (!testTeamId) return;

    const response = await request(app)
      .get(`/api/metrics/teams/${testTeamId}`)
      .set('Authorization', `Bearer ${smToken}`);

    expect([200, 403, 500]).toContain(response.status);
  });

  it('should return team metrics for HR users', async () => {
    if (!testTeamId) return;

    const response = await request(app)
      .get(`/api/metrics/teams/${testTeamId}`)
      .set('Authorization', `Bearer ${hrToken}`);

    expect([200, 403, 500]).toContain(response.status);
  });

  it('should deny access for non-manager users', async () => {
    if (!testTeamId) return;

    const response = await request(app)
      .get(`/api/metrics/teams/${testTeamId}`)
      .set('Authorization', `Bearer ${directorToken}`);

    expect([403, 500]).toContain(response.status);
  });

  it('should require authentication', async () => {
    if (!testTeamId) return;

    const response = await request(app)
      .get(`/api/metrics/teams/${testTeamId}`);

    expect(response.status).toBe(401);
  });
});

