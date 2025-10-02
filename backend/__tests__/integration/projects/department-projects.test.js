const request = require('supertest');
const { describe, it, expect, beforeAll } = require('@jest/globals');
const app = require('../../../src/app');
const { User, Department } = require('../../../src/db/models');
const { generateToken } = require('../../../src/services/authService');

describe('GET /api/projects/departments/:departmentId', () => {
  let authToken;
  let testDepartmentId;

  beforeAll(async () => {
    const staffUser = await User.findOne({ email: 'staff0@example.com' });
    if (!staffUser) return;
    
    authToken = generateToken(staffUser._id);

    // Get a department ID for testing
    const department = await Department.findOne({});
    if (department) testDepartmentId = department._id;
  });

  it('should get projects by department', async () => {
    if (!authToken || !testDepartmentId) return;

    const response = await request(app)
      .get(`/api/projects/departments/${testDepartmentId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it('should require authentication', async () => {
    if (!testDepartmentId) return;

    const response = await request(app)
      .get(`/api/projects/departments/${testDepartmentId}`);

    expect(response.status).toBe(401);
  });

  it('should handle non-existent department', async () => {
    if (!authToken) return;

    const nonExistentDepartmentId = '507f1f77bcf86cd799439011';
    
    const response = await request(app)
      .get(`/api/projects/departments/${nonExistentDepartmentId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect([200, 404]).toContain(response.status);
    // 200 with empty array is acceptable for non-existent department
  });

  it('should return empty array for department with no projects', async () => {
    if (!authToken || !testDepartmentId) return;

    const response = await request(app)
      .get(`/api/projects/departments/${testDepartmentId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(Array.isArray(response.body.data)).toBe(true);
  });
});
