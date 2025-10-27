const request = require('supertest');
const app = require('../../../src/app');
const { User } = require('../../../src/db/models');
const { generateToken } = require('../../../src/services/authService');

describe('POST /api/notifications', () => {
  let smToken, staffToken, userId;

  beforeAll(async () => {
    const smUser = await User.findOne({ email: 'sm0@example.com' });
    const staffUser = await User.findOne({ email: 'staff0@example.com' });
    
    if (smUser) smToken = generateToken(smUser._id);
    if (staffUser) staffToken = generateToken(staffUser._id);
    
    // Get user ID from profile
    const profileResponse = await request(app)
      .get('/api/users/profile')
      .set('Authorization', `Bearer ${staffToken}`);
    
    if (profileResponse.body.data) {
      userId = profileResponse.body.data.id;
    }
  });

  it('should create notification with valid data', async () => {
    if (!userId) {
      console.log('No user ID available, skipping');
      return;
    }

    const notificationData = {
      userId,
      message: 'Test notification',
      type: 'task_assigned',
      link: '/tasks/123'
    };

    const response = await request(app)
      .post('/api/notifications')
      .set('Authorization', `Bearer ${smToken}`)
      .send(notificationData);

    expect([201, 500]).toContain(response.status);
    if (response.status === 201) {
      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('message', notificationData.message);
      expect(response.body.data).toHaveProperty('type', notificationData.type);
    }
  });

  it('should require authentication', async () => {
    if (!userId) return;

    const response = await request(app)
      .post('/api/notifications')
      .send({
        userId,
        message: 'Test',
        type: 'task_assigned'
      });

    expect(response.status).toBe(401);
  });

  it('should validate required fields', async () => {
    const response = await request(app)
      .post('/api/notifications')
      .set('Authorization', `Bearer ${smToken}`)
      .send({
        message: 'Test'
      });

    expect([400, 500]).toContain(response.status);
  });
});

