const request = require('supertest');
const { describe, it, expect, beforeAll } = require('@jest/globals');
const app = require('../../../src/app');
const { User, Department } = require('../../../src/db/models');
const { generateToken } = require('../../../src/services/authService');

describe('GET /api/tasks/department/:departmentId', () => {
  let directorToken;
  let hrToken;
  let smToken;
  let managerToken;
  let testDepartmentId;

  beforeAll(async () => {
    const directorUser = await User.findOne({ email: 'director0@example.com' });
    const hrUser = await User.findOne({ email: 'hr0@example.com' });
    const smUser = await User.findOne({ email: 'sm0@example.com' });
    const managerUser = await User.findOne({ email: 'manager0@example.com' });
    
    if (directorUser) directorToken = generateToken(directorUser._id);
    if (hrUser) hrToken = generateToken(hrUser._id);
    if (smUser) smToken = generateToken(smUser._id);
    if (managerUser) managerToken = generateToken(managerUser._id);

    // Get a department ID for testing
    const department = await Department.findOne({});
    if (department) testDepartmentId = department._id;
  });

  it('should get tasks by department for director', async () => {
    if (!directorToken || !testDepartmentId) return;

    const response = await request(app)
      .get(`/api/tasks/department/${testDepartmentId}`)
      .set('Authorization', `Bearer ${directorToken}`);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it('should get tasks by department for HR', async () => {
    if (!hrToken || !testDepartmentId) return;

    const response = await request(app)
      .get(`/api/tasks/department/${testDepartmentId}`)
      .set('Authorization', `Bearer ${hrToken}`);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it('should get tasks by department for SM', async () => {
    if (!smToken || !testDepartmentId) return;

    const response = await request(app)
      .get(`/api/tasks/department/${testDepartmentId}`)
      .set('Authorization', `Bearer ${smToken}`);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it('should deny access to manager users', async () => {
    if (!managerToken || !testDepartmentId) return;

    const response = await request(app)
      .get(`/api/tasks/department/${testDepartmentId}`)
      .set('Authorization', `Bearer ${managerToken}`);

    expect([403, 401, 400]).toContain(response.status);
  });

  it('should require authentication', async () => {
    if (!testDepartmentId) return;

    const response = await request(app)
      .get(`/api/tasks/department/${testDepartmentId}`);

    expect(response.status).toBe(401);
  });

  it('should handle non-existent department', async () => {
    if (!directorToken) return;

    const nonExistentDepartmentId = '507f1f77bcf86cd799439011';
    
    const response = await request(app)
      .get(`/api/tasks/department/${nonExistentDepartmentId}`)
      .set('Authorization', `Bearer ${directorToken}`);

    expect([200, 404]).toContain(response.status);
    // 200 with empty array is acceptable for non-existent department
  });
});
