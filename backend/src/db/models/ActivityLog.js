const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'created',
      'updated',
      'status_changed',
      'assigned',
      'collaborator_added',
      'collaborator_removed',
      'comment_added',
      'attachment_added',
      'attachment_removed',
      'subtask_added',
      'subtask_completed',
      'subtask_removed'
    ]
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  }
}, {
  timestamps: true
});

// Add indexes for efficient querying
activityLogSchema.index({ taskId: 1, createdAt: -1 });
activityLogSchema.index({ userId: 1 });

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

module.exports = ActivityLog;
