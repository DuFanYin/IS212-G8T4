const request = require('supertest');
const app = require('../../../src/app');
const ProjectModel = require('../../../src/db/models/Project');
const UserModel = require('../../../src/db/models/User');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

describe('POST /projects/:projectId/assign-role', () => {
  let token, owner, collaborator, project;

  beforeAll(async () => {
    owner = await UserModel.create({ 
      name: 'Owner', 
      email: 'owner@test.com',
      departmentId: new mongoose.Types.ObjectId(),
      teamId: new mongoose.Types.ObjectId(),
      passwordHash: 'testhash',
      role: 'manager'
    });
    collaborator = await UserModel.create({ 
      name: 'Collab', 
      email: 'collab@test.com',
      departmentId: new mongoose.Types.ObjectId(),
      teamId: new mongoose.Types.ObjectId(),
      passwordHash: 'testhash',
      role: 'staff'
    });

    project = await ProjectModel.create({
      name: 'Sprint 3 Project',
      ownerId: owner._id,
      collaborators: [{ user: collaborator._id, role: 'viewer' }]
    });

    // Create a proper JWT token
    token = jwt.sign(
      { userId: owner._id, email: owner.email },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );
  });

  afterAll(async () => {
    await ProjectModel.deleteMany({});
    await UserModel.deleteMany({});
    await mongoose.connection.close();
  });

  it('should allow owner to assign a new role', async () => {
    const res = await request(app)
      .post(`/api/projects/${project._id}/assign-role`)
      .set('Authorization', `Bearer ${token}`)
      .send({ collaboratorId: collaborator._id, role: 'editor' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data.collaborators[0].role).toBe('editor');
  });

  it('should prevent non-owner from assigning roles', async () => {
    // Create a token for the collaborator (non-owner)
    const collaboratorToken = jwt.sign(
      { userId: collaborator._id, email: collaborator.email },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );

    const res = await request(app)
      .post(`/api/projects/${project._id}/assign-role`)
      .set('Authorization', `Bearer ${collaboratorToken}`)
      .send({ collaboratorId: collaborator._id, role: 'editor' });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/Only the project owner/);
  });
});
