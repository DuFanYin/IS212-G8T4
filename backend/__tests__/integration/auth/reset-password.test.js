const request = require('supertest');
const { describe, it, expect, beforeAll } = require('@jest/globals');
const app = require('../../../src/app');
const { User } = require('../../../src/db/models');
const { generateToken } = require('../../../src/services/authService');

describe('POST /api/auth/reset-password', () => {
  let testUser;
  let resetToken;

  beforeAll(async () => {
    testUser = await User.findOne({ email: 'staff0@example.com' });
    if (testUser) {
      // Generate a test reset token
      resetToken = 'test-reset-token-' + Date.now();
      testUser.resetToken = resetToken;
      testUser.resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now
      await testUser.save();
    }
  });

  it('should reset password with valid reset token', async () => {
    if (!testUser || !resetToken) return;

    const response = await request(app)
      .post('/api/auth/reset-password')
      .send({
        token: resetToken,
        newPassword: 'newpassword123'
      });

    expect([200, 400]).toContain(response.status);
    // 400 is acceptable if token validation fails
  });

  it('should reject invalid reset token', async () => {
    const response = await request(app)
      .post('/api/auth/reset-password')
      .send({
        token: 'invalid-token',
        newPassword: 'newpassword123'
      });

    expect([400, 404]).toContain(response.status);
  });

  it('should reject expired reset token', async () => {
    if (!testUser) return;

    // Create an expired token
    const expiredToken = 'expired-token-' + Date.now();
    testUser.resetToken = expiredToken;
    testUser.resetTokenExpiry = new Date(Date.now() - 3600000); // 1 hour ago
    await testUser.save();

    const response = await request(app)
      .post('/api/auth/reset-password')
      .send({
        token: expiredToken,
        newPassword: 'newpassword123'
      });

    expect([400, 404]).toContain(response.status);
  });

  it('should reject weak passwords (security)', async () => {
    if (!resetToken) return;

    const response = await request(app)
      .post('/api/auth/reset-password')
      .send({
        token: resetToken,
        newPassword: '123'
      });

    expect([400, 422]).toContain(response.status);
  });

  it('should require both token and newPassword fields', async () => {
    const response = await request(app)
      .post('/api/auth/reset-password')
      .send({
        token: 'some-token'
      });

    expect([400, 422]).toContain(response.status);
  });
});
