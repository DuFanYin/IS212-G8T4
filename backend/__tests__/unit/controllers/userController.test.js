// Mock dependencies before importing
jest.mock('../../../src/services/userService');
jest.mock('../../../src/services/emailService');
jest.mock('../../../src/domain/User');

const userService = require('../../../src/services/userService');
const User = require('../../../src/domain/User');
const EmailService = require('../../../src/services/emailService');

describe('UserController', () => {
  let userController;
  let mockReq, mockRes;

  beforeEach(() => {
    userController = require('../../../src/controllers/userController');
    mockReq = {
      user: { userId: 'user123' },
      body: {}
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
  });

  describe('getProfile', () => {
    it('should return user profile successfully', async () => {
      const mockUser = {
        toProfileDTO: jest.fn().mockReturnValue({ id: 'user123', name: 'Test User' })
      };
      userService.getUserById.mockResolvedValue(mockUser);

      await userController.getProfile(mockReq, mockRes);

      expect(userService.getUserById).toHaveBeenCalledWith('user123');
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        data: { id: 'user123', name: 'Test User' }
      });
    });

    it('should return 404 when user not found', async () => {
      userService.getUserById.mockResolvedValue(null);

      await userController.getProfile(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'User not found'
      });
    });

    it('should handle service errors', async () => {
      userService.getUserById.mockRejectedValue(new Error('Database error'));

      await userController.getProfile(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Database error'
      });
    });
  });

  describe('getTeamMembers', () => {
    it('should return team members for users with canAssignTasks permission', async () => {
      const mockCurrentUser = { _id: 'user123', role: 'manager' };
      const mockUsers = [
        { toSafeDTO: jest.fn().mockReturnValue({ id: 'user1', name: 'User 1' }) },
        { toSafeDTO: jest.fn().mockReturnValue({ id: 'user2', name: 'User 2' }) }
      ];

      userService.getUserById.mockResolvedValueOnce(mockCurrentUser);
      userService.getUsersByTeam.mockResolvedValue(mockUsers);
      
      // Mock User constructor to return an object with all required methods
      User.mockImplementation(() => ({
        canAssignTasks: () => true,
        canSeeAllTasks: () => false,
        canSeeDepartmentTasks: () => false,
        canSeeTeamTasks: () => true,
        isHR: () => false
      }));

      await userController.getTeamMembers(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        data: [{ id: 'user1', name: 'User 1' }, { id: 'user2', name: 'User 2' }]
      });
    });

    it('should return all users for users with canSeeAllTasks permission', async () => {
      const mockCurrentUser = { _id: 'user123', role: 'hr' };
      const mockUsers = [
        { toSafeDTO: jest.fn().mockReturnValue({ id: 'user1', name: 'User 1' }) }
      ];

      userService.getUserById.mockResolvedValueOnce(mockCurrentUser);
      userService.getAllUsers.mockResolvedValue(mockUsers);
      
      // Mock User constructor to return an object with all required methods
      User.mockImplementation(() => ({
        canAssignTasks: () => false,
        canSeeAllTasks: () => true,
        canSeeDepartmentTasks: () => false,
        canSeeTeamTasks: () => false,
        isHR: () => false
      }));

      await userController.getTeamMembers(mockReq, mockRes);

      expect(userService.getAllUsers).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        data: [{ id: 'user1', name: 'User 1' }]
      });
    });

    it('should return 404 when current user not found', async () => {
      userService.getUserById.mockResolvedValue(null);

      await userController.getTeamMembers(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'User not found'
      });
    });

    it('should return 403 for users without sufficient permissions', async () => {
      const mockCurrentUser = { _id: 'user123', role: 'staff' };
      userService.getUserById.mockResolvedValue(mockCurrentUser);
      
      // Mock User constructor to return an object without permissions
      User.mockImplementation(() => ({
        canAssignTasks: () => false,
        canSeeAllTasks: () => false,
        canSeeDepartmentTasks: () => false,
        canSeeTeamTasks: () => false,
        isHR: () => false
      }));

      await userController.getTeamMembers(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Insufficient permissions to view team members'
      });
    });

    it('should handle service errors', async () => {
      const mockCurrentUser = { _id: 'user123', role: 'manager' };
      userService.getUserById.mockResolvedValueOnce(mockCurrentUser);
      userService.getUsersByTeam.mockRejectedValue(new Error('Database error'));
      
      // Mock User constructor to return an object with permissions
      User.mockImplementation(() => ({
        canAssignTasks: () => true,
        canSeeAllTasks: () => false,
        canSeeDepartmentTasks: () => false,
        canSeeTeamTasks: () => true,
        isHR: () => false
      }));

      await userController.getTeamMembers(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Database error'
      });
    });
  });

  describe('sendBulkInvitations', () => {
    beforeEach(() => {
      mockReq.body = {
        emails: ['test@example.com'],
        role: 'staff',
        departmentId: 'dept123',
        teamId: 'team123'
      };
    });

    it('should send invitations successfully for HR users', async () => {
      const mockCurrentUser = { _id: 'user123', role: 'hr' };
      const mockEmailService = {
        sendInvitationEmail: jest.fn().mockResolvedValue(true)
      };

      userService.getUserById.mockResolvedValue(mockCurrentUser);
      userService.getUserByEmail.mockResolvedValue(null);
      EmailService.mockImplementation(() => mockEmailService);
      
      // Mock User constructor to return an object with isHR method
      User.mockImplementation(() => ({
        isHR: () => true
      }));

      await userController.sendBulkInvitations(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Invitations processed: 1 sent, 0 skipped, 0 failed',
        data: {
          results: expect.arrayContaining([
            expect.objectContaining({
              email: 'test@example.com',
              status: 'sent',
              message: 'Invitation sent successfully'
            })
          ]),
          summary: {
            total: 1,
            sent: 1,
            skipped: 0,
            failed: 0
          }
        }
      });
    });

    it('should return 404 when current user not found', async () => {
      userService.getUserById.mockResolvedValue(null);

      await userController.sendBulkInvitations(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'User not found'
      });
    });

    it('should return 403 for non-HR users', async () => {
      const mockCurrentUser = { _id: 'user123', role: 'manager' };
      userService.getUserById.mockResolvedValue(mockCurrentUser);
      
      // Mock User constructor to return an object without HR permissions
      User.mockImplementation(() => ({
        isHR: () => false
      }));

      await userController.sendBulkInvitations(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Insufficient permissions to send invitations. Only HR can send invitations.'
      });
    });

    it('should return 400 for invalid email array', async () => {
      const mockCurrentUser = { _id: 'user123', role: 'hr' };
      mockReq.body.emails = [];

      userService.getUserById.mockResolvedValue(mockCurrentUser);
      
      // Mock User constructor to return an object with HR permissions
      User.mockImplementation(() => ({
        isHR: () => true
      }));

      await userController.sendBulkInvitations(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Email list is required and must be a non-empty array'
      });
    });

    it('should return 400 for missing emails', async () => {
      const mockCurrentUser = { _id: 'user123', role: 'hr' };
      mockReq.body.emails = null;

      userService.getUserById.mockResolvedValue(mockCurrentUser);
      
      // Mock User constructor to return an object with HR permissions
      User.mockImplementation(() => ({
        isHR: () => true
      }));

      await userController.sendBulkInvitations(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Email list is required and must be a non-empty array'
      });
    });

    it('should return 400 for invalid email format', async () => {
      const mockCurrentUser = { _id: 'user123', role: 'hr' };
      mockReq.body.emails = ['invalid-email'];

      userService.getUserById.mockResolvedValue(mockCurrentUser);
      
      // Mock User constructor to return an object with HR permissions
      User.mockImplementation(() => ({
        isHR: () => true
      }));

      await userController.sendBulkInvitations(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Invalid email addresses: invalid-email'
      });
    });

    it('should return 400 for invalid role', async () => {
      const mockCurrentUser = { _id: 'user123', role: 'hr' };
      mockReq.body.role = 'invalid-role';

      userService.getUserById.mockResolvedValue(mockCurrentUser);
      
      // Mock User constructor to return an object with HR permissions
      User.mockImplementation(() => ({
        isHR: () => true
      }));

      await userController.sendBulkInvitations(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Invalid role. Valid roles are: staff, manager, director, hr, sm'
      });
    });

    it('should skip existing users', async () => {
      const mockCurrentUser = { _id: 'user123', role: 'hr' };
      const mockEmailService = {
        sendInvitationEmail: jest.fn().mockResolvedValue(true)
      };

      userService.getUserById.mockResolvedValue(mockCurrentUser);
      userService.getUserByEmail.mockResolvedValue({ _id: 'existing-user' });
      EmailService.mockImplementation(() => mockEmailService);
      
      // Mock User constructor to return an object with HR permissions
      User.mockImplementation(() => ({
        isHR: () => true
      }));

      await userController.sendBulkInvitations(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Invitations processed: 0 sent, 1 skipped, 0 failed',
        data: {
          results: expect.arrayContaining([
            expect.objectContaining({
              email: 'test@example.com',
              status: 'skipped',
              message: 'User already exists'
            })
          ]),
          summary: {
            total: 1,
            sent: 0,
            skipped: 1,
            failed: 0
          }
        }
      });
    });

    it('should handle email sending failures', async () => {
      const mockCurrentUser = { _id: 'user123', role: 'hr' };
      const mockEmailService = {
        sendInvitationEmail: jest.fn().mockRejectedValue(new Error('SMTP error'))
      };

      userService.getUserById.mockResolvedValue(mockCurrentUser);
      userService.getUserByEmail.mockResolvedValue(null);
      EmailService.mockImplementation(() => mockEmailService);
      
      // Mock User constructor to return an object with HR permissions
      User.mockImplementation(() => ({
        isHR: () => true
      }));

      await userController.sendBulkInvitations(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Invitations processed: 0 sent, 0 skipped, 1 failed',
        data: {
          results: expect.arrayContaining([
            expect.objectContaining({
              email: 'test@example.com',
              status: 'failed',
              message: 'Failed to send invitation'
            })
          ]),
          summary: {
            total: 1,
            sent: 0,
            skipped: 0,
            failed: 1
          }
        }
      });
    });

    it('should handle service errors', async () => {
      const mockCurrentUser = { _id: 'user123', role: 'hr' };
      userService.getUserById.mockResolvedValue(mockCurrentUser);
      userService.getUserByEmail.mockRejectedValue(new Error('Database error'));
      
      // Mock User constructor to return an object with HR permissions
      User.mockImplementation(() => ({
        isHR: () => true
      }));

      await userController.sendBulkInvitations(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Invitations processed: 0 sent, 0 skipped, 1 failed',
        data: {
          results: expect.arrayContaining([
            expect.objectContaining({
              email: 'test@example.com',
              status: 'failed',
              message: 'Failed to send invitation'
            })
          ]),
          summary: {
            total: 1,
            sent: 0,
            skipped: 0,
            failed: 1
          }
        }
      });
    });
  });
});