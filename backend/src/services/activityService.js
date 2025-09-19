const ActivityLogRepository = require('../repositories/ActivityLogRepository');
const ActivityLog = require('../domain/ActivityLog');

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
  async logActivity(userId, action, details = {}, resourceType = null, resourceId = null) {
    try {
      const activityDoc = await this.activityLogRepository.create({
        userId,
        action,
        details,
        resourceType,
        resourceId,
        timestamp: new Date()
      });

      return new ActivityLog(activityDoc);
    } catch (error) {
      throw new Error('Error logging activity');
    }
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
      throw new Error('Error fetching user activity logs');
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
      throw new Error('Error fetching resource activity logs');
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
      throw new Error('Error fetching activity logs');
    }
  }
}

// Create singleton instance
const activityLogRepository = new ActivityLogRepository();
const activityLogService = new ActivityLogService(activityLogRepository);

module.exports = activityLogService;
