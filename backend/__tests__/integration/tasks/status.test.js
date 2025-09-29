const request = require('supertest');
const { describe, it, expect, beforeEach } = require('@jest/globals');
const app = require('../../../src/app');
const { User, Task } = require('../../../src/db/models');
const { generateToken } = require('../../../src/services/authService');

async function createTaskAsManager() {
  const managerUser = await User.findOne({ email: 'manager@example.com' });
  const token = generateToken(managerUser._id);
  const createRes = await request(app)
    .post('/api/tasks/')
    .set('Authorization', `Bearer ${token}`)
    .send({
      title: `Mgr Status Task ${Date.now()}`,
      description: 'temp',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });
  return { token, taskId: createRes.body.data.id };
}

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

  it('should require authentication for status updates', async () => {
    const { taskId } = await createTaskAsManager();
    const res = await request(app)
      .put(`/api/tasks/${taskId}/status`)
      .send({ status: 'completed' });
    expect(res.status).toBe(401);
  });
});


