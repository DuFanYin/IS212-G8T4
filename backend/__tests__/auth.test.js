const request = require('supertest');
const { describe, it, expect } = require('@jest/globals');
const app = require('../src/app');

// Tests will use is212_test database which is already seeded
describe('Auth Endpoints', () => {
  describe('POST /api/auth/login', () => {
    it('should authenticate valid user (HR)', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'hr@example.com',
          password: '123456'
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user).toEqual(
        expect.objectContaining({
          name: 'HR Personnel',
          email: 'hr@example.com',
          role: 'hr'
        })
      );
    });

    it('should authenticate valid user (Staff)', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'staff@example.com',
          password: '123456'
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user).toEqual(
        expect.objectContaining({
          name: 'Staff Member',
          email: 'staff@example.com',
          role: 'staff'
        })
      );
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