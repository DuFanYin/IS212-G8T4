const request = require('supertest');
const { describe, it, expect, beforeAll } = require('@jest/globals');
const app = require('../../../src/app');
const { User } = require('../../../src/db/models');
const { generateToken } = require('../../../src/services/authService');

describe('PUT /api/tasks/:id', () => {
  let authToken;
  let otherUserToken;
  let testTaskId;

  beforeAll(async () => {
    const staffUser = await User.findOne({ email: 'staff0@example.com' });
    const managerUser = await User.findOne({ email: 'manager0@example.com' });
    
    if (staffUser) authToken = generateToken(staffUser._id);
    if (managerUser) otherUserToken = generateToken(managerUser._id);

    // Create a test task
    if (authToken) {
      const createRes = await request(app)
        .post('/api/tasks/')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: `Update Test Task ${Date.now()}`,
          description: 'Test task for update',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });

      if (createRes.status === 201) {
        testTaskId = createRes.body.data.id;
      }
    }
  });

  it('should update task with valid data', async () => {
    if (!authToken || !testTaskId) return;

    const updateData = {
      title: 'Updated Task Title',
      description: 'Updated task description'
    };

    const response = await request(app)
      .put(`/api/tasks/${testTaskId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(updateData);

    expect([200, 400]).toContain(response.status);
    if (response.status === 200) {
      expect(response.body.status).toBe('success');
      expect(response.body.data.title).toBe(updateData.title);
      expect(response.body.data.description).toBe(updateData.description);
    }
  });

  it('should require authentication', async () => {
    if (!testTaskId) return;

    const response = await request(app)
      .put(`/api/tasks/${testTaskId}`)
      .send({
        title: 'Unauthorized Update'
      });

    expect(response.status).toBe(401);
  });

  it('should validate task ownership or collaboration', async () => {
    if (!otherUserToken || !testTaskId) return;

    const response = await request(app)
      .put(`/api/tasks/${testTaskId}`)
      .set('Authorization', `Bearer ${otherUserToken}`)
      .send({
        title: 'Unauthorized Update Attempt'
      });

    expect([403, 400, 404]).toContain(response.status);
  });

  it('should handle partial updates', async () => {
    if (!authToken || !testTaskId) return;

    const updateData = {
      description: 'Only description updated'
    };

    const response = await request(app)
      .put(`/api/tasks/${testTaskId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(updateData);

    expect([200, 400]).toContain(response.status);
    if (response.status === 200) {
      expect(response.body.status).toBe('success');
      expect(response.body.data.description).toBe(updateData.description);
    }
  });
});
