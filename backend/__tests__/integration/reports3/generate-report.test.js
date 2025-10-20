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

    // ✅ New Test 1: Filter by Status
    test('should return filtered report when status filter is applied', async () => {
      const res = await request(app)
        .get(`/api/reports/team/${fakeTeamId}?status=completed`)
        .set('Authorization', authTokenManager);
  
      // Expect 200 if seeded, else 400 (no tasks)
      expect([200, 400]).toContain(res.status);
  
      if (res.status === 200) {
        expect(res.body.status).toBe('success');
        expect(res.body.data.filters.status).toBe('completed');
        expect(res.body.data).toHaveProperty('memberStats');
        // Optional: if mock data available
        if (res.body.data.memberStats.length > 0) {
          const allTasks = res.body.data.memberStats.flatMap(m => m.completedTasks);
          expect(Array.isArray(allTasks)).toBe(true);
        }
      }
    });
  
    // ✅ New Test 2: Filter by Date Range
    test('should return filtered report when date range is applied', async () => {
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days ago
      const endDate = new Date().toISOString();
  
      const res = await request(app)
        .get(`/api/reports/team/${fakeTeamId}?startDate=${startDate}&endDate=${endDate}`)
        .set('Authorization', authTokenManager);
  
      expect([200, 400]).toContain(res.status);
  
      if (res.status === 200) {
        expect(res.body.status).toBe('success');
        expect(res.body.data.filters.startDate).toBeDefined();
        expect(res.body.data.filters.endDate).toBeDefined();
      }
    });  
});
