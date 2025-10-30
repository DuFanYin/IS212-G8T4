const mongoose = require('mongoose');

const invitationSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true
  },
  token: {
    type: String,
    required: true,
    index: true
  },
  role: {
    type: String,
    required: true,
    enum: ['staff', 'manager', 'director', 'hr', 'sm'],
    default: 'staff'
  },
  departmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    default: null
  },
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    default: null
  },
  invitedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  invitedAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  usedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index for cleaning up expired invitations
invitationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Method to check if invitation is valid
invitationSchema.methods.isValid = function() {
  return !this.isUsed && this.expiresAt > new Date();
};

const Invitation = mongoose.model('Invitation', invitationSchema);

module.exports = Invitation;

