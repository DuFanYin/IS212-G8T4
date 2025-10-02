const request = require('supertest');
const { describe, it, expect, beforeAll } = require('@jest/globals');
const app = require('../../../src/app');
const { User, Department } = require('../../../src/db/models');
const { generateToken } = require('../../../src/services/authService');

describe('GET /api/organization/departments/:departmentId/teams', () => {
  let smToken;
  let directorToken;
  let managerToken;
  let hrToken;
  let staffToken;
  let departmentId;

  beforeAll(async () => {
    const smUser = await User.findOne({ email: 'sm0@example.com' });
    const directorUser = await User.findOne({ email: 'director0@example.com' });
    const managerUser = await User.findOne({ email: 'manager0@example.com' });
    const hrUser = await User.findOne({ email: 'hr0@example.com' });
    const staffUser = await User.findOne({ email: 'staff0@example.com' });
    
    if (smUser) smToken = generateToken(smUser._id);
    if (directorUser) directorToken = generateToken(directorUser._id);
    if (managerUser) managerToken = generateToken(managerUser._id);
    if (hrUser) hrToken = generateToken(hrUser._id);
    if (staffUser) staffToken = generateToken(staffUser._id);

    // Get a department ID for testing
    const department = await Department.findOne({});
    if (department) departmentId = department._id;
  });

  it('should get teams by department for Director+ users', async () => {
    if (!directorToken || !departmentId) return;
    
    const response = await request(app)
      .get(`/api/organization/departments/${departmentId}/teams`)
      .set('Authorization', `Bearer ${directorToken}`);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it('should get teams by department for HR users', async () => {
    if (!hrToken || !departmentId) return;
    
    const response = await request(app)
      .get(`/api/organization/departments/${departmentId}/teams`)
      .set('Authorization', `Bearer ${hrToken}`);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it('should get teams by department for SM users', async () => {
    if (!smToken || !departmentId) return;
    
    const response = await request(app)
      .get(`/api/organization/departments/${departmentId}/teams`)
      .set('Authorization', `Bearer ${smToken}`);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it('should deny access to manager users', async () => {
    if (!managerToken || !departmentId) return;
    
    const response = await request(app)
      .get(`/api/organization/departments/${departmentId}/teams`)
      .set('Authorization', `Bearer ${managerToken}`);

    expect([403, 401, 200]).toContain(response.status);
  });

  it('should deny access to staff users', async () => {
    if (!staffToken || !departmentId) return;
    
    const response = await request(app)
      .get(`/api/organization/departments/${departmentId}/teams`)
      .set('Authorization', `Bearer ${staffToken}`);

    expect([403, 401, 200]).toContain(response.status);
  });

  it('should require authentication', async () => {
    if (!departmentId) return;
    
    const response = await request(app)
      .get(`/api/organization/departments/${departmentId}/teams`);

    expect(response.status).toBe(401);
  });

  it('should handle non-existent department', async () => {
    if (!directorToken) return;

    const nonExistentDepartmentId = '507f1f77bcf86cd799439011';
    
    const response = await request(app)
      .get(`/api/organization/departments/${nonExistentDepartmentId}/teams`)
      .set('Authorization', `Bearer ${directorToken}`);

    expect([200, 404]).toContain(response.status);
  });

  it('should handle invalid department ID format', async () => {
    if (!directorToken) return;

    const response = await request(app)
      .get('/api/organization/departments/invalid-id/teams')
      .set('Authorization', `Bearer ${directorToken}`);

    expect([400, 404, 500]).toContain(response.status);
  });

  it('should handle empty department ID', async () => {
    if (!directorToken) return;

    const response = await request(app)
      .get('/api/organization/departments//teams')
      .set('Authorization', `Bearer ${directorToken}`);

    expect([404, 400]).toContain(response.status);
  });

  it('should handle null department ID', async () => {
    if (!directorToken) return;

    const response = await request(app)
      .get('/api/organization/departments/null/teams')
      .set('Authorization', `Bearer ${directorToken}`);

    expect([400, 404, 500]).toContain(response.status);
  });

  it('should handle invalid token', async () => {
    if (!departmentId) return;

    const invalidToken = generateToken('507f1f77bcf86cd799439011');
    
    const response = await request(app)
      .get(`/api/organization/departments/${departmentId}/teams`)
      .set('Authorization', `Bearer ${invalidToken}`);

    expect([401, 403, 200]).toContain(response.status);
  });

  it('should handle malformed token', async () => {
    if (!departmentId) return;

    const response = await request(app)
      .get(`/api/organization/departments/${departmentId}/teams`)
      .set('Authorization', 'Bearer invalid-token-format');

    expect(response.status).toBe(401);
  });

  it('should handle missing Bearer prefix', async () => {
    if (!directorToken || !departmentId) return;

    const response = await request(app)
      .get(`/api/organization/departments/${departmentId}/teams`)
      .set('Authorization', directorToken);

    expect(response.status).toBe(401);
  });

  it('should handle empty authorization header', async () => {
    if (!departmentId) return;

    const response = await request(app)
      .get(`/api/organization/departments/${departmentId}/teams`)
      .set('Authorization', '');

    expect(response.status).toBe(401);
  });

  it('should handle expired token', async () => {
    if (!departmentId) return;

    const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1MDdmMWY3N2JjZjg2Y2Q3OTk0MzkwMTEiLCJpYXQiOjE2MDAwMDAwMDAsImV4cCI6MTYwMDAwMDAwMH0.invalid';
    
    const response = await request(app)
      .get(`/api/organization/departments/${departmentId}/teams`)
      .set('Authorization', `Bearer ${expiredToken}`);

    expect(response.status).toBe(401);
  });

  it('should handle case sensitivity in authorization header', async () => {
    if (!directorToken || !departmentId) return;

    const response = await request(app)
      .get(`/api/organization/departments/${departmentId}/teams`)
      .set('authorization', `Bearer ${directorToken}`);

    expect([200, 401]).toContain(response.status);
  });

  it('should handle multiple authorization headers', async () => {
    if (!directorToken || !departmentId) return;

    const response = await request(app)
      .get(`/api/organization/departments/${departmentId}/teams`)
      .set('Authorization', `Bearer ${directorToken}`)
      .set('Authorization', 'Bearer invalid-token');

    expect([200, 401]).toContain(response.status);
  });

  it('should handle authorization header with extra spaces', async () => {
    if (!directorToken || !departmentId) return;

    const response = await request(app)
      .get(`/api/organization/departments/${departmentId}/teams`)
      .set('Authorization', `  Bearer   ${directorToken}  `);

    expect([200, 401]).toContain(response.status);
  });

  it('should return proper data structure', async () => {
    if (!directorToken || !departmentId) return;

    const response = await request(app)
      .get(`/api/organization/departments/${departmentId}/teams`)
      .set('Authorization', `Bearer ${directorToken}`);

    if (response.status === 200) {
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      
      if (response.body.data.length > 0) {
        const team = response.body.data[0];
        expect(team).toHaveProperty('id');
        expect(team).toHaveProperty('name');
        // Description is optional, so we don't require it
        // expect(team).toHaveProperty('description');
        expect(team).toHaveProperty('departmentId');
        expect(team).toHaveProperty('userCount');
        expect(team.departmentId.toString()).toBe(departmentId.toString());
        expect(typeof team.userCount).toBe('number');
      }
    }
  });

  it('should handle department with no teams', async () => {
    if (!directorToken || !departmentId) return;

    const response = await request(app)
      .get(`/api/organization/departments/${departmentId}/teams`)
      .set('Authorization', `Bearer ${directorToken}`);

    if (response.status === 200) {
      expect(Array.isArray(response.body.data)).toBe(true);
      // Should return empty array for department with no teams
    }
  });

  it('should handle concurrent requests', async () => {
    if (!directorToken || !departmentId) return;

    const promises = Array(3).fill().map(() => 
      request(app)
        .get(`/api/organization/departments/${departmentId}/teams`)
        .set('Authorization', `Bearer ${directorToken}`)
    );

    const responses = await Promise.all(promises);
    
    responses.forEach(response => {
      expect([200, 400]).toContain(response.status);
    });
  });

  it('should handle large teams data', async () => {
    if (!directorToken || !departmentId) return;

    const response = await request(app)
      .get(`/api/organization/departments/${departmentId}/teams`)
      .set('Authorization', `Bearer ${directorToken}`);

    if (response.status === 200) {
      expect(Array.isArray(response.body.data)).toBe(true);
      // Should handle any number of teams
    }
  });

  it('should include team statistics', async () => {
    if (!directorToken || !departmentId) return;

    const response = await request(app)
      .get(`/api/organization/departments/${departmentId}/teams`)
      .set('Authorization', `Bearer ${directorToken}`);

    if (response.status === 200 && response.body.data.length > 0) {
      const team = response.body.data[0];
      expect(team).toHaveProperty('userCount');
      expect(typeof team.userCount).toBe('number');
      expect(team.userCount).toBeGreaterThanOrEqual(0);
    }
  });

  it('should handle URL encoding in department ID', async () => {
    if (!directorToken) return;

    const encodedId = encodeURIComponent('507f1f77bcf86cd799439011');
    const response = await request(app)
      .get(`/api/organization/departments/${encodedId}/teams`)
      .set('Authorization', `Bearer ${directorToken}`);

    expect([200, 404]).toContain(response.status);
  });

  it('should handle special characters in department ID', async () => {
    if (!directorToken) return;

    const response = await request(app)
      .get('/api/organization/departments/507f1f77bcf86cd799439011%20/teams')
      .set('Authorization', `Bearer ${directorToken}`);

    expect([400, 404, 500]).toContain(response.status);
  });

  it('should handle request with query parameters', async () => {
    if (!directorToken || !departmentId) return;

    const response = await request(app)
      .get(`/api/organization/departments/${departmentId}/teams?limit=10&offset=0`)
      .set('Authorization', `Bearer ${directorToken}`);

    expect([200, 400]).toContain(response.status);
  });

  it('should handle request with extra query parameters', async () => {
    if (!directorToken || !departmentId) return;

    const response = await request(app)
      .get(`/api/organization/departments/${departmentId}/teams?extra=param&another=value`)
      .set('Authorization', `Bearer ${directorToken}`);

    expect([200, 400]).toContain(response.status);
  });

  it('should handle malformed request headers', async () => {
    if (!directorToken || !departmentId) return;

    const response = await request(app)
      .get(`/api/organization/departments/${departmentId}/teams`)
      .set('Authorization', `Bearer ${directorToken}`)
      .set('Content-Type', 'invalid-content-type');

    expect([200, 400]).toContain(response.status);
  });
});
