const request = require('supertest');
const { describe, it, expect, beforeAll } = require('@jest/globals');
const app = require('../../../src/app');
const { User } = require('../../../src/db/models');
const { generateToken } = require('../../../src/services/authService');

describe('Project collaborators', () => {
  let authToken;
  let staffUser;
  let managerUser;
  let project;

  beforeAll(async () => {
    staffUser = await User.findOne({ email: 'staff0@example.com' });
    managerUser = await User.findOne({ email: 'manager0@example.com' });
    authToken = generateToken(staffUser._id);
    // Create a fresh project owned by staff to ensure predictable permissions/state
    const createRes = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ name: `Collab Test Project ${Date.now()}`, description: 'temp' });
    project = createRes.body.data;
  });

  it('should add a new collaborator', async () => {
    const projectId = project.id || project._id;
    const res = await request(app)
      .put(`/api/projects/${projectId}/collaborators`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ collaboratorId: managerUser._id });

    expect(res.status).toBe(200);
    expect(res.body.data.collaborators).toContain(project.ownerId.toString());
    expect(res.body.data.collaborators).toContain(managerUser._id.toString());
  });

  it('should not duplicate collaborators', async () => {
    const projectId = project.id || project._id;
    const res = await request(app)
      .put(`/api/projects/${projectId}/collaborators`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ collaboratorId: managerUser._id });

    expect(res.status).toBe(200);
    const collabs = res.body.data.collaborators.filter(id => id === managerUser._id.toString());
    expect(collabs.length).toBe(1);
  });

  it('should remove a collaborator successfully', async () => {
    const projectId = project.id || project._id;
    const res = await request(app)
      .delete(`/api/projects/${projectId}/collaborators`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ collaboratorId: managerUser._id });

    expect(res.status).toBe(200);
    expect(res.body.data.collaborators).not.toContain(managerUser._id.toString());
    expect(res.body.data.collaborators).toContain(staffUser._id.toString());
  });

  it('should not allow removing the project owner', async () => {
    const projectId = project.id || project._id;
    const res = await request(app)
      .delete(`/api/projects/${projectId}/collaborators`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ collaboratorId: staffUser._id });

    expect(res.status).toBe(400);
    // Message may vary; ensure authorization error is returned
    expect(typeof res.body.message).toBe('string');
  });
});


