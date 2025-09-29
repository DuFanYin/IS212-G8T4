const request = require('supertest');
const { describe, it, expect, beforeAll } = require('@jest/globals');
const app = require('../../../src/app');
const { User, Project } = require('../../../src/db/models');
const { generateToken } = require('../../../src/services/authService');

async function createProjectAsManager() {
  const managerUser = await User.findOne({ email: 'manager@example.com' });
  const token = generateToken(managerUser._id);
  const res = await request(app)
    .post('/api/projects')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: `Mgr Project ${Date.now()}` });
  return res.body.data;
}

async function createProjectAsManagerWithToken() {
  const managerUser = await User.findOne({ email: 'manager@example.com' });
  const token = generateToken(managerUser._id);
  const res = await request(app)
    .post('/api/projects')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: `Mgr Project ${Date.now()}` });
  return { token, project: res.body.data };
}

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

  it('should return 401 when no token provided', async () => {
    const project = await createProjectAsManager();
    const res = await request(app)
      .put(`/api/projects/${project.id}`)
      .send({ name: 'NoAuth' });
    expect(res.status).toBe(401);
  });

  it('should reject invalid payload types', async () => {
    const { token, project } = await createProjectAsManagerWithToken();
    const res = await request(app)
      .put(`/api/projects/${project.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ deadline: 'not-a-date' });
    expect([400, 422]).toContain(res.status);
  });
});


