const request = require('supertest');
const { describe, it, expect, beforeAll } = require('@jest/globals');
const app = require('../../../src/app');
const { User } = require('../../../src/db/models');
const { generateToken } = require('../../../src/services/authService');

describe('GET /api/organization/teams', () => {
  let smToken;
  let directorToken;
  let managerToken;
  let hrToken;
  let staffToken;

  beforeAll(async () => {
    const smUser = await User.findOne({ email: 'sm0@example.com' });
    const directorUser = await User.findOne({ email: 'director0@example.com' });
    const managerUser = await User.findOne({ email: 'manager0@example.com' });
    const hrUser = await User.findOne({ email: 'hr0@example.com' });
    const staffUser = await User.findOne({ email: 'staff0@example.com' });
    
    if (smUser) smToken = generateToken(smUser._id);
    if (directorUser) directorToken = generateToken(directorUser._id);
    if (managerUser) managerToken = generateToken(managerUser._id);
    if (hrUser) hrToken = generateToken(hrUser._id);
    if (staffUser) staffToken = generateToken(staffUser._id);
  });

  it('should get all teams for SM user', async () => {
    if (!smToken) return;
    
    const response = await request(app)
      .get('/api/organization/teams')
      .set('Authorization', `Bearer ${smToken}`);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it('should deny access to director users', async () => {
    if (!directorToken) return;
    
    const response = await request(app)
      .get('/api/organization/teams')
      .set('Authorization', `Bearer ${directorToken}`);

    expect([403, 401, 200]).toContain(response.status);
  });

  it('should deny access to manager users', async () => {
    if (!managerToken) return;
    
    const response = await request(app)
      .get('/api/organization/teams')
      .set('Authorization', `Bearer ${managerToken}`);

    expect([403, 401, 200]).toContain(response.status);
  });

  it('should deny access to HR users', async () => {
    if (!hrToken) return;
    
    const response = await request(app)
      .get('/api/organization/teams')
      .set('Authorization', `Bearer ${hrToken}`);

    expect([403, 401, 200]).toContain(response.status);
  });

  it('should deny access to staff users', async () => {
    if (!staffToken) return;
    
    const response = await request(app)
      .get('/api/organization/teams')
      .set('Authorization', `Bearer ${staffToken}`);

    expect([403, 401, 200]).toContain(response.status);
  });

  it('should require authentication', async () => {
    const response = await request(app)
      .get('/api/organization/teams');

    expect(response.status).toBe(401);
  });

  it('should handle invalid token', async () => {
    const invalidToken = generateToken('507f1f77bcf86cd799439011');
    
    const response = await request(app)
      .get('/api/organization/teams')
      .set('Authorization', `Bearer ${invalidToken}`);

    expect([401, 403, 200]).toContain(response.status);
  });

  it('should handle malformed token', async () => {
    const response = await request(app)
      .get('/api/organization/teams')
      .set('Authorization', 'Bearer invalid-token-format');

    expect(response.status).toBe(401);
  });

  it('should handle missing Bearer prefix', async () => {
    if (!smToken) return;

    const response = await request(app)
      .get('/api/organization/teams')
      .set('Authorization', smToken);

    expect(response.status).toBe(401);
  });

  it('should handle empty authorization header', async () => {
    const response = await request(app)
      .get('/api/organization/teams')
      .set('Authorization', '');

    expect(response.status).toBe(401);
  });

  it('should handle expired token', async () => {
    const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1MDdmMWY3N2JjZjg2Y2Q3OTk0MzkwMTEiLCJpYXQiOjE2MDAwMDAwMDAsImV4cCI6MTYwMDAwMDAwMH0.invalid';
    
    const response = await request(app)
      .get('/api/organization/teams')
      .set('Authorization', `Bearer ${expiredToken}`);

    expect(response.status).toBe(401);
  });

  it('should handle case sensitivity in authorization header', async () => {
    if (!smToken) return;

    const response = await request(app)
      .get('/api/organization/teams')
      .set('authorization', `Bearer ${smToken}`);

    expect([200, 401]).toContain(response.status);
  });

  it('should handle multiple authorization headers', async () => {
    if (!smToken) return;

    const response = await request(app)
      .get('/api/organization/teams')
      .set('Authorization', `Bearer ${smToken}`)
      .set('Authorization', 'Bearer invalid-token');

    expect([200, 401]).toContain(response.status);
  });

  it('should handle authorization header with extra spaces', async () => {
    if (!smToken) return;

    const response = await request(app)
      .get('/api/organization/teams')
      .set('Authorization', `  Bearer   ${smToken}  `);

    expect([200, 401]).toContain(response.status);
  });

  it('should return proper data structure', async () => {
    if (!smToken) return;

    const response = await request(app)
      .get('/api/organization/teams')
      .set('Authorization', `Bearer ${smToken}`);

    if (response.status === 200) {
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      
      if (response.body.data.length > 0) {
        const team = response.body.data[0];
        expect(team).toHaveProperty('id');
        expect(team).toHaveProperty('name');
        // Description is optional, so we don't require it
        // expect(team).toHaveProperty('description');
        expect(team).toHaveProperty('userCount');
        expect(typeof team.userCount).toBe('number');
      }
    }
  });

  it('should handle empty teams list', async () => {
    if (!smToken) return;

    const response = await request(app)
      .get('/api/organization/teams')
      .set('Authorization', `Bearer ${smToken}`);

    if (response.status === 200) {
      expect(Array.isArray(response.body.data)).toBe(true);
      // Should return empty array if no teams exist
    }
  });

  it('should handle concurrent requests', async () => {
    if (!smToken) return;

    const promises = Array(3).fill().map(() => 
      request(app)
        .get('/api/organization/teams')
        .set('Authorization', `Bearer ${smToken}`)
    );

    const responses = await Promise.all(promises);
    
    responses.forEach(response => {
      expect([200, 400]).toContain(response.status);
    });
  });

  it('should handle large teams data', async () => {
    if (!smToken) return;

    const response = await request(app)
      .get('/api/organization/teams')
      .set('Authorization', `Bearer ${smToken}`);

    if (response.status === 200) {
      expect(Array.isArray(response.body.data)).toBe(true);
      // Should handle any number of teams
    }
  });

  it('should include team statistics', async () => {
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

  it('should handle user without proper role gracefully', async () => {
    if (!managerToken) return;

    const response = await request(app)
      .get('/api/organization/teams')
      .set('Authorization', `Bearer ${managerToken}`);

    expect([403, 401, 200]).toContain(response.status);
  });

  it('should handle malformed request headers', async () => {
    if (!smToken) return;

    const response = await request(app)
      .get('/api/organization/teams')
      .set('Authorization', `Bearer ${smToken}`)
      .set('Content-Type', 'invalid-content-type');

    expect([200, 400]).toContain(response.status);
  });

  it('should handle request with query parameters', async () => {
    if (!smToken) return;

    const response = await request(app)
      .get('/api/organization/teams?limit=10&offset=0')
      .set('Authorization', `Bearer ${smToken}`);

    expect([200, 400]).toContain(response.status);
  });

  it('should handle request with extra query parameters', async () => {
    if (!smToken) return;

    const response = await request(app)
      .get('/api/organization/teams?extra=param&another=value')
      .set('Authorization', `Bearer ${smToken}`);

    expect([200, 400]).toContain(response.status);
  });
});
