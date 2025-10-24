const mongoose = require('mongoose');

// Collaborator subdocument for per-project roles (backward compatible)
const collaboratorSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['viewer', 'editor'], default: 'viewer' },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedAt: { type: Date, default: Date.now }
}, { _id: false });

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
  // NOTE: Legacy projects may have collaborators as ObjectId[]; new documents use collaboratorSchema
  collaborators: [
    {
      type: collaboratorSchema,
      default: undefined
    }
  ],
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
projectSchema.index({ 'collaborators.user': 1 });
projectSchema.index({ isArchived: 1 });

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;