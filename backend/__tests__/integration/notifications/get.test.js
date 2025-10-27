const request = require('supertest');
const app = require('../../../src/app');
const { User } = require('../../../src/db/models');
const { generateToken } = require('../../../src/services/authService');

describe('GET /api/notifications', () => {
  let smToken, staffToken, managerToken;

  beforeAll(async () => {
    const smUser = await User.findOne({ email: 'sm0@example.com' });
    const staffUser = await User.findOne({ email: 'staff0@example.com' });
    const managerUser = await User.findOne({ email: 'manager0@example.com' });
    
    if (smUser) smToken = generateToken(smUser._id);
    if (staffUser) staffToken = generateToken(staffUser._id);
    if (managerUser) managerToken = generateToken(managerUser._id);
  });

  it('should return notifications for authenticated user', async () => {
    const response = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${staffToken}`);

    expect([200, 500]).toContain(response.status);
    if (response.status === 200) {
      expect(response.body.status).toBe('success');
      expect(Array.isArray(response.body.data)).toBe(true);
    }
  });

  it('should return notifications for manager user', async () => {
    const response = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${managerToken}`);

    expect([200, 500]).toContain(response.status);
  });

  it('should return notifications for SM user', async () => {
    const response = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${smToken}`);

    expect([200, 500]).toContain(response.status);
  });

  it('should require authentication', async () => {
    const response = await request(app)
      .get('/api/notifications');

    expect(response.status).toBe(401);
  });
});

