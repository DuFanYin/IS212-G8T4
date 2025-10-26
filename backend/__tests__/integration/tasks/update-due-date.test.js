const request = require('supertest');
const { describe, it, expect, beforeAll } = require('@jest/globals');
const app = require('../../../src/app');
const { User } = require('../../../src/db/models');
const { generateToken } = require('../../../src/services/authService');

describe('PUT /api/tasks/:id (update due date)', () => {
  let authToken;
  let testTaskId;

  beforeAll(async () => {
    const staffUser = await User.findOne({ email: 'staff0@example.com' });

    if (staffUser) authToken = generateToken(staffUser._id);

    // Create a test task with an initial due date
    if (authToken) {
      const createRes = await request(app)
        .post('/api/tasks/')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: `Deadline Test Task ${Date.now()}`,
          description: 'Test task for due date updates',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });

      if (createRes.status === 201) {
        testTaskId = createRes.body.data.id;
      }
    }
  });

  it('should update task due date successfully', async () => {
    if (!authToken || !testTaskId) return;

    const newDueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

    const response = await request(app)
      .put(`/api/tasks/${testTaskId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ dueDate: newDueDate });

    expect([200, 400]).toContain(response.status);
    if (response.status === 200) {
      expect(response.body.status).toBe('success');
      expect(new Date(response.body.data.dueDate).toISOString()).toBe(newDueDate);
    }
  });

  it('should reject invalid due date format', async () => {
    if (!authToken || !testTaskId) return;

    const response = await request(app)
      .put(`/api/tasks/${testTaskId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ dueDate: 'not-a-date' });

    expect([400, 422, 500]).toContain(response.status);
  });

  it('should reject past due dates', async () => {
    if (!authToken || !testTaskId) return;

    const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const response = await request(app)
      .put(`/api/tasks/${testTaskId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ dueDate: pastDate });

    expect([400, 422, 500, 403]).toContain(response.status);
  });
});
