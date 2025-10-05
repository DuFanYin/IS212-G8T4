/**
 * @file unassigned-tasks.test.js
 * @description Integration tests for GET /api/tasks/unassigned using mock data
 */

const request = require('supertest');
const app = require('../../../src/app');
const User = require('../../../src/db/models/User');
const Task = require('../../../src/db/models/Task');
const jwt = require('jsonwebtoken');

describe('GET /api/tasks/unassigned', () => {
  let token;
  let user;

  beforeAll(async () => {
    // Create mock user with required fields
    user = await User.create({
      name: 'Mock Staff',
      email: 'mock@test.com',
      passwordHash: 'hashedpassword',
      role: 'staff',
      departmentId: '64f19a1c2c111a001c123456',
      teamId: '64f19a1c2c111a001c654321'
    });

    // Generate JWT token
    token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'testsecret'
    );

    // Insert sample tasks (one unassigned, one assigned)
    await Task.create([
      {
        title: 'Unassigned Task 1',
        description: 'No project assigned',
        projectId: null,
        status: 'unassigned',
        createdBy: user._id,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'Assigned Task',
        description: 'Belongs to a project',
        projectId: '507f1f77bcf86cd799439011',
        status: 'ongoing',
        createdBy: user._id,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      }
    ]);
  });

  afterAll(async () => {
    await Task.deleteMany({});
    await User.deleteMany({});
  });

  // Base success test
  test('should return all unassigned tasks (status 200)', async () => {
    const res = await request(app)
      .get('/api/tasks/unassigned')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('success');
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);

    // All returned tasks must have projectId = null
    res.body.data.forEach(task => {
      expect(task.projectId).toBe(null);
    });
  });

  // Unauthorized request
  test('should return 401 if token is missing', async () => {
    const res = await request(app).get('/api/tasks/unassigned');
    expect(res.statusCode).toBe(401);
  });

  // Invalid token
  test('should return 401 for invalid JWT token', async () => {
    const res = await request(app)
      .get('/api/tasks/unassigned')
      .set('Authorization', 'Bearer invalid_token');
    expect(res.statusCode).toBe(401);
  });

  // No unassigned tasks available
  test('should return an empty array if no unassigned tasks exist', async () => {
    // Clear all tasks and insert only assigned ones
    await Task.deleteMany({});
    await Task.create({
      title: 'Assigned Task Only',
      description: 'All tasks have project assigned',
      projectId: '507f1f77bcf86cd799439011',
      status: 'ongoing',
      createdBy: user._id,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    const res = await request(app)
      .get('/api/tasks/unassigned')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('success');
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(0);
  });

  // Data format validation
  test('should return tasks containing required fields', async () => {
    // Reinsert one unassigned task
    await Task.create({
      title: 'Check Fields Task',
      description: 'For schema validation',
      projectId: null,
      status: 'unassigned',
      createdBy: user._id,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    const res = await request(app)
      .get('/api/tasks/unassigned')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);

    const task = res.body.data[0];
    expect(task).toHaveProperty('title');
    expect(task).toHaveProperty('status');
    expect(task).toHaveProperty('createdBy');
    expect(task).toHaveProperty('dueDate');
  });
});
