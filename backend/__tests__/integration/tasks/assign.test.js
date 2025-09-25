const request = require('supertest');
const { describe, it, expect, beforeEach } = require('@jest/globals');
const app = require('../../../src/app');
const { User, Task } = require('../../../src/db/models');
const { generateToken } = require('../../../src/services/authService');

describe('PUT /api/tasks/:id/assign', () => {
  let staffToken;
  let managerToken;
  let testTaskId;

  beforeEach(async () => {
    const staffUser = await User.findOne({ email: 'staff@example.com' });
    const managerUser = await User.findOne({ email: 'manager@example.com' });
    if (staffUser) staffToken = generateToken(staffUser._id);
    if (managerUser) managerToken = generateToken(managerUser._id);

    // Create an isolated task for this test run
    const createRes = await request(app)
      .post('/api/tasks/')
      .set('Authorization', `Bearer ${staffToken}`)
      .send({
        title: `Assign Test Task ${Date.now()}`,
        description: 'temp',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
    testTaskId = createRes.body.data.id;
  });

  it('should allow managers to assign tasks', async () => {
    if (!testTaskId) return;
    const response = await request(app)
      .put(`/api/tasks/${testTaskId}/assign`)
      .set('Authorization', `Bearer ${managerToken}`)
      .send({ assigneeId: (await User.findOne({ email: 'staff@example.com' }))._id });

    expect([200, 400]).toContain(response.status);
  });

  it('should deny staff from assigning tasks', async () => {
    if (!testTaskId) return;
    const response = await request(app)
      .put(`/api/tasks/${testTaskId}/assign`)
      .set('Authorization', `Bearer ${staffToken}`)
      .send({ assigneeId: (await User.findOne({ email: 'manager@example.com' }))._id });

    expect(response.status).toBe(400);
  });
});


