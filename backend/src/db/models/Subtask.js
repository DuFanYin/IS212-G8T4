const mongoose = require('mongoose');

const subtaskSchema = new mongoose.Schema({
  parentTaskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true
  },
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
    enum: ['unassigned', 'ongoing', 'under_review', 'completed'],
    default: 'unassigned'
  },
  assigneeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  collaborators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

// Add indexes for efficient querying
subtaskSchema.index({ parentTaskId: 1 });
subtaskSchema.index({ assigneeId: 1 });
subtaskSchema.index({ status: 1 });
subtaskSchema.index({ dueDate: 1 });

const Subtask = mongoose.model('Subtask', subtaskSchema);

module.exports = Subtask;