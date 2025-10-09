const request = require('supertest');
const { describe, it, expect, beforeAll } = require('@jest/globals');
const app = require('../../../src/app');
const { User, Department } = require('../../../src/db/models');
const { generateToken } = require('../../../src/services/authService');

describe('GET /api/users/department-members', () => {
  let directorToken;
  let managerToken;
  let testDepartmentId;

  beforeAll(async () => {
    const directorUser = await User.findOne({ email: 'director0@example.com' });
    const managerUser = await User.findOne({ email: 'manager0@example.com' });
    
    if (directorUser) directorToken = generateToken(directorUser._id);
    if (managerUser) managerToken = generateToken(managerUser._id);

    // Get a department ID for testing
    const department = await Department.findOne({});
    if (department) testDepartmentId = department._id;
  });

  it('should allow directors to view department members', async () => {
    if (!directorToken || !testDepartmentId) return;

    const response = await request(app)
      .get(`/api/users/department-members/${testDepartmentId}`)
      .set('Authorization', `Bearer ${directorToken}`);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it('should deny managers from viewing department members', async () => {
    if (!managerToken || !testDepartmentId) return;

    const response = await request(app)
      .get(`/api/users/department-members/${testDepartmentId}`)
      .set('Authorization', `Bearer ${managerToken}`);

    expect([403, 401]).toContain(response.status);
  });

  it('should require authentication to access department members', async () => {
    if (!testDepartmentId) return;

    const response = await request(app)
      .get(`/api/users/department-members/${testDepartmentId}`);

    expect(response.status).toBe(401);
  });
});
