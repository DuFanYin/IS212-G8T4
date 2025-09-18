const request = require('supertest');
const { describe, it, expect, beforeEach } = require('@jest/globals');
const app = require('../src/app');
const { User } = require('../src/db/models');
const { generateToken } = require('../src/services/authService');

// Tests will use is212_test database from the same MongoDB Atlas cluster
describe('User Routes', () => {
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
  });
});