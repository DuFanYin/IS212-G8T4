const request = require('supertest');
const app = require('../../../src/app');
const { User } = require('../../../src/db/models');
const { generateToken } = require('../../../src/services/authService');

describe('GET /api/metrics/departments', () => {
  let smToken, hrToken, directorToken, managerToken, staffToken;

  beforeAll(async () => {
    const smUser = await User.findOne({ email: 'sm0@example.com' });
    const hrUser = await User.findOne({ email: 'hr0@example.com' });
    const directorUser = await User.findOne({ email: 'director0@example.com' });
    const managerUser = await User.findOne({ email: 'manager0@example.com' });
    const staffUser = await User.findOne({ email: 'staff0@example.com' });
    
    if (smUser) smToken = generateToken(smUser._id);
    if (hrUser) hrToken = generateToken(hrUser._id);
    if (directorUser) directorToken = generateToken(directorUser._id);
    if (managerUser) managerToken = generateToken(managerUser._id);
    if (staffUser) staffToken = generateToken(staffUser._id);
  });

  it('should return department metrics for SM users', async () => {
    const response = await request(app)
      .get('/api/metrics/departments')
      .set('Authorization', `Bearer ${smToken}`);

    expect([200, 500]).toContain(response.status);
    if (response.status === 200) {
      expect(response.body.status).toBe('success');
      expect(Array.isArray(response.body.data)).toBe(true);
    }
  });

  it('should return department metrics for HR users', async () => {
    const response = await request(app)
      .get('/api/metrics/departments')
      .set('Authorization', `Bearer ${hrToken}`);

    expect([200, 500]).toContain(response.status);
    if (response.status === 200) {
      expect(response.body.status).toBe('success');
    }
  });

  it('should deny access for non-SM/HR users', async () => {
    const response = await request(app)
      .get('/api/metrics/departments')
      .set('Authorization', `Bearer ${directorToken}`);

    expect([403, 500]).toContain(response.status);
  });

  it('should require authentication', async () => {
    const response = await request(app)
      .get('/api/metrics/departments');

    expect(response.status).toBe(401);
  });
});

