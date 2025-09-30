const request = require('supertest');
const { describe, it, expect, beforeEach } = require('@jest/globals');
const app = require('../../../src/app');
const { User } = require('../../../src/db/models');
const { generateToken } = require('../../../src/services/authService');

describe('GET /api/tasks/:id', () => {
  let staffToken;

  beforeEach(async () => {
    const staffUser = await User.findOne({ email: 'staff0@example.com' });
    if (staffUser) staffToken = generateToken(staffUser._id);
  });

  it('should return task by ID if user has access', async () => {
    const staffUser = await User.findOne({ email: 'staff0@example.com' });
    const createResponse = await request(app)
      .post('/api/tasks/')
      .set('Authorization', `Bearer ${staffToken}`)
      .send({
        title: 'Test Access Task',
        description: 'Test task for access verification',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        assigneeId: staffUser._id
      });

    if (createResponse.status !== 201) {
      // eslint-disable-next-line no-console
      console.log('Failed to create test task:', createResponse.body);
      return;
    }

    const taskId = createResponse.body.data.id;
    const response = await request(app)
      .get(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${staffToken}`);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.data).toHaveProperty('title', 'Test Access Task');
  });
});


