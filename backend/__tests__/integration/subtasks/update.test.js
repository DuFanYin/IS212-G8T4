const request = require('supertest');
const { describe, it, expect, beforeAll } = require('@jest/globals');
const app = require('../../../src/app');
const { User } = require('../../../src/db/models');
const { generateToken } = require('../../../src/services/authService');

describe('PUT /api/tasks/subtasks/:id', () => {
  let authToken;
  let otherUserToken;
  let parentTaskID;
  let subtaskID;

  beforeAll(async () => {
    const managerUser = await User.findOne({ email: 'manager0@example.com' });
    if (!managerUser) throw new Error('Seeded manager user not found');
    authToken = generateToken(managerUser._id);

    const otherUser = await User.findOne({ email: 'staff0@example.com' });
    otherUserToken = generateToken(otherUser._id);

    const createTaskRes = await request(app)
      .post('/api/tasks/')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: `Subtasks Update Parent ${Date.now()}`,
        description: 'temp',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        collaborators: [managerUser._id]
      });
    parentTaskID = createTaskRes.body.data.id;

    const createSubtaskRes = await request(app)
      .post(`/api/tasks/${parentTaskID}/subtasks`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Child U',
        description: 'desc',
        dueDate: new Date().toISOString(),
        status: 'unassigned',
        collaborators: [managerUser._id]
      });
    subtaskID = createSubtaskRes.body.data.id;
  });

  it('should update a subtask', async () => {
    const response = await request(app)
      .put(`/api/tasks/subtasks/${subtaskID}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ title: 'Updated Title from Test' });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.data.title).toBe('Updated Title from Test');
  });

  it('should NOT update subtask if user is not collaborator', async () => {
    const response = await request(app)
      .put(`/api/tasks/subtasks/${subtaskID}`)
      .send({ title: 'Title' })
      .set('Authorization', `Bearer ${otherUserToken}`);

    expect(response.status).toBe(400);
    expect(response.body.status).toBe('error');
  });
});


