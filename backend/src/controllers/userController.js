const userService = require('../services/userService');
const User = require('../domain/User');
const bcrypt = require('bcryptjs');
const EmailService = require('../services/emailService');

const getProfile = async (req, res) => {
  try {
    const user = await userService.getUserById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.json({
      status: 'success',
      data: user.toProfileDTO()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

const getTeamMembers = async (req, res) => {
  try {
    const currentUser = await userService.getUserById(req.user.userId);
    if (!currentUser) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    const user = new User(currentUser);
    
    // Only managers and above, or HR can see team members
    if (!user.canAssignTasks() && !user.canSeeAllTasks()) {
      return res.status(403).json({
        status: 'error',
        message: 'Insufficient permissions to view team members'
      });
    }

    let users = [];
    
    if (user.canSeeAllTasks()) {
      // HR/SM: can see all users
      const allUsers = await userService.getAllUsers();
      users = allUsers.map(u => u.toSafeDTO());
    } else if (user.canSeeDepartmentTasks()) {
      // Director: can see department users
      users = await userService.getUsersByDepartment(user.departmentId);
      users = users.map(u => u.toSafeDTO());
    } else if (user.canSeeTeamTasks()) {
      // Manager: can see team users
      users = await userService.getUsersByTeam(user.teamId);
      users = users.map(u => u.toSafeDTO());
    }

    res.json({
      status: 'success',
      data: users
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

const getDepartmentMembers = async (req, res) => {
  try {
    const currentUser = await userService.getUserById(req.user.userId);
    if (!currentUser) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    const user = new User(currentUser);
    
    // Only directors and above can see department members
    if (!user.canSeeDepartmentTasks() && !user.canSeeAllTasks()) {
      return res.status(403).json({
        status: 'error',
        message: 'Insufficient permissions to view department members'
      });
    }

    const departmentId = req.params.departmentId || user.departmentId;
    const users = await userService.getUsersByDepartment(departmentId);
    
    res.json({
      status: 'success',
      data: users.map(u => u.toSafeDTO())
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

const sendBulkInvitations = async (req, res) => {
  try {
    const currentUser = await userService.getUserById(req.user.userId);
    if (!currentUser) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    const user = new User(currentUser);
    
    // Only HR can send invitations
    if (!user.isHR()) {
      return res.status(403).json({
        status: 'error',
        message: 'Insufficient permissions to send invitations. Only HR can send invitations.'
      });
    }

    const { emails, role, departmentId, teamId } = req.body;

    // Validate required fields
    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Email list is required and must be a non-empty array'
      });
    }

    // Validate email format for all emails
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    const invalidEmails = emails.filter(email => !emailRegex.test(email));
    if (invalidEmails.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: `Invalid email addresses: ${invalidEmails.join(', ')}`
      });
    }

    // Validate role
    const validRoles = ['staff', 'manager', 'director', 'hr', 'sm'];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid role. Valid roles are: staff, manager, director, hr, sm'
      });
    }

    const results = [];
    const emailService = new EmailService();

    for (const email of emails) {
      try {
        // Check if user already exists
        const existingUser = await userService.getUserByEmail(email);
        if (existingUser) {
          results.push({ email, status: 'skipped', message: 'User already exists' });
          continue;
        }

        // Generate invitation token
        const crypto = require('crypto');
        const invitationToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = await bcrypt.hash(invitationToken, 10);

        // Store invitation data (you might want to create an Invitation model for this)
        // For now, we'll store it in a simple way
        const invitationData = {
          email: email.toLowerCase().trim(),
          token: hashedToken,
          role: role || 'staff',
          departmentId: departmentId || null,
          teamId: teamId || null,
          invitedBy: currentUser._id,
          invitedAt: new Date(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        };

        // Send invitation email
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

    res.json({
      status: 'success',
      message: `Invitations processed: ${successCount} sent, ${skippedCount} skipped, ${failedCount} failed`,
      data: {
        results,
        summary: {
          total: emails.length,
          sent: successCount,
          skipped: skippedCount,
          failed: failedCount
        }
      }
    });
  } catch (error) {
    console.error('Bulk invitation error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

module.exports = {
  getProfile,
  getTeamMembers,
  getDepartmentMembers,
  sendBulkInvitations
};
