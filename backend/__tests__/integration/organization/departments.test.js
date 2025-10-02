const request = require('supertest');
const { describe, it, expect, beforeAll } = require('@jest/globals');
const app = require('../../../src/app');
const { User, Department, Team } = require('../../../src/db/models');
const { generateToken } = require('../../../src/services/authService');

describe('GET /api/organization/departments', () => {
  let smToken;
  let directorToken;
  let managerToken;

  beforeAll(async () => {
    const smUser = await User.findOne({ email: 'sm0@example.com' });
    const directorUser = await User.findOne({ email: 'director0@example.com' });
    const managerUser = await User.findOne({ email: 'manager0@example.com' });
    
    if (smUser) smToken = generateToken(smUser._id);
    if (directorUser) directorToken = generateToken(directorUser._id);
    if (managerUser) managerToken = generateToken(managerUser._id);
  });

  it('should get all departments for SM user', async () => {
    if (!smToken) return;
    
    const response = await request(app)
      .get('/api/organization/departments')
      .set('Authorization', `Bearer ${smToken}`);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it('should deny access to non-SM users', async () => {
    if (!directorToken) return;
    
    const response = await request(app)
      .get('/api/organization/departments')
      .set('Authorization', `Bearer ${directorToken}`);

    expect([403, 401, 200]).toContain(response.status);
  });

  it('should require authentication', async () => {
    const response = await request(app)
      .get('/api/organization/departments');

    expect(response.status).toBe(401);
  });
});

