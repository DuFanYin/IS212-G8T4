const request = require('supertest');
const { describe, it, expect, beforeEach } = require('@jest/globals');
const app = require('../../../src/app');
const { User } = require('../../../src/db/models');
const { generateToken } = require('../../../src/services/authService');

describe('POST /api/tasks/', () => {
  let staffToken;

  beforeEach(async () => {
    const staffUser = await User.findOne({ email: 'staff@example.com' });
    if (staffUser) staffToken = generateToken(staffUser._id);
  });

  it('should create a new task', async () => {
    const response = await request(app)
      .post('/api/tasks/')
      .set('Authorization', `Bearer ${staffToken}`)
      .send({
        title: 'Test Task',
        description: 'Test task description',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      });

    if (response.status !== 201) {
      // eslint-disable-next-line no-console
      console.log('Error creating task:', response.body);
    }
    expect(response.status).toBe(201);
    expect(response.body.status).toBe('success');
    expect(response.body.data).toHaveProperty('title', 'Test Task');
  });

  it('should require authentication', async () => {
    const response = await request(app)
      .post('/api/tasks/')
      .send({
        title: 'Test Task',
        description: 'Test task description',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      });

    expect(response.status).toBe(401);
  });
});


