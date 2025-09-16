const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['todo', 'in_progress', 'completed', 'archived'],
    default: 'todo'
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assigneeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },
  parentTaskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  },
  notes: {
    type: String,
    trim: true
  },
  collaborators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

// Add indexes for common queries
taskSchema.index({ ownerId: 1 });
taskSchema.index({ assigneeId: 1 });
taskSchema.index({ projectId: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ dueDate: 1 });

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
