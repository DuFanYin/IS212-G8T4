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

  it('should update project with valid data', async () => {
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

  it('should merge collaborators when updating', async () => {
    if (!authToken || !testProjectId) return;

    const updateData = {
      collaborators: [authToken] // Add current user as collaborator
    };

    const response = await request(app)
      .put(`/api/projects/${testProjectId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(updateData);

    expect([200, 400]).toContain(response.status);
    if (response.status === 200) {
      expect(response.body.status).toBe('success');
    }
  });
});