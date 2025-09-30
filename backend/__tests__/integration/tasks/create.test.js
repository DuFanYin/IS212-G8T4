const request = require('supertest');
const { describe, it, expect, beforeEach } = require('@jest/globals');
const app = require('../../../src/app');
const { User } = require('../../../src/db/models');
const { generateToken } = require('../../../src/services/authService');

async function loginAs(role) {
  const emailByRole = {
  manager: 'manager0@example.com',
  staff: 'staff0@example.com',
  director: 'director0@example.com',
  hr: 'hr0@example.com',
  sm: 'sm0@example.com'
  };
  const email = emailByRole[role] || emailByRole.staff;
  const user = await User.findOne({ email });
  if (!user) throw new Error(`Test helper could not find user for role ${role}`);
  return generateToken(user._id);
}

describe('POST /api/tasks/', () => {
  let staffToken;

  beforeEach(async () => {
    const staffUser = await User.findOne({ email: 'staff0@example.com' });
    if (staffUser) staffToken = generateToken(staffUser._id);
  });

  it('should create a new task', async () => {
    const response = await request(app)
      .post('/api/tasks/')
      .set('Authorization', `Bearer ${staffToken}`)
      .send({
        title: 'Test Task',
        description: 'Test task description',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      });

    if (response.status !== 201) {
      // eslint-disable-next-line no-console
      console.log('Error creating task:', response.body);
    }
    expect(response.status).toBe(201);
    expect(response.body.status).toBe('success');
    expect(response.body.data).toHaveProperty('title', 'Test Task');
  });

  it('should require authentication', async () => {
    const res = await request(app)
      .post('/api/tasks/')
      .send({ title: 'No Auth Task' });
    expect(res.status).toBe(401);
  });

  it('should validate required title', async () => {
    const token = await loginAs('manager');
    const res = await request(app)
      .post('/api/tasks/')
      .set('Authorization', `Bearer ${token}`)
      .send({ });
    expect([400, 422]).toContain(res.status);
  });
});


