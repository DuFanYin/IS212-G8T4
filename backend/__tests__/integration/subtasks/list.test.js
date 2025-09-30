const request = require('supertest');
const { describe, it, expect, beforeAll } = require('@jest/globals');
const app = require('../../../src/app');
const { User } = require('../../../src/db/models');
const { generateToken } = require('../../../src/services/authService');

describe('GET /api/tasks/:taskId/subtasks', () => {
  let authToken;
  let otherUserToken;
  let parentTaskID;

  beforeAll(async () => {
    const managerUser = await User.findOne({ email: 'manager0@example.com' });
    if (!managerUser) throw new Error('Seeded manager user not found');
    authToken = generateToken(managerUser._id);

    const otherUser = await User.findOne({ email: 'staff0@example.com' });
    otherUserToken = generateToken(otherUser._id);

    // Create isolated parent task for this suite
    const createTaskRes = await request(app)
      .post('/api/tasks/')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: `Subtasks List Parent ${Date.now()}`,
        description: 'temp',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        collaborators: [managerUser._id]
      });
    parentTaskID = createTaskRes.body.data.id;

    // Ensure at least one subtask exists under this parent
    await request(app)
      .post(`/api/tasks/${parentTaskID}/subtasks`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Child 1',
        description: 'desc',
        dueDate: new Date().toISOString(),
        status: 'unassigned',
        collaborators: [managerUser._id]
      });
  });

  it('should get subtasks by parent task', async () => {
    const response = await request(app)
      .get(`/api/tasks/${parentTaskID}/subtasks`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(Array.isArray(response.body.data)).toBe(true);
  });
});


