const request = require('supertest');
const { describe, it, expect, beforeEach } = require('@jest/globals');
const bcrypt = require('bcryptjs');
const app = require('../src/app');
const User = require('../src/db/models/User');

// Increase timeout for all tests in this file
jest.setTimeout(30000);

// Tests will use is212_test database from the same MongoDB Atlas cluster

describe('Auth Endpoints', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('POST /api/auth/login', () => {
    it('should authenticate valid user', async () => {
      // Create a test user
      const hashedPassword = await bcrypt.hash('password123', 10);
      const user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        passwordHash: hashedPassword,
        role: 'hr'  // HR role doesn't require department or team
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user).toEqual({
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role
      });
    });

    it('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'wrong@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Invalid email or password');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Email and password are required');
    });
  });
});