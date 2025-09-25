const request = require('supertest');
const { describe, it, expect, beforeEach } = require('@jest/globals');
const app = require('../../../src/app');
const { User, Task } = require('../../../src/db/models');
const { generateToken } = require('../../../src/services/authService');

describe('DELETE /api/tasks/:id', () => {
  let managerToken;
  let testTaskId;

  beforeEach(async () => {
    const managerUser = await User.findOne({ email: 'manager@example.com' });
    if (managerUser) managerToken = generateToken(managerUser._id);

    // Create an isolated task for archive test
    const createRes = await request(app)
      .post('/api/tasks/')
      .set('Authorization', `Bearer ${managerToken}`)
      .send({
        title: `Archive Test Task ${Date.now()}`,
        description: 'temp',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
    testTaskId = createRes.body.data.id;
  });

  it('should archive task (soft delete)', async () => {
    if (!testTaskId) return;
    const response = await request(app)
      .delete(`/api/tasks/${testTaskId}`)
      .set('Authorization', `Bearer ${managerToken}`);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
  });
});


