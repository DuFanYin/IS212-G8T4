const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  // ✅ Generalized Resource References
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  },

  // ✅ Acting user
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // ✅ Action type
  action: {
    type: String,
    required: true,
    enum: [
      // Task-related actions
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
      'subtask_removed',

      // ✅ New project-level actions
      'role_assigned',
      'role_changed',
      'project_created',
      'project_updated',
      'project_archived'
    ]
  },

  // ✅ Extra metadata (role name, description, etc.)
  details: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },

  // ✅ Resource type for filtering (optional but useful)
  resourceType: {
    type: String,
    enum: ['task', 'project'],
    default: 'task'
  }
}, {
  timestamps: true
});

// ✅ Indexes for faster lookups
activityLogSchema.index({ projectId: 1, createdAt: -1 });
activityLogSchema.index({ taskId: 1, createdAt: -1 });
activityLogSchema.index({ userId: 1 });
activityLogSchema.index({ resourceType: 1 });

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

module.exports = ActivityLog;
