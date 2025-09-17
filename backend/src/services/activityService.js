const { ActivityLog, Task } = require('../db/models');

class ActivityService {
  /**
   * Log a task activity
   * @param {string} taskId - Task ID
   * @param {string} userId - User ID performing the action
   * @param {string} action - Type of action
   * @param {Object} details - Additional details about the action
   */
  static async logActivity(taskId, userId, action, details) {
    const task = await Task.findById(taskId);
    if (!task) throw new Error('Task not found');

    return ActivityLog.create({
      taskId,
      userId,
      action,
      details
    });
  }

  /**
   * Get activity history for a task
   * @param {string} taskId - Task ID
   * @param {Object} options - Query options (limit, skip, etc.)
   */
  static async getTaskActivity(taskId, options = {}) {
    const query = ActivityLog.find({ taskId })
      .sort('-createdAt')
      .populate('userId', 'name email role');

    if (options.limit) query.limit(options.limit);
    if (options.skip) query.skip(options.skip);

    return query.exec();
  }

  /**
   * Get recent activity for a user
   * @param {string} userId - User ID
   * @param {number} limit - Number of activities to return
   */
  static async getUserRecentActivity(userId, limit = 10) {
    return ActivityLog.find({ userId })
      .sort('-createdAt')
      .limit(limit)
      .populate('taskId', 'title status')
      .exec();
  }

  /**
   * Get project activity
   * @param {string} projectId - Project ID
   * @param {Object} options - Query options
   */
  static async getProjectActivity(projectId, options = {}) {
    const tasks = await Task.find({ projectId }).select('_id');
    const taskIds = tasks.map(t => t._id);

    const query = ActivityLog.find({ taskId: { $in: taskIds } })
      .sort('-createdAt')
      .populate('userId', 'name email role')
      .populate('taskId', 'title');

    if (options.limit) query.limit(options.limit);
    if (options.skip) query.skip(options.skip);

    return query.exec();
  }
}

module.exports = ActivityService;
