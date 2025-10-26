const UserRepository = require('../repositories/UserRepository');
const User = require('../domain/User');

/**
 * Centralized role and permission checks for the application
 */

// Role hierarchy for permissions (higher number = more permissions)
const ROLE_HIERARCHY = {
  'sm': 4,
  'hr': 4,
  'director': 3,
  'manager': 2,
  'staff': 1
};

/**
 * Check if a user has a specific role
 * @param {User} user - User instance
 * @param {string|string[]} roles - Role(s) to check
 * @returns {boolean}
 */
const hasRole = (user, roles) => {
  if (!user || !user.role) return false;
  const roleArray = Array.isArray(roles) ? roles : [roles];
  return roleArray.includes(user.role);
};

/**
 * Check if a user has any of the specified roles
 * @param {User} user - User instance
 * @param {string[]} roles - Array of roles to check
 * @returns {boolean}
 */
const hasAnyRole = (user, roles) => {
  if (!user || !user.role) return false;
  return roles.some(role => role === user.role);
};

/**
 * Check if user1 has a higher role than user2
 * @param {User} user1 - First user
 * @param {User} user2 - Second user
 * @returns {boolean}
 */
const isHigherRole = (user1, user2) => {
  if (!user1?.role || !user2?.role) return false;
  return ROLE_HIERARCHY[user1.role] > ROLE_HIERARCHY[user2.role];
};

/**
 * Check if user1 has a higher or equal role than user2
 * @param {User} user1 - First user
 * @param {User} user2 - Second user
 * @returns {boolean}
 */
const isHigherOrEqualRole = (user1, user2) => {
  if (!user1?.role || !user2?.role) return false;
  return ROLE_HIERARCHY[user1.role] >= ROLE_HIERARCHY[user2.role];
};

/**
 * Check if a user can assign tasks (manager and above)
 * @param {User} user - User instance
 * @returns {boolean}
 */
const canAssignTasks = (user) => {
  return hasAnyRole(user, ['manager', 'director', 'sm']);
};

/**
 * Check if a user can see all tasks (HR and above)
 * @param {User} user - User instance
 * @returns {boolean}
 */
const canSeeAllTasks = (user) => {
  return hasAnyRole(user, ['hr', 'sm']);
};

/**
 * Check if a user can see department tasks (Director and above)
 * @param {User} user - User instance
 * @returns {boolean}
 */
const canSeeDepartmentTasks = (user) => {
  return hasRole(user, 'director');
};

/**
 * Check if a user can see team tasks (Manager and above)
 * @param {User} user - User instance
 * @returns {boolean}
 */
const canSeeTeamTasks = (user) => {
  return hasRole(user, 'manager');
};

/**
 * Check if a user can manage tasks (assign and view)
 * @param {User} user - User instance
 * @returns {boolean}
 */
const canManageTasks = (user) => {
  return canAssignTasks(user) || canSeeAllTasks(user);
};

/**
 * Check if a user can see any tasks based on their role
 * @param {User} user - User instance
 * @returns {boolean}
 */
const canSeeTasks = (user) => {
  return canSeeAllTasks(user) || canSeeDepartmentTasks(user) || canSeeTeamTasks(user);
};

/**
 * Get user as User domain instance
 * Helper to ensure we're working with User domain objects
 * @param {string} userId - User ID
 * @returns {Promise<User>}
 */
const getUserDomain = async (userId) => {
  const userRepository = new UserRepository();
  const userDoc = await userRepository.findById(userId);
  if (!userDoc) {
    throw new Error('User not found');
  }
  return new User(userDoc);
};

/**
 * Middleware factory: Require specific role(s)
 * Usage: router.get('/route', requireRole('manager', 'director'), handler);
 * @param {...string} allowedRoles - Roles allowed to access
 * @returns {Function} Express middleware
 */
const requireRole = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.userId) {
        return res.status(401).json({
          status: 'error',
          message: 'Not authenticated'
        });
      }

      const user = await getUserDomain(req.user.userId);
      
      if (!hasAnyRole(user, allowedRoles)) {
        return res.status(403).json({
          status: 'error',
          message: 'Insufficient permissions'
        });
      }

      // Attach user domain to request for use in handlers
      req.userDomain = user;
      next();
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  };
};

/**
 * Middleware factory: Require permission to manage tasks
 * @returns {Function} Express middleware
 */
const requireTaskManagement = () => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.userId) {
        return res.status(401).json({
          status: 'error',
          message: 'Not authenticated'
        });
      }

      const user = await getUserDomain(req.user.userId);
      
      if (!canManageTasks(user)) {
        return res.status(403).json({
          status: 'error',
          message: 'Insufficient permissions to manage tasks'
        });
      }

      req.userDomain = user;
      next();
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  };
};

module.exports = {
  // Constants
  ROLE_HIERARCHY,
  
  // Helper functions
  hasRole,
  hasAnyRole,
  isHigherRole,
  isHigherOrEqualRole,
  
  // Permission checkers
  canAssignTasks,
  canSeeAllTasks,
  canSeeDepartmentTasks,
  canSeeTeamTasks,
  canManageTasks,
  canSeeTasks,
  
  // Utilities
  getUserDomain,
  
  // Middleware
  requireRole,
  requireTaskManagement
};

