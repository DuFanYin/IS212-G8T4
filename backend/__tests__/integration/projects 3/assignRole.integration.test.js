const request = require('supertest');
const app = require('../../../src/app');
const ProjectModel = require('../../../src/db/models/Project');
const UserModel = require('../../../src/db/models/User');
const mongoose = require('mongoose');

describe('POST /projects/:projectId/assign-role', () => {
  let token, owner, collaborator, project;

  beforeAll(async () => {
    owner = await UserModel.create({ name: 'Owner', email: 'owner@test.com' });
    collaborator = await UserModel.create({ name: 'Collab', email: 'collab@test.com' });

    project = await ProjectModel.create({
      name: 'Sprint 3 Project',
      ownerId: owner._id,
      collaborators: [{ user: collaborator._id, role: 'viewer' }]
    });

    // assume you have auth token util or middleware mock
    token = `Bearer ${owner._id}`;
  });

  afterAll(async () => {
    await ProjectModel.deleteMany({});
    await UserModel.deleteMany({});
    await mongoose.connection.close();
  });

  it('should allow owner to assign a new role', async () => {
    const res = await request(app)
      .post(`/projects/${project._id}/assign-role`)
      .set('Authorization', token)
      .send({ collaboratorId: collaborator._id, role: 'editor' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data.collaborators[0].role).toBe('editor');
  });

  it('should prevent non-owner from assigning roles', async () => {
    const res = await request(app)
      .post(`/projects/${project._id}/assign-role`)
      .set('Authorization', `Bearer ${collaborator._id}`)
      .send({ collaboratorId: collaborator._id, role: 'editor' });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/Only the project owner/);
  });
});
