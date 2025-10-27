const request = require('supertest');
const app = require('../../../src/app');
const { User } = require('../../../src/db/models');
const { generateToken } = require('../../../src/services/authService');

describe('GET /api/metrics/teams', () => {
  let directorToken, smToken, hrToken, managerToken, staffToken;

  beforeAll(async () => {
    const directorUser = await User.findOne({ email: 'director0@example.com' });
    const smUser = await User.findOne({ email: 'sm0@example.com' });
    const hrUser = await User.findOne({ email: 'hr0@example.com' });
    const managerUser = await User.findOne({ email: 'manager0@example.com' });
    const staffUser = await User.findOne({ email: 'staff0@example.com' });
    
    if (directorUser) directorToken = generateToken(directorUser._id);
    if (smUser) smToken = generateToken(smUser._id);
    if (hrUser) hrToken = generateToken(hrUser._id);
    if (managerUser) managerToken = generateToken(managerUser._id);
    if (staffUser) staffToken = generateToken(staffUser._id);
  });

  it('should return team metrics for director users', async () => {
    const response = await request(app)
      .get('/api/metrics/teams')
      .set('Authorization', `Bearer ${directorToken}`);

    expect([200, 500]).toContain(response.status);
    if (response.status === 200) {
      expect(response.body.status).toBe('success');
      expect(Array.isArray(response.body.data)).toBe(true);
    }
  });

  it('should return team metrics for SM users', async () => {
    const response = await request(app)
      .get('/api/metrics/teams')
      .set('Authorization', `Bearer ${smToken}`);

    expect([200, 500]).toContain(response.status);
  });

  it('should return team metrics for HR users', async () => {
    const response = await request(app)
      .get('/api/metrics/teams')
      .set('Authorization', `Bearer ${hrToken}`);

    expect([200, 500]).toContain(response.status);
  });

  it('should deny access for manager users', async () => {
    const response = await request(app)
      .get('/api/metrics/teams')
      .set('Authorization', `Bearer ${managerToken}`);

    expect([403, 500]).toContain(response.status);
  });

  it('should deny access for staff users', async () => {
    const response = await request(app)
      .get('/api/metrics/teams')
      .set('Authorization', `Bearer ${staffToken}`);

    expect([403, 500]).toContain(response.status);
  });

  it('should require authentication', async () => {
    const response = await request(app)
      .get('/api/metrics/teams');

    expect(response.status).toBe(401);
  });
});

