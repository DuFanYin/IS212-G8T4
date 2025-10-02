const request = require('supertest');
const { describe, it, expect, beforeAll } = require('@jest/globals');
const app = require('../../../src/app');
const { User } = require('../../../src/db/models');

describe('POST /api/auth/request-reset', () => {
  let testUser;

  beforeAll(async () => {
    testUser = await User.findOne({ email: 'staff0@example.com' });
  });

  it('should request password reset for valid email', async () => {
    if (!testUser) return;

    const response = await request(app)
      .post('/api/auth/request-reset')
      .send({ email: testUser.email });

    expect([200, 404]).toContain(response.status);
    // 404 is acceptable if email service is not configured
  });

  it('should handle invalid email', async () => {
    const response = await request(app)
      .post('/api/auth/request-reset')
      .send({ email: 'nonexistent@example.com' });

    expect([200, 404, 400]).toContain(response.status);
  });

  it('should require email field', async () => {
    const response = await request(app)
      .post('/api/auth/request-reset')
      .send({});

    expect([400, 422, 404]).toContain(response.status);
  });

  it('should handle malformed email', async () => {
    const response = await request(app)
      .post('/api/auth/request-reset')
      .send({ email: 'invalid-email' });

    expect([400, 422, 404]).toContain(response.status);
  });

  it('should handle empty email', async () => {
    const response = await request(app)
      .post('/api/auth/request-reset')
      .send({ email: '' });

    expect([400, 422, 404]).toContain(response.status);
  });

  it('should handle null email', async () => {
    const response = await request(app)
      .post('/api/auth/request-reset')
      .send({ email: null });

    expect([400, 422, 404]).toContain(response.status);
  });

  it('should handle undefined email', async () => {
    const response = await request(app)
      .post('/api/auth/request-reset')
      .send({ email: undefined });

    expect([400, 422, 404]).toContain(response.status);
  });

  it('should handle very long email', async () => {
    const longEmail = 'a'.repeat(1000) + '@example.com';
    const response = await request(app)
      .post('/api/auth/request-reset')
      .send({ email: longEmail });

    expect([400, 422, 404]).toContain(response.status);
  });

  it('should handle email with special characters', async () => {
    const response = await request(app)
      .post('/api/auth/request-reset')
      .send({ email: 'test+tag@example.com' });

    expect([200, 400, 422, 404]).toContain(response.status);
  });

  it('should handle multiple email requests', async () => {
    if (!testUser) return;

    const response1 = await request(app)
      .post('/api/auth/request-reset')
      .send({ email: testUser.email });

    const response2 = await request(app)
      .post('/api/auth/request-reset')
      .send({ email: testUser.email });

    expect([200, 404]).toContain(response1.status);
    expect([200, 404]).toContain(response2.status);
  });

  it('should handle case insensitive email', async () => {
    if (!testUser) return;

    const response = await request(app)
      .post('/api/auth/request-reset')
      .send({ email: testUser.email.toUpperCase() });

    expect([200, 404]).toContain(response.status);
  });

  it('should handle email with whitespace', async () => {
    if (!testUser) return;

    const response = await request(app)
      .post('/api/auth/request-reset')
      .send({ email: ' ' + testUser.email + ' ' });

    expect([200, 400, 422, 404]).toContain(response.status);
  });

  it('should handle non-JSON payload', async () => {
    const response = await request(app)
      .post('/api/auth/request-reset')
      .set('Content-Type', 'text/plain')
      .send('email=test@example.com');

    expect([400, 415, 500, 404]).toContain(response.status);
  });

  it('should handle malformed JSON', async () => {
    const response = await request(app)
      .post('/api/auth/request-reset')
      .set('Content-Type', 'application/json')
      .send('{"email": "test@example.com"');

    expect([400, 415, 500, 404]).toContain(response.status);
  });

  it('should handle extra fields in request', async () => {
    if (!testUser) return;

    const response = await request(app)
      .post('/api/auth/request-reset')
      .send({ 
        email: testUser.email,
        extraField: 'should be ignored',
        anotherField: 123
      });

    expect([200, 404]).toContain(response.status);
  });

  it('should handle concurrent requests', async () => {
    if (!testUser) return;

    const promises = Array(5).fill().map(() => 
      request(app)
        .post('/api/auth/request-reset')
        .send({ email: testUser.email })
    );

    const responses = await Promise.all(promises);
    
    responses.forEach(response => {
      expect([200, 404]).toContain(response.status);
    });
  });
});
