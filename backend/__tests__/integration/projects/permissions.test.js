const request = require('supertest');
const { describe, it, expect, beforeAll } = require('@jest/globals');
const app = require('../../../src/app');
const { User, Project } = require('../../../src/db/models');
const { generateToken } = require('../../../src/services/authService');

describe('Project permissions', () => {
  let project;
  let hrUser;
  let managerUser;
  let staffToken;

  beforeAll(async () => {
  hrUser = await User.findOne({ email: 'hr0@example.com' });
  managerUser = await User.findOne({ email: 'manager0@example.com' });
  const staffUser = await User.findOne({ email: 'staff0@example.com' });
    staffToken = generateToken(staffUser._id);
    // Create isolated project owned by staff
    const createRes = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${staffToken}`)
      .send({ name: `Perm Test Project ${Date.now()}`, description: 'temp' });
    project = createRes.body.data;
  });

  it('should not allow HR to update project', async () => {
    const hrToken = generateToken(hrUser._id);
    const pid = project.id || project._id;
    const res = await request(app)
      .put(`/api/projects/${pid}`)
      .set('Authorization', `Bearer ${hrToken}`)
      .send({ name: 'Illegal Update' });

    expect([400, 403, 500]).toContain(res.status);
    expect(res.body.message).toMatch(/not authorized/i);
  });

  it('should allow manager to update project', async () => {
    const managerToken = generateToken(managerUser._id);
    const pid = project.id || project._id;
    const res = await request(app)
      .put(`/api/projects/${pid}`)
      .set('Authorization', `Bearer ${managerToken}`)
      .send({ name: 'Manager Update' });

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Manager Update');
  });
});


