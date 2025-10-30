const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { User, Invitation } = require('../db/models');
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

  // Find all valid (non-used, non-expired) invitations
  const invitations = await Invitation.find({
    isUsed: false,
    expiresAt: { $gt: Date.now() }
  });

  if (!invitations || invitations.length === 0) {
    throw new ValidationError('Invalid or expired invitation token');
  }

  // Find the matching invitation by comparing the token
  let matchedInvitation = null;
  for (const invitation of invitations) {
    const isMatch = await bcrypt.compare(token, invitation.token);
    if (isMatch) {
      matchedInvitation = invitation;
      break;
    }
  }

  if (!matchedInvitation) {
    throw new ValidationError('Invalid or expired invitation token');
  }

  // Check if user already exists with this email
  const existingUser = await User.findOne({ email: matchedInvitation.email });
  if (existingUser) {
    throw new ValidationError('User with this email already exists');
  }

  const passwordHash = await bcrypt.hash(password, 10);

  // Create user with invitation data
  const userData = {
    name: name.trim(),
    email: matchedInvitation.email,
    passwordHash,
    role: matchedInvitation.role,
    departmentId: matchedInvitation.departmentId,
    teamId: matchedInvitation.teamId
  };

  const user = await User.create(userData);

  // Mark invitation as used
  matchedInvitation.isUsed = true;
  matchedInvitation.usedAt = new Date();
  await matchedInvitation.save();

  // Generate JWT token for auto-login
  const jwtToken = jwt.sign(
    {
      userId: user._id,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  sendSuccess(res, {
    token: jwtToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      departmentId: user.departmentId,
      teamId: user.teamId
    }
  }, 'Account created successfully', 201);
});

const requestPasswordReset = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ValidationError('Email is required');
  }

  // Validate email format
  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  if (!emailRegex.test(email)) {
    throw new ValidationError('Please provide a valid email address');
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ValidationError('User not found');
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = await bcrypt.hash(resetToken, 10);

  user.resetToken = hashedToken;
  user.resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour
  await user.save();

  const emailService = new EmailService();
  await emailService.sendPasswordResetEmail(user.email, resetToken);

  sendSuccess(res, null, 'Password reset email sent successfully');
});

const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    throw new ValidationError('Token and new password are required');
  }

  if (newPassword.length < 6) {
    throw new ValidationError('Password must be at least 6 characters long');
  }

  // Find all users with non-expired reset tokens
  const usersWithResetTokens = await User.find({
    resetToken: { $ne: null },
    resetTokenExpiry: { $gt: Date.now() }
  });

  if (!usersWithResetTokens || usersWithResetTokens.length === 0) {
    throw new ValidationError('Invalid or expired reset token');
  }

  // Find the matching user by comparing the token
  let matchedUser = null;
  for (const user of usersWithResetTokens) {
    const isMatch = await bcrypt.compare(token, user.resetToken);
    if (isMatch) {
      matchedUser = user;
      break;
    }
  }

  if (!matchedUser) {
    throw new ValidationError('Invalid or expired reset token');
  }

  // Update password and clear reset token
  matchedUser.passwordHash = await bcrypt.hash(newPassword, 10);
  matchedUser.resetToken = null;
  matchedUser.resetTokenExpiry = null;
  await matchedUser.save();

  sendSuccess(res, null, 'Password reset successful');
});

module.exports = {
  login,
  registerWithInvitation,
  requestPasswordReset,
  resetPassword
};
