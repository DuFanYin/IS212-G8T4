jest.mock('../../../src/utils/asyncHandler', () => {
  return (fn) => fn;
});

jest.mock('../../../src/utils/responseHelper', () => ({
  sendSuccess: jest.fn((res, data, message) => {
    return res.json({
      status: 'success',
      data,
      ...(message && { message })
    });
  })
}));

jest.mock('../../../src/services/userService');
jest.mock('../../../src/services/emailService');
jest.mock('../../../src/domain/User');

const userService = require('../../../src/services/userService');
const User = require('../../../src/domain/User');

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

    it('should throw error when user not found', async () => {
      userService.getUserById.mockResolvedValue(null);

      await expect(userController.getProfile(mockReq, mockRes)).rejects.toThrow('User');
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

    it('should throw error for users without permissions', async () => {
      const mockCurrentUser = { _id: 'user123', role: 'staff' };
      userService.getUserById.mockResolvedValue(mockCurrentUser);
      
      User.mockImplementation(() => ({
        canAssignTasks: () => false,
        canSeeAllTasks: () => false
      }));

      await expect(userController.getTeamMembers(mockReq, mockRes)).rejects.toThrow('Insufficient permissions');
    });
  });

  describe('getDepartmentMembers', () => {
    it('should return department members for users with canSeeDepartmentTasks permission', async () => {
      const mockCurrentUser = { _id: 'user123', departmentId: 'dept123', role: 'director' };
      const mockUsers = [
        { toSafeDTO: jest.fn().mockReturnValue({ id: 'user1', name: 'User 1' }) }
      ];

      userService.getUserById.mockResolvedValue(mockCurrentUser);
      userService.getUsersByDepartment.mockResolvedValue(mockUsers);
      
      User.mockImplementation(() => ({
        canSeeDepartmentTasks: () => true,
        canSeeAllTasks: () => false
      }));

      mockReq.params = { departmentId: 'dept123' };

      await userController.getDepartmentMembers(mockReq, mockRes);

      expect(userService.getUsersByDepartment).toHaveBeenCalledWith('dept123');
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        data: [{ id: 'user1', name: 'User 1' }]
      });
    });

    it('should throw error when user not found', async () => {
      userService.getUserById.mockResolvedValue(null);

      await expect(userController.getDepartmentMembers(mockReq, mockRes)).rejects.toThrow('User');
    });
  });

  describe('sendBulkInvitations', () => {
    it('should throw error when user is not HR', async () => {
      const mockCurrentUser = { _id: 'user123', role: 'staff' };
      userService.getUserById.mockResolvedValue(mockCurrentUser);
      
      User.mockImplementation(() => ({
        isHR: () => false
      }));

      await expect(userController.sendBulkInvitations(mockReq, mockRes)).rejects.toThrow('Only HR');
    });

    it('should throw error when emails array is empty', async () => {
      const mockCurrentUser = { _id: 'user123', role: 'hr' };
      userService.getUserById.mockResolvedValue(mockCurrentUser);
      mockReq.body = { emails: [] };
      
      User.mockImplementation(() => ({
        isHR: () => true
      }));

      await expect(userController.sendBulkInvitations(mockReq, mockRes)).rejects.toThrow('Email list is required');
    });
  });
});
