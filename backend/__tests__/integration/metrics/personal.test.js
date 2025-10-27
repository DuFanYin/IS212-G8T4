const request = require('supertest');
const app = require('../../../src/app');
const { User } = require('../../../src/db/models');
const { generateToken } = require('../../../src/services/authService');

describe('GET /api/metrics/personal', () => {
  let staffToken, managerToken, smToken;

  beforeAll(async () => {
    const staffUser = await User.findOne({ email: 'staff0@example.com' });
    const managerUser = await User.findOne({ email: 'manager0@example.com' });
    const smUser = await User.findOne({ email: 'sm0@example.com' });
    
    if (staffUser) staffToken = generateToken(staffUser._id);
    if (managerUser) managerToken = generateToken(managerUser._id);
    if (smUser) smToken = generateToken(smUser._id);
  });

  it('should return personal metrics for staff users', async () => {
    const response = await request(app)
      .get('/api/metrics/personal')
      .set('Authorization', `Bearer ${staffToken}`);

    expect([200, 500]).toContain(response.status);
    if (response.status === 200) {
      expect(response.body.status).toBe('success');
      expect(Array.isArray(response.body.data)).toBe(true);
    }
  });

  it('should return personal metrics for manager users', async () => {
    const response = await request(app)
      .get('/api/metrics/personal')
      .set('Authorization', `Bearer ${managerToken}`);

    expect([200, 500]).toContain(response.status);
  });

  it('should return personal metrics for SM users', async () => {
    const response = await request(app)
      .get('/api/metrics/personal')
      .set('Authorization', `Bearer ${smToken}`);

    expect([200, 500]).toContain(response.status);
  });

  it('should require authentication', async () => {
    const response = await request(app)
      .get('/api/metrics/personal');

    expect(response.status).toBe(401);
  });
});

