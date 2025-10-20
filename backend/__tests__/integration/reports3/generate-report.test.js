const request = require('supertest');
const app = require('../../../src/app'); // adjust to your app entry path
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

// Mock JWT secret
process.env.JWT_SECRET = 'testsecret';

describe('Generate Team Reports Integration', () => {
  let authTokenManager;
  let fakeTeamId = new mongoose.Types.ObjectId();

  beforeAll(() => {
    // mock manager token
    const payload = { userId: 'manager123', role: 'manager' };
    authTokenManager = `Bearer ${jwt.sign(payload, process.env.JWT_SECRET)}`;
  });

  test('should reject unauthenticated requests', async () => {
    const res = await request(app).get(`/api/reports/team/${fakeTeamId}`);
    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/No token/);
  });

  test('should reject users without manager role', async () => {
    const employeeToken = `Bearer ${jwt.sign({ userId: 'user1', role: 'employee' }, process.env.JWT_SECRET)}`;
    const res = await request(app)
      .get(`/api/reports/team/${fakeTeamId}`)
      .set('Authorization', employeeToken);
    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/Access denied/);
  });

  test('should return JSON team report for manager', async () => {
    const res = await request(app)
      .get(`/api/reports/team/${fakeTeamId}`)
      .set('Authorization', authTokenManager);

    expect([200, 400]).toContain(res.status); // if no data, 400; if mock data seeded, 200
    if (res.status === 200) {
      expect(res.body.status).toBe('success');
      expect(res.body.data).toHaveProperty('teamId');
      expect(res.body.data).toHaveProperty('memberStats');
    }
  });

  test('should export PDF for manager', async () => {
    const res = await request(app)
      .get(`/api/reports/team/${fakeTeamId}/pdf`)
      .set('Authorization', authTokenManager);

    expect([200, 400]).toContain(res.status);
    if (res.status === 200) {
      expect(res.headers['content-type']).toBe('application/pdf');
    }
  });
});
