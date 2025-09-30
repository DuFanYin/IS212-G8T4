const request = require('supertest');
const { describe, it, expect, beforeAll } = require('@jest/globals');
const app = require('../../../src/app');
const { User } = require('../../../src/db/models');
const { generateToken } = require('../../../src/services/authService');

describe('POST /api/tasks/:taskId/subtasks', () => {
  let authToken;
  let parentTaskID;

  beforeAll(async () => {
    const managerUser = await User.findOne({ email: 'manager@example.com' });
    if (!managerUser) throw new Error('Seeded manager user not found');
    authToken = generateToken(managerUser._id);

    const createTaskRes = await request(app)
      .post('/api/tasks/')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: `Subtasks Create Parent ${Date.now()}`,
        description: 'temp',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        collaborators: [managerUser._id]
      });
    parentTaskID = createTaskRes.body.data.id;
  });

  it('should create a subtask under a parent task', async () => {
    const newSubtask = {
      title: 'New Subtask',
      description: 'Test subtask creation',
      dueDate: new Date().toISOString(),
      status: 'unassigned',
      collaborators: [],
    };

    const response = await request(app)
      .post(`/api/tasks/${parentTaskID}/subtasks`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(newSubtask);

    expect(response.status).toBe(201);
    expect(response.body.status).toBe('success');
    expect(response.body.data).toEqual(
      expect.objectContaining({
        title: newSubtask.title,
        description: newSubtask.description,
      })
    );
  });

  it('should NOT create subtask under a parent task if invalid data', async () => {
    const response = await request(app)
      .post(`/api/tasks/${parentTaskID}/subtasks`)
      .send({}) // Missing fields
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(400);
    expect(response.body.status).toBe('error');
  });
});


