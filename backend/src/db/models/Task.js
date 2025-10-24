// db/models/Task.js
const mongoose = require('mongoose');

const attachmentSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  path: { type: String, required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  uploadedAt: { type: Date, default: Date.now }
});

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  dueDate: { type: Date, required: true },
  status: {
    type: String,
    required: true,
    enum: ['unassigned', 'ongoing', 'under_review', 'completed'],
    default: 'unassigned'
  },
  priority: { type: Number, min: 1, max: 10, default: 5 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assigneeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  // existing single-project field (kept for backward compatibility)
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },

  // NEW: allow multiple projects/categories
  projects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project', index: true }],

  attachments: [attachmentSchema],
  collaborators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  lastStatusUpdate: {
    status: String,
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedAt: Date
  },
  isDeleted: { type: Boolean, default: false },
  recurringInterval: { type: Number, default: null }
}, { timestamps: true });

// ---------- Indexes ----------
taskSchema.index({ createdBy: 1 });
taskSchema.index({ assigneeId: 1 });
taskSchema.index({ projectId: 1 });            // legacy filters still fast
taskSchema.index({ projects: 1 });              // NEW
taskSchema.index({ status: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ collaborators: 1 });
taskSchema.index({ isDeleted: 1 });

/**
 * ---------- Backward-compat sync ----------
 * If legacy code sets `projectId` but not `projects`, we mirror it so
 * new filters work immediately without breaking old APIs.
 * (Purely additive; remove later once all code writes to `projects`.)
 */
taskSchema.pre('validate', function syncProjectsArray(next) {
  if (this.projectId && (!Array.isArray(this.projects) || this.projects.length === 0)) {
    this.projects = [this.projectId];
  }
  next();
});

module.exports = mongoose.model('Task', taskSchema);