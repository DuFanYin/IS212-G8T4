const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { User } = require('../db/models');
const EmailService = require('../services/emailService');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/responseHelper');
const { ValidationError, UnauthorizedError } = require('../utils/errors');

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ValidationError('Email and password are required');
  }

  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  if (!emailRegex.test(email)) {
    throw new ValidationError('Please provide a valid email address');
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const isValidPassword = await bcrypt.compare(password, user.passwordHash);
  if (!isValidPassword) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const token = jwt.sign(
    {
      userId: user._id,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  sendSuccess(res, {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});

const registerWithInvitation = asyncHandler(async (req, res) => {
  const { token, name, password } = req.body;

  if (!token || !name || !password) {
    throw new ValidationError('Invitation token, name, and password are required');
  }

  if (password.length < 6) {
    throw new ValidationError('Password must be at least 6 characters long');
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const userData = {
    name: name.trim(),
    email: 'temp@example.com',
    passwordHash,
    role: 'staff'
  };

  const user = await User.create(userData);

  sendSuccess(res, {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  }, 'Account created successfully', 201);
});

const requestPasswordReset = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    throw new ValidationError('User not found');
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = await bcrypt.hash(resetToken, 10);

  user.resetToken = hashedToken;
  user.resetTokenExpiry = new Date(Date.now() + 3600000);
  await user.save();

  const emailService = new EmailService();
  await emailService.sendPasswordResetEmail(user.email, resetToken);

  sendSuccess(res, null, 'Password reset email sent successfully');
});

const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;

  const user = await User.findOne({
    resetTokenExpiry: { $gt: Date.now() }
  });

  if (!user) {
    throw new ValidationError('Invalid or expired reset token');
  }

  const isValidToken = await bcrypt.compare(token, user.resetToken);
  if (!isValidToken) {
    throw new ValidationError('Invalid reset token');
  }

  user.passwordHash = await bcrypt.hash(newPassword, 10);
  user.resetToken = null;
  user.resetTokenExpiry = null;
  await user.save();

  sendSuccess(res, null, 'Password reset successful');
});

module.exports = {
  login,
  registerWithInvitation,
  requestPasswordReset,
  resetPassword
};
