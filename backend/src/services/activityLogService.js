const ActivityLogRepository = require('../repositories/ActivityLogRepository');
const ActivityLog = require('../domain/ActivityLog');

class ActivityLogService {
  constructor(activityLogRepository) {
    this.activityLogRepository = activityLogRepository;
  }

  /**
   * Log user activity (generic)
   * @param {Object} params
   * @param {string} params.action - Action performed
   * @param {string} params.resourceId - Associated resource (task or project)
   * @param {Object} [params.before] - Optional state before change
   * @param {Object} [params.after] - Optional state after change
   * @param {string} params.userId - Acting user
   * @param {string} [params.resourceType="task"] - Resource type (task, project, etc.)
   */
  async logActivity({ action, resourceId, before, after, userId, resourceType = 'task' }) {
    try {
      const activityLog = await this.activityLogRepository.create({
        resourceType,
        resourceId,
        userId,
        action,
        details: { before, after }
      });
      return new ActivityLog(activityLog);
    } catch (error) {
      throw new Error(`Error logging activity: ${error.message}`);
    }
  }

  /**
   * Get activity logs for a specific user
   * @param {string} userId
   * @param {Object} [filters]
   */
  async getUserActivityLogs(userId, filters = {}) {
    try {
      const docs = await this.activityLogRepository.findByUser(userId, filters);
      return docs.map(doc => new ActivityLog(doc));
    } catch (error) {
      throw new Error(`Error fetching user activity logs: ${error.message}`);
    }
  }

  /**
   * Get activity logs for a specific resource
   * @param {string} resourceType
   * @param {string} resourceId
   */
  async getResourceActivityLogs(resourceType, resourceId) {
    try {
      const docs = await this.activityLogRepository.findByResource(resourceType, resourceId);
      return docs.map(doc => new ActivityLog(doc));
    } catch (error) {
      throw new Error(`Error fetching resource activity logs: ${error.message}`);
    }
  }

  /**
   * Get all activity logs (optionally filtered)
   * @param {Object} [filters]
   */
  async getAllActivityLogs(filters = {}) {
    try {
      const docs = await this.activityLogRepository.findAll(filters);
      return docs.map(doc => new ActivityLog(doc));
    } catch (error) {
      throw new Error(`Error fetching activity logs: ${error.message}`);
    }
  }
}

// ✅ Create singleton instance (required for Jest + dependency consistency)
const activityLogRepository = new ActivityLogRepository();
const activityLogService = new ActivityLogService(activityLogRepository);

module.exports = activityLogService;
