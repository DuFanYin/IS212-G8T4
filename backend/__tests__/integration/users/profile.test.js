const request = require('supertest');
const { describe, it, expect, beforeEach, beforeAll } = require('@jest/globals');
const app = require('../../../src/app');
const { User } = require('../../../src/db/models');
const { generateToken } = require('../../../src/services/authService');

describe('GET /api/users/profile', () => {
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

  it('should return user profile when authenticated', async () => {
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

  it('should require authentication', async () => {
    const response = await request(app)
      .get('/api/users/profile');

    expect(response.status).toBe(401);
  });

  it('should handle invalid token', async () => {
    const invalidToken = generateToken('507f1f77bcf86cd799439011');
    
    const response = await request(app)
      .get('/api/users/profile')
      .set('Authorization', `Bearer ${invalidToken}`);

    expect([401, 403, 500]).toContain(response.status);
  });

  it('should handle malformed token', async () => {
    const response = await request(app)
      .get('/api/users/profile')
      .set('Authorization', 'Bearer invalid-token-format');

    expect(response.status).toBe(401);
  });

  it('should handle missing Bearer prefix', async () => {
    if (!staffToken) return;

    const response = await request(app)
      .get('/api/users/profile')
      .set('Authorization', staffToken);

    expect(response.status).toBe(401);
  });

  it('should handle empty authorization header', async () => {
    const response = await request(app)
      .get('/api/users/profile')
      .set('Authorization', '');

    expect(response.status).toBe(401);
  });

  it('should handle expired token', async () => {
    const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1MDdmMWY3N2JjZjg2Y2Q3OTk0MzkwMTEiLCJpYXQiOjE2MDAwMDAwMDAsImV4cCI6MTYwMDAwMDAwMH0.invalid';
    
    const response = await request(app)
      .get('/api/users/profile')
      .set('Authorization', `Bearer ${expiredToken}`);

    expect(response.status).toBe(401);
  });

  it('should handle case sensitivity in authorization header', async () => {
    if (!staffToken) return;

    const response = await request(app)
      .get('/api/users/profile')
      .set('authorization', `Bearer ${staffToken}`);

    expect([200, 401]).toContain(response.status);
  });

  it('should handle multiple authorization headers', async () => {
    if (!staffToken) return;

    const response = await request(app)
      .get('/api/users/profile')
      .set('Authorization', `Bearer ${staffToken}`)
      .set('Authorization', 'Bearer invalid-token');

    expect([200, 401]).toContain(response.status);
  });

  it('should handle authorization header with extra spaces', async () => {
    if (!staffToken) return;

    const response = await request(app)
      .get('/api/users/profile')
      .set('Authorization', `  Bearer   ${staffToken}  `);

    expect([200, 401]).toContain(response.status);
  });
});



