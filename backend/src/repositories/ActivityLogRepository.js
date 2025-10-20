const ActivityLogModel = require('../db/models/ActivityLog');

class ActivityLogRepository {
  async findById(id) {
    return ActivityLogModel.findById(id);
  }

  async findByUser(userId, filters = {}) {
    const query = { userId, ...filters };
    return ActivityLogModel.find(query).sort({ timestamp: -1 });
  }

  async findByResource(resourceType, resourceId) {
    return ActivityLogModel.find({ resourceType, resourceId }).sort({ timestamp: -1 });
  }

  async findAll(filters = {}) {
    return ActivityLogModel.find(filters).sort({ timestamp: -1 });
  }

  async create(activityData) {
    return ActivityLogModel.create(activityData);
  }

  async updateById(id, updates) {
    return ActivityLogModel.findByIdAndUpdate(id, updates, { new: true });
  }
}

module.exports = ActivityLogRepository;
