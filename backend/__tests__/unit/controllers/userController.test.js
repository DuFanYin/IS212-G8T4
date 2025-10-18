// Mock dependencies before importing
jest.mock('../../../src/services/userService');
jest.mock('../../../src/domain/User');

const userService = require('../../../src/services/userService');
const User = require('../../../src/domain/User');

describe('UserController', () => {
  let userController;
  let mockReq;
  let mockRes;

  beforeEach(() => {
    userController = require('../../../src/controllers/userController');
    
    mockReq = {
      user: { userId: 'user1' },
      params: {}
    };
    
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    jest.clearAllMocks();
  });

  describe('getProfile', () => {
    it('should get user profile successfully', async () => {
      const mockUser = {
        toProfileDTO: jest.fn().mockReturnValue({
          id: 'user1',
          name: 'Test User',
          email: 'test@example.com'
        })
      };

      userService.getUserById.mockResolvedValue(mockUser);

      await userController.getProfile(mockReq, mockRes);

      expect(userService.getUserById).toHaveBeenCalledWith('user1');
      expect(mockUser.toProfileDTO).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        data: {
          id: 'user1',
          name: 'Test User',
          email: 'test@example.com'
        }
      });
    });

    it('should return error when user not found', async () => {
      userService.getUserById.mockResolvedValue(null);

      await userController.getProfile(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'User not found'
      });
    });

    it('should handle service errors', async () => {
      const error = new Error('Service error');
      userService.getUserById.mockRejectedValue(error);

      await userController.getProfile(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Service error'
      });
    });
  });

  describe('getTeamMembers', () => {
    it('should get team members for HR/SM users', async () => {
      const mockCurrentUser = {
        id: 'user1',
        role: 'hr'
      };
      const mockUser = {
        canAssignTasks: jest.fn().mockReturnValue(false),
        canSeeAllTasks: jest.fn().mockReturnValue(true)
      };
      const mockAllUsers = [
        { toSafeDTO: jest.fn().mockReturnValue({ id: 'user2', name: 'User 2' }) },
        { toSafeDTO: jest.fn().mockReturnValue({ id: 'user3', name: 'User 3' }) }
      ];

      userService.getUserById.mockResolvedValue(mockCurrentUser);
      userService.getAllUsers.mockResolvedValue(mockAllUsers);
      User.mockImplementation(() => mockUser);

      await userController.getTeamMembers(mockReq, mockRes);

      expect(userService.getUserById).toHaveBeenCalledWith('user1');
      expect(userService.getAllUsers).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        data: [
          { id: 'user2', name: 'User 2' },
          { id: 'user3', name: 'User 3' }
        ]
      });
    });

    it('should get team members for director users', async () => {
      const mockCurrentUser = {
        id: 'user1',
        departmentId: 'dept1'
      };
      const mockUser = {
        canAssignTasks: jest.fn().mockReturnValue(false),
        canSeeAllTasks: jest.fn().mockReturnValue(false),
        canSeeDepartmentTasks: jest.fn().mockReturnValue(true),
        departmentId: 'dept1'
      };
      const mockDeptUsers = [
        { toSafeDTO: jest.fn().mockReturnValue({ id: 'user2', name: 'User 2' }) }
      ];

      userService.getUserById.mockResolvedValue(mockCurrentUser);
      userService.getUsersByDepartment.mockResolvedValue(mockDeptUsers);
      User.mockImplementation((userDoc) => ({
        ...mockUser,
        departmentId: userDoc.departmentId,
        canAssignTasks: jest.fn().mockReturnValue(true),
        canSeeAllTasks: jest.fn().mockReturnValue(false),
        canSeeDepartmentTasks: jest.fn().mockReturnValue(true)
      }));

      await userController.getTeamMembers(mockReq, mockRes);

      expect(User).toHaveBeenCalledWith(mockCurrentUser);
      expect(userService.getUsersByDepartment).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        data: [{ id: 'user2', name: 'User 2' }]
      });
    });

    it('should get team members for manager users', async () => {
      const mockCurrentUser = {
        id: 'user1',
        teamId: 'team1'
      };
      const mockUser = {
        canAssignTasks: jest.fn().mockReturnValue(true),
        canSeeAllTasks: jest.fn().mockReturnValue(false),
        canSeeDepartmentTasks: jest.fn().mockReturnValue(false),
        canSeeTeamTasks: jest.fn().mockReturnValue(true),
        teamId: 'team1'
      };
      const mockTeamUsers = [
        { toSafeDTO: jest.fn().mockReturnValue({ id: 'user2', name: 'User 2' }) }
      ];

      userService.getUserById.mockResolvedValue(mockCurrentUser);
      userService.getUsersByTeam.mockResolvedValue(mockTeamUsers);
      User.mockImplementation(() => mockUser);

      await userController.getTeamMembers(mockReq, mockRes);

      expect(userService.getUsersByTeam).toHaveBeenCalledWith('team1');
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        data: [{ id: 'user2', name: 'User 2' }]
      });
    });

    it('should return error when user not found', async () => {
      userService.getUserById.mockResolvedValue(null);

      await userController.getTeamMembers(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'User not found'
      });
    });

    it('should return error when insufficient permissions', async () => {
      const mockCurrentUser = { id: 'user1' };
      const mockUser = {
        canAssignTasks: jest.fn().mockReturnValue(false),
        canSeeAllTasks: jest.fn().mockReturnValue(false)
      };

      userService.getUserById.mockResolvedValue(mockCurrentUser);
      User.mockImplementation(() => mockUser);

      await userController.getTeamMembers(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Insufficient permissions to view team members'
      });
    });

    it('should handle service errors', async () => {
      const error = new Error('Service error');
      userService.getUserById.mockRejectedValue(error);

      await userController.getTeamMembers(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Service error'
      });
    });
  });

  describe('getDepartmentMembers', () => {
    it('should get department members successfully', async () => {
      const mockCurrentUser = {
        id: 'user1',
        departmentId: 'dept1'
      };
      const mockUser = {
        canSeeDepartmentTasks: jest.fn().mockReturnValue(true),
        canSeeAllTasks: jest.fn().mockReturnValue(false),
        departmentId: 'dept1'
      };
      const mockDeptUsers = [
        { toSafeDTO: jest.fn().mockReturnValue({ id: 'user2', name: 'User 2' }) }
      ];

      mockReq.params.departmentId = 'dept1';
      userService.getUserById.mockResolvedValue(mockCurrentUser);
      userService.getUsersByDepartment.mockResolvedValue(mockDeptUsers);
      User.mockImplementation(() => mockUser);

      await userController.getDepartmentMembers(mockReq, mockRes);

      expect(userService.getUsersByDepartment).toHaveBeenCalledWith('dept1');
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        data: [{ id: 'user2', name: 'User 2' }]
      });
    });

    it('should use user department when no departmentId provided', async () => {
      const mockCurrentUser = {
        id: 'user1',
        departmentId: 'dept1'
      };
      const mockUser = {
        canSeeDepartmentTasks: jest.fn().mockReturnValue(true),
        canSeeAllTasks: jest.fn().mockReturnValue(false),
        departmentId: 'dept1'
      };
      const mockDeptUsers = [
        { toSafeDTO: jest.fn().mockReturnValue({ id: 'user2', name: 'User 2' }) }
      ];

      userService.getUserById.mockResolvedValue(mockCurrentUser);
      userService.getUsersByDepartment.mockResolvedValue(mockDeptUsers);
      User.mockImplementation(() => mockUser);

      await userController.getDepartmentMembers(mockReq, mockRes);

      expect(userService.getUsersByDepartment).toHaveBeenCalledWith('dept1');
    });

    it('should return error when user not found', async () => {
      userService.getUserById.mockResolvedValue(null);

      await userController.getDepartmentMembers(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'User not found'
      });
    });

    it('should return error when insufficient permissions', async () => {
      const mockCurrentUser = { id: 'user1' };
      const mockUser = {
        canSeeDepartmentTasks: jest.fn().mockReturnValue(false),
        canSeeAllTasks: jest.fn().mockReturnValue(false)
      };

      userService.getUserById.mockResolvedValue(mockCurrentUser);
      User.mockImplementation(() => mockUser);

      await userController.getDepartmentMembers(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Insufficient permissions to view department members'
      });
    });

    it('should handle service errors', async () => {
      const error = new Error('Service error');
      userService.getUserById.mockRejectedValue(error);

      await userController.getDepartmentMembers(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Service error'
      });
    });
  });
});

