const request = require('supertest');
const { describe, it, expect, beforeAll } = require('@jest/globals');
const app = require('../../../src/app');
const { User, Project } = require('../../../src/db/models');
const { generateToken } = require('../../../src/services/authService');

describe('PUT /api/projects/:projectId', () => {
  let authToken;
  let project;

  beforeAll(async () => {
    const staffUser = await User.findOne({ email: 'staff@example.com' });
    if (!staffUser) throw new Error('Required users not found in DB');
    authToken = generateToken(staffUser._id);
    // Create a fresh project owned by staff to ensure permissions
    const createRes = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ name: `Update Test Project ${Date.now()}`, description: 'temp' });
    if (createRes.status !== 200) {
      // eslint-disable-next-line no-console
      console.log('Failed to create project for update tests:', createRes.body);
    }
    project = createRes.body.data;
  });

  it('should update project name and description', async () => {
    const projectId = project.id || project._id;
    const res = await request(app)
      .put(`/api/projects/${projectId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ name: 'Updated Project', description: 'Updated desc' });

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Updated Project');
    expect(res.body.data.description).toBe('Updated desc');
  });

  it('should merge collaborators when updating collaborators array', async () => {
    const projectId = project.id || project._id;
    const managerUser = await User.findOne({ email: 'manager@example.com' });
    const collaborator = managerUser._id;

    const res = await request(app)
      .put(`/api/projects/${projectId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ collaborators: [collaborator] });

    expect(res.status).toBe(200);
    expect(res.body.data.collaborators).toContain(project.ownerId.toString());
    expect(res.body.data.collaborators).toContain(collaborator.toString());
  });
});


