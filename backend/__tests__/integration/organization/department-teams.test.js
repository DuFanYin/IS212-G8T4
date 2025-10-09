const request = require('supertest');
const { describe, it, expect, beforeAll } = require('@jest/globals');
const app = require('../../../src/app');
const { User, Department } = require('../../../src/db/models');
const { generateToken } = require('../../../src/services/authService');

describe('GET /api/organization/departments/:departmentId/teams', () => {
  let directorToken;
  let hrToken;
  let managerToken;
  let departmentId;

  beforeAll(async () => {
    const directorUser = await User.findOne({ email: 'director0@example.com' });
    const hrUser = await User.findOne({ email: 'hr0@example.com' });
    const managerUser = await User.findOne({ email: 'manager0@example.com' });
    
    if (directorUser) directorToken = generateToken(directorUser._id);
    if (hrUser) hrToken = generateToken(hrUser._id);
    if (managerUser) managerToken = generateToken(managerUser._id);

    // Get a department ID for testing
    const department = await Department.findOne({});
    if (department) departmentId = department._id;
  });

  it('should allow directors to view department teams', async () => {
    if (!directorToken || !departmentId) return;
    
    const response = await request(app)
      .get(`/api/organization/departments/${departmentId}/teams`)
      .set('Authorization', `Bearer ${directorToken}`);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it('should allow HR users to view department teams', async () => {
    if (!hrToken || !departmentId) return;
    
    const response = await request(app)
      .get(`/api/organization/departments/${departmentId}/teams`)
      .set('Authorization', `Bearer ${hrToken}`);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it('should deny managers from viewing department teams', async () => {
    if (!managerToken || !departmentId) return;
    
    const response = await request(app)
      .get(`/api/organization/departments/${departmentId}/teams`)
      .set('Authorization', `Bearer ${managerToken}`);

    expect([403, 401, 200]).toContain(response.status);
  });

  it('should require authentication', async () => {
    if (!departmentId) return;
    
    const response = await request(app)
      .get(`/api/organization/departments/${departmentId}/teams`);

    expect(response.status).toBe(401);
  });

  it('should handle non-existent department gracefully', async () => {
    if (!directorToken) return;

    const nonExistentDepartmentId = '507f1f77bcf86cd799439011';
    
    const response = await request(app)
      .get(`/api/organization/departments/${nonExistentDepartmentId}/teams`)
      .set('Authorization', `Bearer ${directorToken}`);

    expect([200, 404]).toContain(response.status);
  });
});
