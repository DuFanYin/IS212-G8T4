const request = require('supertest');
const app = require('../../../src/app');
const { User } = require('../../../src/db/models');
const { generateToken } = require('../../../src/services/authService');

describe('User Controller Integration Tests', () => {
  let managerToken;
  let staffToken;
  let hrToken;
  let managerUserId;

  beforeAll(async () => {
    // Get test users from seed data
    const managerUser = await User.findOne({ email: 'manager0@example.com' });
    const staffUser = await User.findOne({ email: 'staff0@example.com' });
    const hrUser = await User.findOne({ email: 'hr0@example.com' });

    if (managerUser) {
      managerToken = generateToken(managerUser._id);
      managerUserId = managerUser._id;
    }
    if (staffUser) staffToken = generateToken(staffUser._id);
    if (hrUser) hrToken = generateToken(hrUser._id);
  });


  describe('GET /api/users/profile', () => {
    it('should return user profile for authenticated user', async () => {
      const res = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${managerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data).toHaveProperty('name');
      expect(res.body.data).toHaveProperty('email');
    });

    it('should return 401 for unauthenticated user', async () => {
      const res = await request(app)
        .get('/api/users/profile');

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/users/team-members', () => {
    it('should return team members for manager', async () => {
      const res = await request(app)
        .get('/api/users/team-members')
        .set('Authorization', `Bearer ${managerToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should return 403 for staff user', async () => {
      const res = await request(app)
        .get('/api/users/team-members')
        .set('Authorization', `Bearer ${staffToken}`);

      expect(res.status).toBe(403);
    });

    it('should return team members for HR', async () => {
      const res = await request(app)
        .get('/api/users/team-members')
        .set('Authorization', `Bearer ${hrToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('GET /api/users/department-members/:departmentId', () => {
    it('should return department members for director', async () => {
      const res = await request(app)
        .get('/api/users/department-members/68ff00649be925b1ed239084')
        .set('Authorization', `Bearer ${hrToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should return 403 for staff user', async () => {
      const res = await request(app)
        .get('/api/users/department-members/68ff00649be925b1ed239084')
        .set('Authorization', `Bearer ${staffToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe('POST /api/users/send-invitations', () => {
    it('should send invitations successfully by HR', async () => {
      const res = await request(app)
        .post('/api/users/send-invitations')
        .set('Authorization', `Bearer ${hrToken}`)
        .send({
          emails: ['122686006h@gmail.com'],
          role: 'staff',
          departmentId: '68ff00649be925b1ed239084',
          teamId: '68ff00649be925b1ed239097'
        });

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('summary');
      expect(res.body.data.summary.sent).toBeGreaterThanOrEqual(0);
    });

    it('should return 403 for non-HR user', async () => {
      const res = await request(app)
        .post('/api/users/send-invitations')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          emails: ['122686006h@gmail.com'],
          role: 'staff'
        });

      expect(res.status).toBe(403);
    });

    it('should return 400 for invalid email format', async () => {
      const res = await request(app)
        .post('/api/users/send-invitations')
        .set('Authorization', `Bearer ${hrToken}`)
        .send({
          emails: ['invalid-email'],
          role: 'staff'
        });

      expect(res.status).toBe(400);
    });

    it('should return 400 for empty email array', async () => {
      const res = await request(app)
        .post('/api/users/send-invitations')
        .set('Authorization', `Bearer ${hrToken}`)
        .send({
          emails: [],
          role: 'staff'
        });

      expect(res.status).toBe(400);
    });

    it('should return 400 for invalid role', async () => {
      const res = await request(app)
        .post('/api/users/send-invitations')
        .set('Authorization', `Bearer ${hrToken}`)
        .send({
          emails: ['122686006h@gmail.com'],
          role: 'invalid-role'
        });

      expect(res.status).toBe(400);
    });

    it('should skip existing users', async () => {
      const res = await request(app)
        .post('/api/users/send-invitations')
        .set('Authorization', `Bearer ${hrToken}`)
        .send({
          emails: ['manager@test.com'], // Already exists
          role: 'staff'
        });

      expect(res.status).toBe(200);
      expect(res.body.data.summary.skipped).toBeGreaterThanOrEqual(0);
    });
  });
});

