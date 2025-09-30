const request = require('supertest');
const { describe, it, expect, beforeAll } = require('@jest/globals');
const app = require('../../../src/app');
const { User } = require('../../../src/db/models');
const { generateToken } = require('../../../src/services/authService');

describe('DELETE /api/subtasks/:id', () => {
  let authToken;
  let otherUserToken;
  let parentTaskID;
  let subtaskID;

  beforeAll(async () => {
    const managerUser = await User.findOne({ email: 'manager@example.com' });
    if (!managerUser) throw new Error('Seeded manager user not found');
    authToken = generateToken(managerUser._id);

    const otherUser = await User.findOne({ email: 'staff@example.com' });
    otherUserToken = generateToken(otherUser._id);

    // Create parent task
    const createTaskRes = await request(app)
      .post('/api/tasks/')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: `Subtasks Delete Parent ${Date.now()}`,
        description: 'temp',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        collaborators: [managerUser._id]
      });
    parentTaskID = createTaskRes.body.data.id;

    // Create subtask under that parent
    const createSubtaskRes = await request(app)
      .post(`/api/tasks/${parentTaskID}/subtasks`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Child D',
        description: 'desc',
        dueDate: new Date().toISOString(),
        status: 'unassigned',
        collaborators: [managerUser._id]
      });
    subtaskID = createSubtaskRes.body.data.id;
  });

  it('should soft delete a subtask', async () => {
    const response = await request(app)
      .delete(`/api/subtasks/${subtaskID}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.data.isDeleted).toBe(true);
  });

  it('should NOT delete subtask if user is not collaborator', async () => {
    const response = await request(app)
      .delete(`/api/subtasks/${subtaskID}`)
      .set('Authorization', `Bearer ${otherUserToken}`);

    expect(response.status).toBe(400);
    expect(response.body.status).toBe('error');
    expect(response.body.message).toMatch(/not authorized/i);
  });
});


