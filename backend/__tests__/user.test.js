const request = require('supertest');
const { describe, it, expect, beforeEach } = require('@jest/globals');
const app = require('../src/app');
const { User } = require('../src/db/models');
const { generateToken } = require('../src/services/authService');

// Tests will use is212_test database from the same MongoDB Atlas cluster
describe('User Routes', () => {
  let authToken;
  let staffUser;

  beforeEach(async () => {
    // Get a staff user from the seeded data
    staffUser = await User.findOne({ email: 'staff@example.com' });
    if (staffUser) {
      authToken = generateToken(staffUser._id);
    }
  });

  describe('GET /api/users/profile', () => {
    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .get('/api/users/profile');

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('No token provided');
    });

    it('should return 401 with invalid token', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Invalid token');
    });

    it('should return user profile when authenticated', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toEqual(
        expect.objectContaining({
          name: 'Staff Member',
          email: 'staff@example.com',
          role: 'staff'
        })
      );
      // Should not include sensitive data
      expect(response.body.data).not.toHaveProperty('passwordHash');
    });
  });
});