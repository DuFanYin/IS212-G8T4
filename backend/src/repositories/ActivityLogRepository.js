const ActivityLogModel = require('../db/models/ActivityLog');

class ActivityLogRepository {
  /**
   * Log an activity to the database
   * @param {Object} data
   * @param {String} data.projectId - Related project ID
   * @param {String} data.performedBy - Acting user's ID
   * @param {String} data.action - Description of what happened
   * @param {String} [data.resourceType='project'] - Type of resource (e.g., 'project', 'task')
   * @param {String} [data.resourceId] - Optional related resource ID
   * @param {Date} [data.timestamp=new Date()] - Timestamp of action
   */
  async logActivity({
    projectId,
    performedBy,
    action,
    resourceType = 'project',
    resourceId,
    timestamp = new Date(),
  }) {
    if (!performedBy || !action) {
      throw new Error('Missing required fields: performedBy and action');
    }

    const activity = {
      projectId,
      userId: performedBy,
      action,
      resourceType,
      resourceId,
      timestamp,
    };

    return ActivityLogModel.create(activity);
  }

  /** Retrieve all activity logs (optionally filtered) */
  async findAll(filters = {}) {
    return ActivityLogModel.find(filters).sort({ timestamp: -1 });
  }

  /** Retrieve activity logs by user */
  async findByUser(userId, filters = {}) {
    const query = { userId, ...filters };
    return ActivityLogModel.find(query).sort({ timestamp: -1 });
  }

  /** Retrieve activity logs by resource */
  async findByResource(resourceType, resourceId) {
    return ActivityLogModel.find({ resourceType, resourceId }).sort({ timestamp: -1 });
  }

  /** Retrieve a single log entry by ID */
  async findById(id) {
    return ActivityLogModel.findById(id);
  }

  /** Update a log entry (rarely needed, but useful for audits) */
  async updateById(id, updates) {
    return ActivityLogModel.findByIdAndUpdate(id, updates, { new: true });
  }
}

// ✅ Export the class (NOT an instance)
module.exports = ActivityLogRepository;
