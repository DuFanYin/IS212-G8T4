const request = require('supertest');
const { describe, it, expect, beforeEach } = require('@jest/globals');
const app = require('../../../src/app');
const { User } = require('../../../src/db/models');
const { generateToken } = require('../../../src/services/authService');

describe('POST /api/projects', () => {
  let authToken;
  let staffUser;

  beforeEach(async () => {
  staffUser = await User.findOne({ email: 'staff0@example.com' });
    if (staffUser) {
      authToken = generateToken(staffUser._id);
    }
  });

  it('should return 401 when not authenticated', async () => {
    const response = await request(app)
      .post('/api/projects/')
      .send({ name: 'Test Project' });

    expect(response.status).toBe(401);
    expect(response.body.status).toBe('error');
    expect(response.body.message).toBe('No token provided');
  });

  it('should create a project successfully with all fields', async () => {
    const response = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Full Project',
        description: 'Testing all fields',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        collaborators: [staffUser._id]
      });
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
  });

  it('should create a project without optional fields', async () => {
    const response = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ name: 'Minimal Project' });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
  });

  it('should fail if name is missing', async () => {
    const response = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ description: 'Missing name' });

    expect(response.status).toBe(400);
    expect(response.body.status).toBe('error');
    expect(response.body.message).toMatch(/name is required/i);
  });

  it('should fail if deadline is invalid', async () => {
    const response = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ name: 'Invalid Deadline', deadline: 'invalid-date' });

    expect(response.status).toBe(400);
    expect(response.body.status).toBe('error');
    expect(response.body.message).toMatch(/invalid date/i);
  });
});


