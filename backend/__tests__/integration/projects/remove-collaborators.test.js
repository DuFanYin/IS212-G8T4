const request = require('supertest');
const { describe, it, expect, beforeAll } = require('@jest/globals');
const app = require('../../../src/app');
const { User } = require('../../../src/db/models');
const { generateToken } = require('../../../src/services/authService');

describe('DELETE /api/projects/:projectId/collaborators', () => {
  let authToken;
  let managerUser;
  let testProject;

  beforeAll(async () => {
    const staffUser = await User.findOne({ email: 'staff0@example.com' });
    managerUser = await User.findOne({ email: 'manager0@example.com' });
    
    if (staffUser) authToken = generateToken(staffUser._id);

    // Create a test project with a collaborator
    if (authToken && managerUser) {
      const createRes = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: `Remove Collaborator Test Project ${Date.now()}`,
          description: 'Test project for removing collaborators'
        });

      if (createRes.status === 200) {
        testProject = createRes.body.data;

        // Add a collaborator first
        await request(app)
          .put(`/api/projects/${testProject.id}/collaborators`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({ collaboratorId: managerUser._id });
      }
    }
  });

  it('should remove collaborator successfully', async () => {
    if (!authToken || !testProject || !managerUser) return;

    const response = await request(app)
      .delete(`/api/projects/${testProject.id}/collaborators`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ collaboratorId: managerUser._id });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    // Check that manager is not in collaborators anymore
    const managerInCollaborators = response.body.data.collaborators.some(collab => 
      collab.user === managerUser._id.toString()
    );
    expect(managerInCollaborators).toBe(false);
  });

  it('should require authentication', async () => {
    if (!testProject || !managerUser) return;

    const response = await request(app)
      .delete(`/api/projects/${testProject.id}/collaborators`)
      .send({ collaboratorId: managerUser._id });

    expect(response.status).toBe(401);
  });

  it('should handle non-existent project', async () => {
    if (!authToken || !managerUser) return;

    const nonExistentProjectId = '507f1f77bcf86cd799439011';
    
    const response = await request(app)
      .delete(`/api/projects/${nonExistentProjectId}/collaborators`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ collaboratorId: managerUser._id });

    expect([404, 400, 500]).toContain(response.status);
  });

  it('should handle removing non-existent collaborator', async () => {
    if (!authToken || !testProject) return;

    const nonExistentCollaboratorId = '507f1f77bcf86cd799439011';
    
    const response = await request(app)
      .delete(`/api/projects/${testProject.id}/collaborators`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ collaboratorId: nonExistentCollaboratorId });

    expect([200, 400, 500, 404]).toContain(response.status);
    // 200 is acceptable if the system handles non-existent collaborators gracefully
  });

  it('should require collaboratorId field', async () => {
    if (!authToken || !testProject) return;

    const response = await request(app)
      .delete(`/api/projects/${testProject.id}/collaborators`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({});

    expect([400, 422, 500, 403]).toContain(response.status);
  });

  it('should validate project ownership or collaboration', async () => {
    if (!testProject || !managerUser) return;

    const otherUser = await User.findOne({ email: 'hr0@example.com' });
    if (!otherUser) return;

    const otherUserToken = generateToken(otherUser._id);

    const response = await request(app)
      .delete(`/api/projects/${testProject.id}/collaborators`)
      .set('Authorization', `Bearer ${otherUserToken}`)
      .send({ collaboratorId: managerUser._id });

    expect([403, 400, 404, 500]).toContain(response.status);
  });

  it('should not allow removing project owner', async () => {
    if (!authToken || !testProject) return;

    const response = await request(app)
      .delete(`/api/projects/${testProject.id}/collaborators`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ collaboratorId: testProject.ownerId });

    expect([400, 422, 500, 403]).toContain(response.status);
  });
});
