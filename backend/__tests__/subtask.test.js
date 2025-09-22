const request = require('supertest');
const { describe, it, expect, beforeAll } = require('@jest/globals');
const app = require('../src/app');
const { User } = require('../src/db/models');
const { generateToken } = require('../src/services/authService');
const { Subtask } = require('../src/db/models');

describe('Subtask Routes', () => {
  let authToken;
  let staffUser;
  let existingSubtask;

  beforeAll(async () => {
    // Grab a staff user from your seeded DB
    staffUser = await User.findOne({ email: 'manager@example.com' });
    if (!staffUser) throw new Error('Seeded staff user not found');

    authToken = generateToken(staffUser._id);

    // Grab a subtask
    existingSubtask = await Subtask.findOne({});
    if (!existingSubtask) throw new Error('No seeded subtask found');
  });

  it('should get subtasks by parent task', async () => {
    const parentTaskId = '68ccd63a98321c19c226b289';
    const response = await request(app)
      .get(`/api/tasks/${parentTaskId}/subtasks`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it('should get a single subtask by id', async () => {
    const response = await request(app)
      .get(`/api/subtasks/${existingSubtask._id}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.data).toEqual(
      expect.objectContaining({
        id: existingSubtask._id.toString(),
        title: expect.any(String)
      })
    );
  });


});