const request = require('supertest');
const { describe, it, expect, beforeAll } = require('@jest/globals');
const app = require('../../../src/app');
const { User, Project } = require('../../../src/db/models');
const { generateToken } = require('../../../src/services/authService');

describe('PUT /api/projects/:projectId/archive', () => {
  let authToken;
  let project;

  beforeAll(async () => {
    const staffUser = await User.findOne({ email: 'staff0@example.com' });
    if (!staffUser) throw new Error('Required users not found in DB');
    authToken = generateToken(staffUser._id);
    // Create a fresh project owned by staff to control permissions
    const createRes = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ name: `Archive Test Project ${Date.now()}`, description: 'temp' });
    if (createRes.status !== 200) {
      // eslint-disable-next-line no-console
      console.log('Failed to create project for archive tests:', createRes.body);
    }
    project = createRes.body.data;
  });

  it('should archive the project', async () => {
    const projectId = project.id || project._id;
    const res = await request(app)
      .put(`/api/projects/${projectId}/archive`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ isArchived: true });

    expect(res.status).toBe(200);
    expect(res.body.data.isArchived).toBe(true);
  });

  it('should unarchive the project', async () => {
    const projectId = project.id || project._id;
    const res = await request(app)
      .put(`/api/projects/${projectId}/archive`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ isArchived: false });

    expect(res.status).toBe(200);
    expect(res.body.data.isArchived).toBe(false);
  });
});


