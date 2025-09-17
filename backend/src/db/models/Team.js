const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  departmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  managerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  description: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Ensure unique team names within a department
teamSchema.index({ departmentId: 1, name: 1 }, { unique: true });

const Team = mongoose.model('Team', teamSchema);

module.exports = Team;
