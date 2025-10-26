const userService = require('../services/userService');
const User = require('../domain/User');
const bcrypt = require('bcryptjs');
const EmailService = require('../services/emailService');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/responseHelper');
const { NotFoundError, ForbiddenError, ValidationError } = require('../utils/errors');

const getProfile = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.user.userId);
  if (!user) {
    throw new NotFoundError('User');
  }
  sendSuccess(res, user.toProfileDTO());
});

const getTeamMembers = asyncHandler(async (req, res) => {
  const currentUser = await userService.getUserById(req.user.userId);
  if (!currentUser) {
    throw new NotFoundError('User');
  }

  const user = new User(currentUser);

  if (!user.canAssignTasks() && !user.canSeeAllTasks()) {
    throw new ForbiddenError('Insufficient permissions to view team members');
  }

  let users = [];
  
  if (user.canSeeAllTasks()) {
    const allUsers = await userService.getAllUsers();
    users = allUsers.map(u => u.toSafeDTO());
  } else if (user.canSeeDepartmentTasks()) {
    users = await userService.getUsersByDepartment(user.departmentId);
    users = users.map(u => u.toSafeDTO());
  } else if (user.canSeeTeamTasks()) {
    users = await userService.getUsersByTeam(user.teamId);
    users = users.map(u => u.toSafeDTO());
  }

  sendSuccess(res, users);
});

const getDepartmentMembers = asyncHandler(async (req, res) => {
  const currentUser = await userService.getUserById(req.user.userId);
  if (!currentUser) {
    throw new NotFoundError('User');
  }

  const user = new User(currentUser);

  if (!user.canSeeDepartmentTasks() && !user.canSeeAllTasks()) {
    throw new ForbiddenError('Insufficient permissions to view department members');
  }

  const departmentId = req.params.departmentId || user.departmentId;
  const users = await userService.getUsersByDepartment(departmentId);
  
  sendSuccess(res, users.map(u => u.toSafeDTO()));
});

const sendBulkInvitations = asyncHandler(async (req, res) => {
  const currentUser = await userService.getUserById(req.user.userId);
  if (!currentUser) {
    throw new NotFoundError('User');
  }

  const user = new User(currentUser);

  if (!user.isHR()) {
    throw new ForbiddenError('Only HR can send invitations');
  }

  const { emails, role, departmentId, teamId } = req.body;

  if (!emails || !Array.isArray(emails) || emails.length === 0) {
    throw new ValidationError('Email list is required and must be a non-empty array');
  }

  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  const invalidEmails = emails.filter(email => !emailRegex.test(email));
  if (invalidEmails.length > 0) {
    throw new ValidationError(`Invalid email addresses: ${invalidEmails.join(', ')}`);
  }

  const validRoles = ['staff', 'manager', 'director', 'hr', 'sm'];
  if (role && !validRoles.includes(role)) {
    throw new ValidationError('Invalid role. Valid roles are: staff, manager, director, hr, sm');
  }

  const results = [];
  const emailService = new EmailService();

  for (const email of emails) {
    try {
      const existingUser = await userService.getUserByEmail(email);
      if (existingUser) {
        results.push({ email, status: 'skipped', message: 'User already exists' });
        continue;
      }

      const crypto = require('crypto');
      const invitationToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = await bcrypt.hash(invitationToken, 10);

      const invitationData = {
        email: email.toLowerCase().trim(),
        token: hashedToken,
        role: role || 'staff',
        departmentId: departmentId || null,
        teamId: teamId || null,
        invitedBy: currentUser._id,
        invitedAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      };

      await emailService.sendInvitationEmail(email, invitationToken, invitationData.role);
      
      results.push({ email, status: 'sent', message: 'Invitation sent successfully' });
    } catch (error) {
      console.error(`Failed to send invitation to ${email}:`, error);
      results.push({ email, status: 'failed', message: 'Failed to send invitation' });
    }
  }

  const successCount = results.filter(r => r.status === 'sent').length;
  const skippedCount = results.filter(r => r.status === 'skipped').length;
  const failedCount = results.filter(r => r.status === 'failed').length;

  sendSuccess(res, {
    results,
    summary: {
      total: emails.length,
      sent: successCount,
      skipped: skippedCount,
      failed: failedCount
    }
  }, `Invitations processed: ${successCount} sent, ${skippedCount} skipped, ${failedCount} failed`);
});

module.exports = {
  getProfile,
  getTeamMembers,
  getDepartmentMembers,
  sendBulkInvitations
};
