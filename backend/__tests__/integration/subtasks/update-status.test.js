const request = require('supertest');
const { describe, it, expect, beforeAll } = require('@jest/globals');
const app = require('../../../src/app');
const { User } = require('../../../src/db/models');
const { generateToken } = require('../../../src/services/authService');

describe('PATCH /api/tasks/subtasks/:id/status', () => {
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
        title: `Subtasks Status Parent ${Date.now()}`,
        description: 'temp',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        collaborators: [managerUser._id]
      });
    parentTaskID = createTaskRes.body.data.id;

    const createSubtaskRes = await request(app)
      .post(`/api/tasks/${parentTaskID}/subtasks`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Child S',
        description: 'desc',
        dueDate: new Date().toISOString(),
        status: 'unassigned',
        collaborators: [managerUser._id]
      });
    subtaskID = createSubtaskRes.body.data.id;
  });

  it('should update a subtask status', async () => {
    const response = await request(app)
      .patch(`/api/tasks/subtasks/${subtaskID}/status`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ status: 'ongoing' });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.data.status).toBe('ongoing');
  });

  it('should NOT update subtask status if user is not collaborator', async () => {
    const response = await request(app)
      .patch(`/api/tasks/subtasks/${subtaskID}/status`)
      .set('Authorization', `Bearer ${otherUserToken}`)
      .send({ status: 'complete' });

    expect(response.status).toBe(400);
    expect(response.body.status).toBe('error');
  });
});


