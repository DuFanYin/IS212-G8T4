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
    enum: ['staff', 'manager', 'director', 'hr'],
    default: 'staff'
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
