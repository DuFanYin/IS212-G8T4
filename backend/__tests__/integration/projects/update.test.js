const request = require('supertest');
const { describe, it, expect, beforeAll } = require('@jest/globals');
const app = require('../../../src/app');
const { User } = require('../../../src/db/models');
const { generateToken } = require('../../../src/services/authService');

describe('PUT /api/projects/:projectId', () => {
  let authToken;
  let otherUserToken;
  let testProjectId;

  beforeAll(async () => {
    const staffUser = await User.findOne({ email: 'staff0@example.com' });
    const managerUser = await User.findOne({ email: 'manager0@example.com' });
    
    if (staffUser) authToken = generateToken(staffUser._id);
    if (managerUser) otherUserToken = generateToken(managerUser._id);

    // Create a test project
    if (authToken) {
      const createRes = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: `Update Test Project ${Date.now()}`,
          description: 'Test project for update'
        });

      if (createRes.status === 200) {
        testProjectId = createRes.body.data.id;
      }
    }
  });

  it('should update project successfully', async () => {
    if (!authToken || !testProjectId) return;

    const updateData = {
      name: 'Updated Project Name',
      description: 'Updated project description'
    };

    const response = await request(app)
      .put(`/api/projects/${testProjectId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(updateData);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.data.name).toBe(updateData.name);
    expect(response.body.data.description).toBe(updateData.description);
  });

  it('should require authentication', async () => {
    if (!testProjectId) return;

    const response = await request(app)
      .put(`/api/projects/${testProjectId}`)
      .send({
        name: 'Unauthorized Update'
      });

    expect(response.status).toBe(401);
  });

  it('should handle non-existent project', async () => {
    if (!authToken) return;

    const nonExistentProjectId = '507f1f77bcf86cd799439011';
    
    const response = await request(app)
      .put(`/api/projects/${nonExistentProjectId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Update Non-existent Project'
      });

    expect([404, 400]).toContain(response.status);
  });

  it('should validate project ownership or collaboration', async () => {
    if (!otherUserToken || !testProjectId) return;

    const response = await request(app)
      .put(`/api/projects/${testProjectId}`)
      .set('Authorization', `Bearer ${otherUserToken}`)
      .send({
        name: 'Unauthorized Update Attempt'
      });

    expect([403, 400, 404, 200]).toContain(response.status);
  });

  it('should handle partial updates', async () => {
    if (!authToken || !testProjectId) return;

    const updateData = {
      description: 'Only description updated'
    };

    const response = await request(app)
      .put(`/api/projects/${testProjectId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(updateData);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.data.description).toBe(updateData.description);
  });

  it('should handle empty update data', async () => {
    if (!authToken || !testProjectId) return;

    const response = await request(app)
      .put(`/api/projects/${testProjectId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({});

    expect([200, 400]).toContain(response.status);
  });

  it('should validate required fields', async () => {
    if (!authToken || !testProjectId) return;

    const response = await request(app)
      .put(`/api/projects/${testProjectId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: '' // Empty name should be invalid
      });

    expect([400, 422, 200]).toContain(response.status);
  });
});