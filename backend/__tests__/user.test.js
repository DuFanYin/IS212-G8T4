const request = require('supertest');
const { describe, it, expect, beforeEach } = require('@jest/globals');
const app = require('../src/app');
const User = require('../src/db/models/User');
const { generateToken } = require('../src/services/authService');

// Increase timeout for all tests in this file
jest.setTimeout(30000);

// Tests will use is212_test database from the same MongoDB Atlas cluster

describe('User Routes', () => {
  let testUser;
  let authToken;

  beforeEach(async () => {
    // Wait for any pending operations to complete
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Create a test user
    testUser = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      passwordHash: 'hashedPassword123',
      role: 'hr'  // HR role doesn't require department or team
    });

    // Generate auth token for the test user
    authToken = generateToken(testUser._id);
  });

  describe('GET /api/users/profile', () => {
    it('should return user profile when authenticated', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toEqual({
        id: testUser._id.toString(),
        name: testUser.name,
        email: testUser.email,
        role: testUser.role
      });
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .get('/api/users/profile');

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('error');
    });

    it('should return 404 when user not found', async () => {
      // Delete the test user to simulate "not found" scenario
      await User.deleteMany({});

      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('User not found');
    });
  });
});
