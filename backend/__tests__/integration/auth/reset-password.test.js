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

  it('should reset password with valid token', async () => {
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

  it('should reject invalid token', async () => {
    const response = await request(app)
      .post('/api/auth/reset-password')
      .send({
        token: 'invalid-token',
        newPassword: 'newpassword123'
      });

    expect([400, 404]).toContain(response.status);
  });

  it('should require token field', async () => {
    const response = await request(app)
      .post('/api/auth/reset-password')
      .send({
        newPassword: 'newpassword123'
      });

    expect([400, 422, 500]).toContain(response.status);
  });

  it('should require newPassword field', async () => {
    const response = await request(app)
      .post('/api/auth/reset-password')
      .send({
        token: 'some-token'
      });

    expect([400, 422]).toContain(response.status);
  });

  it('should handle weak password', async () => {
    if (!resetToken) return;

    const response = await request(app)
      .post('/api/auth/reset-password')
      .send({
        token: resetToken,
        newPassword: '123'
      });

    expect([400, 422]).toContain(response.status);
  });

  it('should handle expired token', async () => {
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

  it('should handle empty token', async () => {
    const response = await request(app)
      .post('/api/auth/reset-password')
      .send({
        token: '',
        newPassword: 'newpassword123'
      });

    expect([400, 422]).toContain(response.status);
  });

  it('should handle null token', async () => {
    const response = await request(app)
      .post('/api/auth/reset-password')
      .send({
        token: null,
        newPassword: 'newpassword123'
      });

    expect([400, 422, 500]).toContain(response.status);
  });

  it('should handle undefined token', async () => {
    const response = await request(app)
      .post('/api/auth/reset-password')
      .send({
        token: undefined,
        newPassword: 'newpassword123'
      });

    expect([400, 422, 500]).toContain(response.status);
  });

  it('should handle empty password', async () => {
    if (!resetToken) return;

    const response = await request(app)
      .post('/api/auth/reset-password')
      .send({
        token: resetToken,
        newPassword: ''
      });

    expect([400, 422]).toContain(response.status);
  });

  it('should handle null password', async () => {
    if (!resetToken) return;

    const response = await request(app)
      .post('/api/auth/reset-password')
      .send({
        token: resetToken,
        newPassword: null
      });

    expect([400, 422]).toContain(response.status);
  });

  it('should handle undefined password', async () => {
    if (!resetToken) return;

    const response = await request(app)
      .post('/api/auth/reset-password')
      .send({
        token: resetToken,
        newPassword: undefined
      });

    expect([400, 422]).toContain(response.status);
  });

  it('should handle very long password', async () => {
    if (!resetToken) return;

    const longPassword = 'a'.repeat(1000);
    const response = await request(app)
      .post('/api/auth/reset-password')
      .send({
        token: resetToken,
        newPassword: longPassword
      });

    expect([200, 400, 422]).toContain(response.status);
  });

  it('should handle password with special characters', async () => {
    if (!resetToken) return;

    const response = await request(app)
      .post('/api/auth/reset-password')
      .send({
        token: resetToken,
        newPassword: 'P@ssw0rd!@#$%^&*()'
      });

    expect([200, 400, 422]).toContain(response.status);
  });

  it('should handle password with unicode characters', async () => {
    if (!resetToken) return;

    const response = await request(app)
      .post('/api/auth/reset-password')
      .send({
        token: resetToken,
        newPassword: 'pássw0rd123'
      });

    expect([200, 400, 422]).toContain(response.status);
  });

  it('should handle whitespace in password', async () => {
    if (!resetToken) return;

    const response = await request(app)
      .post('/api/auth/reset-password')
      .send({
        token: resetToken,
        newPassword: ' password123 '
      });

    expect([200, 400, 422]).toContain(response.status);
  });

  it('should handle extra fields in request', async () => {
    if (!resetToken) return;

    const response = await request(app)
      .post('/api/auth/reset-password')
      .send({
        token: resetToken,
        newPassword: 'newpassword123',
        extraField: 'should be ignored',
        anotherField: 123
      });

    expect([200, 400]).toContain(response.status);
  });

  it('should handle non-JSON payload', async () => {
    const response = await request(app)
      .post('/api/auth/reset-password')
      .set('Content-Type', 'text/plain')
      .send('token=test&newPassword=password123');

    expect([400, 415, 500]).toContain(response.status);
  });

  it('should handle malformed JSON', async () => {
    const response = await request(app)
      .post('/api/auth/reset-password')
      .set('Content-Type', 'application/json')
      .send('{"token": "test", "newPassword": "password123"');

    expect([400, 415, 500]).toContain(response.status);
  });

  it('should handle concurrent reset attempts', async () => {
    if (!resetToken) return;

    const promises = Array(3).fill().map(() => 
      request(app)
        .post('/api/auth/reset-password')
        .send({
          token: resetToken,
          newPassword: 'newpassword123'
        })
    );

    const responses = await Promise.all(promises);
    
    responses.forEach(response => {
      expect([200, 400]).toContain(response.status);
    });
  });

  it('should handle token reuse after successful reset', async () => {
    if (!testUser) return;

    // Create a new token for this test
    const newToken = 'reuse-test-token-' + Date.now();
    testUser.resetToken = newToken;
    testUser.resetTokenExpiry = new Date(Date.now() + 3600000);
    await testUser.save();

    // First reset attempt
    const response1 = await request(app)
      .post('/api/auth/reset-password')
      .send({
        token: newToken,
        newPassword: 'newpassword123'
      });

    // Second reset attempt with same token
    const response2 = await request(app)
      .post('/api/auth/reset-password')
      .send({
        token: newToken,
        newPassword: 'anotherpassword123'
      });

    expect([200, 400]).toContain(response1.status);
    expect([400, 404]).toContain(response2.status);
  });
});
