const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  deadline: {
    type: Date
  },
  departmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  },
  collaborators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isArchived: {
    type: Boolean,
    default: false
  },
  hasContainedTasks: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Add indexes for efficient querying
projectSchema.index({ ownerId: 1 });
projectSchema.index({ departmentId: 1 });
projectSchema.index({ name: 'text' });
projectSchema.index({ 'collaborators': 1 });
projectSchema.index({ isArchived: 1 });

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;