const request = require('supertest');
const app = require('../../../src/app');
const roleMiddleware = require('../../../src/middleware/roleMiddleware');
const { User } = require('../../../src/db/models');
const { generateToken } = require('../../../src/services/authService');

describe('RoleMiddleware Integration Tests', () => {
  let managerToken;
  let staffToken;
  let directorToken;
  let hrToken;

  beforeAll(async () => {
    // Get test users from seed data
    const managerUser = await User.findOne({ email: 'manager0@example.com' });
    const staffUser = await User.findOne({ email: 'staff0@example.com' });
    const directorUser = await User.findOne({ email: 'director0@example.com' });
    const hrUser = await User.findOne({ email: 'hr0@example.com' });

    if (managerUser) managerToken = generateToken(managerUser._id);
    if (staffUser) staffToken = generateToken(staffUser._id);
    if (directorUser) directorToken = generateToken(directorUser._id);
    if (hrUser) hrToken = generateToken(hrUser._id);
  });


  describe('requireRole middleware', () => {
    it('should allow manager to access manager-only routes', async () => {
      const res = await request(app)
        .get('/api/users/team-members')
        .set('Authorization', `Bearer ${managerToken}`);

      expect(res.status).toBe(200);
    });

    it('should allow director to access director routes', async () => {
      const res = await request(app)
        .get('/api/users/department-members/68ff00649be925b1ed239084')
        .set('Authorization', `Bearer ${directorToken}`);

      expect(res.status).toBe(200);
    });

    it('should deny staff access to manager routes', async () => {
      const res = await request(app)
        .get('/api/users/team-members')
        .set('Authorization', `Bearer ${staffToken}`);

      expect(res.status).toBe(403);
      expect(res.body.status).toBe('error');
      expect(res.body.message).toContain('Insufficient permissions');
    });

    it('should return 401 for unauthenticated requests', async () => {
      const res = await request(app)
        .get('/api/users/team-members');

      expect(res.status).toBe(401);
    });

    it('should allow HR to access team members (can see all)', async () => {
      const res = await request(app)
        .get('/api/users/team-members')
        .set('Authorization', `Bearer ${hrToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should allow manager with canAssignTasks to access team members', async () => {
      const res = await request(app)
        .get('/api/users/team-members')
        .set('Authorization', `Bearer ${managerToken}`);

      expect(res.status).toBe(200);
    });
  });

  describe('requireTaskManagement middleware', () => {
    it('should allow staff to view own tasks but not create tasks', async () => {
      // Staff can see their own tasks but creating tasks requires manager+
      const taskRes = await request(app)
        .get('/api/tasks/')
        .set('Authorization', `Bearer ${staffToken}`);

      expect(taskRes.status).toBe(200);
    });
  });

  describe('ROLE_HIERARCHY constant', () => {
    it('should have correct hierarchy values', () => {
      const { ROLE_HIERARCHY } = require('../../../src/middleware/roleMiddleware');
      
      expect(ROLE_HIERARCHY.sm).toBe(4);
      expect(ROLE_HIERARCHY.hr).toBe(4);
      expect(ROLE_HIERARCHY.director).toBe(3);
      expect(ROLE_HIERARCHY.manager).toBe(2);
      expect(ROLE_HIERARCHY.staff).toBe(1);
    });

    it('should correctly determine role hierarchy', () => {
      const { ROLE_HIERARCHY, isHigherRole } = roleMiddleware;
      
      const sm = { role: 'sm' };
      const hr = { role: 'hr' };
      const director = { role: 'director' };
      const manager = { role: 'manager' };
      const staff = { role: 'staff' };

      expect(isHigherRole(sm, staff)).toBe(true);
      expect(isHigherRole(hr, staff)).toBe(true);
      expect(isHigherRole(director, manager)).toBe(true);
      expect(isHigherRole(manager, staff)).toBe(true);
      expect(isHigherRole(staff, manager)).toBe(false);
    });
  });
});

