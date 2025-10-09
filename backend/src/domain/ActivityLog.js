class ActivityLog {
  constructor(data) {
    this.id = data._id || data.id;
    this.userId = data.userId;
    this.action = data.action;
    this.details = data.details || {};
    this.resourceType = data.resourceType;
    this.taskId = data.resourceId;
    this.timestamp = data.timestamp;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  // Utility methods
  isRecent(minutes = 5) {
    const now = new Date();
    const diff = now - new Date(this.timestamp);
    return diff < (minutes * 60 * 1000);
  }

  isToday() {
    const today = new Date();
    const logDate = new Date(this.timestamp);
    return today.toDateString() === logDate.toDateString();
  }

  isThisWeek() {
    const now = new Date();
    const logDate = new Date(this.timestamp);
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return logDate >= weekAgo;
  }

  // DTOs
  toDTO() {
    return {
      id: this.id,
      userId: this.userId,
      action: this.action,
      details: this.details,
      resourceType: this.resourceType,
      resourceId: this.resourceId,
      timestamp: this.timestamp,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  toSafeDTO() {
    return {
      id: this.id,
      action: this.action,
      details: this.details,
      resourceType: this.resourceType,
      resourceId: this.resourceId,
      timestamp: this.timestamp
    };
  }
}

module.exports = ActivityLog;
