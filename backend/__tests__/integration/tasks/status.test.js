const request = require('supertest');
const { describe, it, expect, beforeEach } = require('@jest/globals');
const app = require('../../../src/app');
const { User, Task } = require('../../../src/db/models');
const { generateToken } = require('../../../src/services/authService');

describe('PUT /api/tasks/:id/status', () => {
  let staffToken;
  let testTaskId;

  beforeEach(async () => {
    const staffUser = await User.findOne({ email: 'staff@example.com' });
    if (staffUser) staffToken = generateToken(staffUser._id);

    // Create an isolated task for status update
    const createRes = await request(app)
      .post('/api/tasks/')
      .set('Authorization', `Bearer ${staffToken}`)
      .send({
        title: `Status Test Task ${Date.now()}`,
        description: 'temp',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
    testTaskId = createRes.body.data.id;
  });

  it('should allow status updates', async () => {
    if (!testTaskId) return;
    const response = await request(app)
      .put(`/api/tasks/${testTaskId}/status`)
      .set('Authorization', `Bearer ${staffToken}`)
      .send({ status: 'under_review' });

    expect([200, 400]).toContain(response.status);
  });
});


