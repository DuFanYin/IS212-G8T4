const ActivityLogRepository = require('../repositories/ActivityLogRepository');
const ActivityLog = require('../domain/ActivityLog');
const EventEmitter = require('events');

class ActivityLogService {
  constructor(activityLogRepository) {
    this.activityLogRepository = activityLogRepository;
  }
  
  /**
   * Log user activity
   * @param {string} userId - User ID
   * @param {string} action - Action performed
   * @param {Object} details - Additional details
   * @param {string} resourceType - Type of resource (task, project, etc.)
   * @param {string} resourceId - Resource ID
   */

  logActivity(fn, actionName, options = {}) {
    return async function(...args) {
      try {
        // assume last argument is always userId
        const userId = args[args.length - 1];

        let before = options.captureBefore ? await options.captureBefore(...args) : null;
        const result = await fn.apply(this, args);
        let after = options.captureAfter ? await options.captureAfter(result) : result;

        let resourceType = options.resourceType;

        await this.activityLogRepository.create({
          userId,
          action: actionName,
          details: { before, after },
          resourceType,
          resourceId: after?.id || before?.id || null
        });
        
        return result;
      } catch (error) {
        throw new Error(`Error in logging: ${error.message}`);
      }
    };
  }

  /**
   * Get activity logs for a user
   * @param {string} userId - User ID
   * @param {Object} filters - Optional filters
   */
  async getUserActivityLogs(userId, filters = {}) {
    try {
      const activityDocs = await this.activityLogRepository.findByUser(userId, filters);
      return activityDocs.map(doc => new ActivityLog(doc));
    } catch (error) {
      throw new Error(error?.message || 'Error fetching user activity logs');
    }
  }

  /**
   * Get activity logs for a resource
   * @param {string} resourceType - Resource type
   * @param {string} resourceId - Resource ID
   */
  async getResourceActivityLogs(resourceType, resourceId) {
    try {
      const activityDocs = await this.activityLogRepository.findByResource(resourceType, resourceId);
      return activityDocs.map(doc => new ActivityLog(doc));
    } catch (error) {
      throw new Error(error?.message || 'Error fetching resource activity logs');
    }
  }

  /**
   * Get all activity logs with filters
   * @param {Object} filters - Filters to apply
   */
  async getAllActivityLogs(filters = {}) {
    try {
      const activityDocs = await this.activityLogRepository.findAll(filters);
      return activityDocs.map(doc => new ActivityLog(doc));
    } catch (error) {
      throw new Error(error?.message || 'Error fetching activity logs');
    }
  }
}

// Create singleton instance
const activityLogRepository = new ActivityLogRepository();
const activityLogService = new ActivityLogService(activityLogRepository);
const eventEmitter = new EventEmitter();

module.exports = {
  activityLogService,
  eventEmitter
};
