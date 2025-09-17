const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: props => `${props.value} is not a valid email!`
    }
  },
  passwordHash: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true,
    enum: ['staff', 'manager', 'director', 'hr', 'sm'],
    default: 'staff',
    validate: {
      validator: function(role) {
        // Additional validation to ensure role assignments follow hierarchy
        return ['staff', 'manager', 'director', 'hr', 'sm'].includes(role);
      },
      message: props => `${props.value} is not a valid role! Valid roles are: Staff, Manager, Director, HR, Senior Management (SM)`
    }
  },
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: function() {
      // Team membership required for staff, manager roles
      return ['staff', 'manager'].includes(this.role);
    }
  },
  departmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: function() {
      // Department association required for all except HR and SM
      return !['hr', 'sm'].includes(this.role);
    }
  },
  resetToken: {
    type: String,
    default: null
  },
  resetTokenExpiry: {
    type: Date,
    default: null
  }
}, {
  timestamps: true, // This automatically adds createdAt and updatedAt fields
  toJSON: {
    transform: function(doc, ret) {
      delete ret.passwordHash; // Remove password hash when converting to JSON
      return ret;
    }
  }
});

// Add indexes
userSchema.index({ email: 1 });

const User = mongoose.model('User', userSchema);

module.exports = User;
