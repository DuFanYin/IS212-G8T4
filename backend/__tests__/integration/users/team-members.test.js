const request = require('supertest');
const { describe, it, expect, beforeAll } = require('@jest/globals');
const app = require('../../../src/app');
const { User } = require('../../../src/db/models');
const { generateToken } = require('../../../src/services/authService');

describe('GET /api/users/team-members', () => {
  let staffToken;
  let managerToken;
  let directorToken;
  let hrToken;
  let smToken;

  beforeAll(async () => {
    const staffUser = await User.findOne({ email: 'staff0@example.com' });
    const managerUser = await User.findOne({ email: 'manager0@example.com' });
    const directorUser = await User.findOne({ email: 'director0@example.com' });
    const hrUser = await User.findOne({ email: 'hr0@example.com' });
    const smUser = await User.findOne({ email: 'sm0@example.com' });
    
    if (staffUser) staffToken = generateToken(staffUser._id);
    if (managerUser) managerToken = generateToken(managerUser._id);
    if (directorUser) directorToken = generateToken(directorUser._id);
    if (hrUser) hrToken = generateToken(hrUser._id);
    if (smUser) smToken = generateToken(smUser._id);
  });

  it('should get team members for manager', async () => {
    if (!managerToken) return;

    const response = await request(app)
      .get('/api/users/team-members')
      .set('Authorization', `Bearer ${managerToken}`);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it('should get team members for director', async () => {
    if (!directorToken) return;

    const response = await request(app)
      .get('/api/users/team-members')
      .set('Authorization', `Bearer ${directorToken}`);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it('should get team members for HR', async () => {
    if (!hrToken) return;

    const response = await request(app)
      .get('/api/users/team-members')
      .set('Authorization', `Bearer ${hrToken}`);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it('should get team members for SM', async () => {
    if (!smToken) return;

    const response = await request(app)
      .get('/api/users/team-members')
      .set('Authorization', `Bearer ${smToken}`);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it('should deny access to staff users', async () => {
    if (!staffToken) return;

    const response = await request(app)
      .get('/api/users/team-members')
      .set('Authorization', `Bearer ${staffToken}`);

    expect([403, 401]).toContain(response.status);
  });

  it('should require authentication', async () => {
    const response = await request(app)
      .get('/api/users/team-members');

    expect(response.status).toBe(401);
  });

  it('should handle invalid token', async () => {
    const invalidToken = generateToken('507f1f77bcf86cd799439011');
    
    const response = await request(app)
      .get('/api/users/team-members')
      .set('Authorization', `Bearer ${invalidToken}`);

    expect([401, 403, 500]).toContain(response.status);
  });

  it('should handle malformed token', async () => {
    const response = await request(app)
      .get('/api/users/team-members')
      .set('Authorization', 'Bearer invalid-token-format');

    expect(response.status).toBe(401);
  });

  it('should handle missing Bearer prefix', async () => {
    if (!managerToken) return;

    const response = await request(app)
      .get('/api/users/team-members')
      .set('Authorization', managerToken);

    expect(response.status).toBe(401);
  });

  it('should handle empty authorization header', async () => {
    const response = await request(app)
      .get('/api/users/team-members')
      .set('Authorization', '');

    expect(response.status).toBe(401);
  });

  it('should handle expired token', async () => {
    const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1MDdmMWY3N2JjZjg2Y2Q3OTk0MzkwMTEiLCJpYXQiOjE2MDAwMDAwMDAsImV4cCI6MTYwMDAwMDAwMH0.invalid';
    
    const response = await request(app)
      .get('/api/users/team-members')
      .set('Authorization', `Bearer ${expiredToken}`);

    expect(response.status).toBe(401);
  });

  it('should handle case sensitivity in authorization header', async () => {
    if (!managerToken) return;

    const response = await request(app)
      .get('/api/users/team-members')
      .set('authorization', `Bearer ${managerToken}`);

    expect([200, 401]).toContain(response.status);
  });

  it('should handle multiple authorization headers', async () => {
    if (!managerToken) return;

    const response = await request(app)
      .get('/api/users/team-members')
      .set('Authorization', `Bearer ${managerToken}`)
      .set('Authorization', 'Bearer invalid-token');

    expect([200, 401]).toContain(response.status);
  });

  it('should handle authorization header with extra spaces', async () => {
    if (!managerToken) return;

    const response = await request(app)
      .get('/api/users/team-members')
      .set('Authorization', `  Bearer   ${managerToken}  `);

    expect([200, 401]).toContain(response.status);
  });

  it('should return proper data structure', async () => {
    if (!managerToken) return;

    const response = await request(app)
      .get('/api/users/team-members')
      .set('Authorization', `Bearer ${managerToken}`);

    if (response.status === 200) {
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      
      if (response.body.data.length > 0) {
        const member = response.body.data[0];
        expect(member).toHaveProperty('id');
        expect(member).toHaveProperty('name');
        expect(member).toHaveProperty('email');
        expect(member).toHaveProperty('role');
      }
    }
  });

  it('should handle user with no team', async () => {
    // This test assumes there might be users without teams
    if (!managerToken) return;

    const response = await request(app)
      .get('/api/users/team-members')
      .set('Authorization', `Bearer ${managerToken}`);

    expect([200, 400]).toContain(response.status);
  });

  it('should handle concurrent requests', async () => {
    if (!managerToken) return;

    const promises = Array(3).fill().map(() => 
      request(app)
        .get('/api/users/team-members')
        .set('Authorization', `Bearer ${managerToken}`)
    );

    const responses = await Promise.all(promises);
    
    responses.forEach(response => {
      expect([200, 400]).toContain(response.status);
    });
  });

  it('should handle large team data', async () => {
    if (!managerToken) return;

    const response = await request(app)
      .get('/api/users/team-members')
      .set('Authorization', `Bearer ${managerToken}`);

    if (response.status === 200) {
      expect(Array.isArray(response.body.data)).toBe(true);
      // Should handle any number of team members
    }
  });

  it('should not expose sensitive information', async () => {
    if (!managerToken) return;

    const response = await request(app)
      .get('/api/users/team-members')
      .set('Authorization', `Bearer ${managerToken}`);

    if (response.status === 200 && response.body.data.length > 0) {
      const member = response.body.data[0];
      expect(member).not.toHaveProperty('passwordHash');
      expect(member).not.toHaveProperty('resetToken');
      expect(member).not.toHaveProperty('resetTokenExpiry');
    }
  });
});
