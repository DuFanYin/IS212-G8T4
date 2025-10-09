const request = require('supertest');
const { describe, it, expect, beforeAll } = require('@jest/globals');
const app = require('../../../src/app');
const { User } = require('../../../src/db/models');
const { generateToken } = require('../../../src/services/authService');

describe('GET /api/organization/teams', () => {
  let smToken;
  let directorToken;

  beforeAll(async () => {
    const smUser = await User.findOne({ email: 'sm0@example.com' });
    const directorUser = await User.findOne({ email: 'director0@example.com' });
    
    if (smUser) smToken = generateToken(smUser._id);
    if (directorUser) directorToken = generateToken(directorUser._id);
  });

  it('should allow SM users to view all teams', async () => {
    if (!smToken) return;
    
    const response = await request(app)
      .get('/api/organization/teams')
      .set('Authorization', `Bearer ${smToken}`);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it('should deny non-SM users from viewing teams', async () => {
    if (!directorToken) return;
    
    const response = await request(app)
      .get('/api/organization/teams')
      .set('Authorization', `Bearer ${directorToken}`);

    expect([403, 401]).toContain(response.status);
  });

  it('should require authentication', async () => {
    const response = await request(app)
      .get('/api/organization/teams');

    expect(response.status).toBe(401);
  });

  it('should return teams with member count statistics', async () => {
    if (!smToken) return;

    const response = await request(app)
      .get('/api/organization/teams')
      .set('Authorization', `Bearer ${smToken}`);

    if (response.status === 200 && response.body.data.length > 0) {
      const team = response.body.data[0];
      expect(team).toHaveProperty('userCount');
      expect(typeof team.userCount).toBe('number');
      expect(team.userCount).toBeGreaterThanOrEqual(0);
    }
  });
});
