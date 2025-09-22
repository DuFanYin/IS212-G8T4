const request = require('supertest');
const { describe, it, expect, beforeEach } = require('@jest/globals');
const app = require('../../src/app');
const { User } = require('../../src/db/models');
const { generateToken } = require('../../src/services/authService');

describe('User Routes - Role-Based Permissions', () => {
  let staffToken;
  let managerToken;
  let directorToken;

  beforeEach(async () => {
    // Get users from seeded data
    const staffUser = await User.findOne({ email: 'staff@example.com' });
    const managerUser = await User.findOne({ email: 'manager@example.com' });
    const directorUser = await User.findOne({ email: 'director@example.com' });
    
    if (staffUser) staffToken = generateToken(staffUser._id);
    if (managerUser) managerToken = generateToken(managerUser._id);
    if (directorUser) directorToken = generateToken(directorUser._id);
  });

  describe('GET /api/users/profile', () => {
    it('should return user profile when authenticated', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${staffToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toEqual(
        expect.objectContaining({
          name: 'Staff Member',
          email: 'staff@example.com',
          role: 'staff'
        })
      );
    });
  });

  describe('Role-Based Access Control', () => {
    it('should allow managers to see team members', async () => {
      const response = await request(app)
        .get('/api/users/team-members')
        .set('Authorization', `Bearer ${managerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
    });

    it('should deny staff access to team members', async () => {
      const response = await request(app)
        .get('/api/users/team-members')
        .set('Authorization', `Bearer ${staffToken}`);

      expect(response.status).toBe(403);
    });

    it('should allow directors to see department members', async () => {
      const response = await request(app)
        .get('/api/users/department-members')
        .set('Authorization', `Bearer ${directorToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
    });

    it('should deny managers access to department members', async () => {
      const response = await request(app)
        .get('/api/users/department-members')
        .set('Authorization', `Bearer ${managerToken}`);

      expect(response.status).toBe(403);
    });
  });
});