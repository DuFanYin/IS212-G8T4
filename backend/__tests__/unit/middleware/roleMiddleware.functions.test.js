const roleMiddleware = require('../../../src/middleware/roleMiddleware');

describe('RoleMiddleware - Helper Functions', () => {
  describe('hasRole', () => {
    it('should return true when user has the role', () => {
      const user = { role: 'manager' };
      expect(roleMiddleware.hasRole(user, 'manager')).toBe(true);
    });

    it('should return false when user does not have the role', () => {
      const user = { role: 'staff' };
      expect(roleMiddleware.hasRole(user, 'manager')).toBe(false);
    });

    it('should return true when user has any role in array', () => {
      const user = { role: 'manager' };
      expect(roleMiddleware.hasRole(user, ['staff', 'manager', 'director'])).toBe(true);
    });

    it('should return false for null user', () => {
      expect(roleMiddleware.hasRole(null, 'manager')).toBe(false);
    });

    it('should return false for user without role', () => {
      const user = {};
      expect(roleMiddleware.hasRole(user, 'manager')).toBe(false);
    });
  });

  describe('hasAnyRole', () => {
    it('should return true when user has any of the roles', () => {
      const user = { role: 'manager' };
      expect(roleMiddleware.hasAnyRole(user, ['staff', 'manager'])).toBe(true);
    });

    it('should return false when user has none of the roles', () => {
      const user = { role: 'staff' };
      expect(roleMiddleware.hasAnyRole(user, ['manager', 'director'])).toBe(false);
    });

    it('should return false for null user', () => {
      expect(roleMiddleware.hasAnyRole(null, ['manager'])).toBe(false);
    });
  });

  describe('isHigherRole', () => {
    it('should return true when user1 has higher role', () => {
      const user1 = { role: 'director' };
      const user2 = { role: 'manager' };
      expect(roleMiddleware.isHigherRole(user1, user2)).toBe(true);
    });

    it('should return false when user1 has lower role', () => {
      const user1 = { role: 'manager' };
      const user2 = { role: 'director' };
      expect(roleMiddleware.isHigherRole(user1, user2)).toBe(false);
    });

    it('should return false for null users', () => {
      expect(roleMiddleware.isHigherRole(null, { role: 'manager' })).toBe(false);
      expect(roleMiddleware.isHigherRole({ role: 'manager' }, null)).toBe(false);
    });
  });

  describe('isHigherOrEqualRole', () => {
    it('should return true when user1 has higher role', () => {
      const user1 = { role: 'director' };
      const user2 = { role: 'manager' };
      expect(roleMiddleware.isHigherOrEqualRole(user1, user2)).toBe(true);
    });

    it('should return true when users have equal role', () => {
      const user1 = { role: 'manager' };
      const user2 = { role: 'manager' };
      expect(roleMiddleware.isHigherOrEqualRole(user1, user2)).toBe(true);
    });

    it('should return false for null users', () => {
      expect(roleMiddleware.isHigherOrEqualRole(null, { role: 'manager' })).toBe(false);
    });
  });

  describe('canAssignTasks', () => {
    it('should return true for manager', () => {
      const user = { role: 'manager' };
      expect(roleMiddleware.canAssignTasks(user)).toBe(true);
    });

    it('should return true for director', () => {
      const user = { role: 'director' };
      expect(roleMiddleware.canAssignTasks(user)).toBe(true);
    });

    it('should return true for sm', () => {
      const user = { role: 'sm' };
      expect(roleMiddleware.canAssignTasks(user)).toBe(true);
    });

    it('should return false for staff', () => {
      const user = { role: 'staff' };
      expect(roleMiddleware.canAssignTasks(user)).toBe(false);
    });
  });

  describe('canSeeAllTasks', () => {
    it('should return true for hr', () => {
      const user = { role: 'hr' };
      expect(roleMiddleware.canSeeAllTasks(user)).toBe(true);
    });

    it('should return true for sm', () => {
      const user = { role: 'sm' };
      expect(roleMiddleware.canSeeAllTasks(user)).toBe(true);
    });

    it('should return false for manager', () => {
      const user = { role: 'manager' };
      expect(roleMiddleware.canSeeAllTasks(user)).toBe(false);
    });
  });

  describe('canSeeDepartmentTasks', () => {
    it('should return true for director', () => {
      const user = { role: 'director' };
      expect(roleMiddleware.canSeeDepartmentTasks(user)).toBe(true);
    });

    it('should return false for manager', () => {
      const user = { role: 'manager' };
      expect(roleMiddleware.canSeeDepartmentTasks(user)).toBe(false);
    });
  });

  describe('canSeeTeamTasks', () => {
    it('should return true for manager', () => {
      const user = { role: 'manager' };
      expect(roleMiddleware.canSeeTeamTasks(user)).toBe(true);
    });

    it('should return false for staff', () => {
      const user = { role: 'staff' };
      expect(roleMiddleware.canSeeTeamTasks(user)).toBe(false);
    });
  });

  describe('canManageTasks', () => {
    it('should return true for manager', () => {
      const user = { role: 'manager' };
      expect(roleMiddleware.canManageTasks(user)).toBe(true);
    });

    it('should return true for hr', () => {
      const user = { role: 'hr' };
      expect(roleMiddleware.canManageTasks(user)).toBe(true);
    });

    it('should return false for staff', () => {
      const user = { role: 'staff' };
      expect(roleMiddleware.canManageTasks(user)).toBe(false);
    });
  });

  describe('canSeeTasks', () => {
    it('should return true for hr', () => {
      const user = { role: 'hr' };
      expect(roleMiddleware.canSeeTasks(user)).toBe(true);
    });

    it('should return true for director', () => {
      const user = { role: 'director' };
      expect(roleMiddleware.canSeeTasks(user)).toBe(true);
    });

    it('should return true for manager', () => {
      const user = { role: 'manager' };
      expect(roleMiddleware.canSeeTasks(user)).toBe(true);
    });

    it('should return false for staff', () => {
      const user = { role: 'staff' };
      expect(roleMiddleware.canSeeTasks(user)).toBe(false);
    });
  });

  // Note: getUserDomain requires actual database connection and is tested in integration tests
});

