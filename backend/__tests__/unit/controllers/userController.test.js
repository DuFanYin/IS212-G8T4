const userController = require('../../../src/controllers/userController');
const userService = require('../../../src/services/userService');
const User = require('../../../src/domain/User');
const { NotFoundError, ForbiddenError, ValidationError } = require('../../../src/utils/errors');

jest.mock('../../../src/services/userService');
jest.mock('../../../src/domain/User');
jest.mock('../../../src/services/emailService');

describe('UserController', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      user: { userId: 'user123' },
      params: {},
      body: {}
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('getProfile', () => {
    it('should return user profile successfully', async () => {
      const mockUser = { toProfileDTO: jest.fn().mockReturnValue({ id: 'user123', name: 'Test User' }) };
      userService.getUserById = jest.fn().mockResolvedValue(mockUser);

      await userController.getProfile(req, res, next);

      expect(userService.getUserById).toHaveBeenCalledWith('user123');
      expect(mockUser.toProfileDTO).toHaveBeenCalled();
    });

    it('should handle user not found', async () => {
      userService.getUserById = jest.fn().mockResolvedValue(null);

      await userController.getProfile(req, res, next);
      await new Promise(resolve => setImmediate(resolve));

      expect(next).toHaveBeenCalledWith(expect.any(NotFoundError));
    });
  });

  describe('getTeamMembers', () => {
    it('should return team members for HR/SM', async () => {
      const mockUser = { 
        canAssignTasks: jest.fn().mockReturnValue(false),
        canSeeAllTasks: jest.fn().mockReturnValue(true),
        departmentId: 'dept123',
        teamId: 'team123'
      };
      const mockUsers = [
        { toSafeDTO: jest.fn().mockReturnValue({ id: 'user1' }) },
        { toSafeDTO: jest.fn().mockReturnValue({ id: 'user2' }) }
      ];

      userService.getUserById = jest.fn().mockResolvedValue(mockUser);
      userService.getAllUsers = jest.fn().mockResolvedValue(mockUsers);
      User.mockImplementation(() => mockUser);

      await userController.getTeamMembers(req, res, next);

      expect(userService.getAllUsers).toHaveBeenCalled();
    });

    it('should return team members for managers', async () => {
      const mockUser = { 
        canAssignTasks: jest.fn().mockReturnValue(true),
        canSeeAllTasks: jest.fn().mockReturnValue(false),
        canSeeDepartmentTasks: jest.fn().mockReturnValue(false),
        canSeeTeamTasks: jest.fn().mockReturnValue(true),
        departmentId: 'dept123',
        teamId: 'team123'
      };
      const mockUsers = [{ toSafeDTO: jest.fn().mockReturnValue({ id: 'user1' }) }];

      userService.getUserById = jest.fn().mockResolvedValue(mockUser);
      userService.getUsersByTeam = jest.fn().mockResolvedValue(mockUsers);
      User.mockImplementation(() => mockUser);

      await userController.getTeamMembers(req, res, next);

      expect(userService.getUsersByTeam).toHaveBeenCalledWith('team123');
    });

    it('should handle insufficient permissions', async () => {
      const mockUser = { 
        canAssignTasks: jest.fn().mockReturnValue(false),
        canSeeAllTasks: jest.fn().mockReturnValue(false),
        departmentId: 'dept123',
        teamId: 'team123'
      };

      userService.getUserById = jest.fn().mockResolvedValue(mockUser);
      User.mockImplementation(() => mockUser);

      await userController.getTeamMembers(req, res, next);
      await new Promise(resolve => setImmediate(resolve));

      expect(next).toHaveBeenCalledWith(expect.any(ForbiddenError));
    });
  });

  describe('getDepartmentMembers', () => {
    it('should return department members successfully', async () => {
      const mockUser = { 
        canSeeDepartmentTasks: jest.fn().mockReturnValue(true),
        canSeeAllTasks: jest.fn().mockReturnValue(false),
        departmentId: 'dept123'
      };
      const mockUsers = [{ toSafeDTO: jest.fn().mockReturnValue({ id: 'user1' }) }];

      userService.getUserById = jest.fn().mockResolvedValue(mockUser);
      userService.getUsersByDepartment = jest.fn().mockResolvedValue(mockUsers);
      User.mockImplementation(() => mockUser);

      await userController.getDepartmentMembers(req, res, next);

      expect(userService.getUsersByDepartment).toHaveBeenCalled();
    });

    it('should handle insufficient permissions', async () => {
      const mockUser = { 
        canSeeDepartmentTasks: jest.fn().mockReturnValue(false),
        canSeeAllTasks: jest.fn().mockReturnValue(false),
        departmentId: 'dept123'
      };

      userService.getUserById = jest.fn().mockResolvedValue(mockUser);
      User.mockImplementation(() => mockUser);

      await userController.getDepartmentMembers(req, res, next);
      await new Promise(resolve => setImmediate(resolve));

      expect(next).toHaveBeenCalledWith(expect.any(ForbiddenError));
    });
  });

  describe('sendBulkInvitations', () => {
    it('should send invitations successfully', async () => {
      const mockUser = { _id: 'user123', isHR: jest.fn().mockReturnValue(true) };
      req.body = {
        emails: ['122686006h@gmail.com'],
        role: 'staff',
        departmentId: 'dept123',
        teamId: 'team123'
      };

      userService.getUserById = jest.fn().mockResolvedValue(mockUser);
      userService.getUserByEmail = jest.fn().mockResolvedValue(null);
      User.mockImplementation(() => mockUser);

      await userController.sendBulkInvitations(req, res, next);

      expect(userService.getUserByEmail).toHaveBeenCalled();
    });

    it('should handle non-HR users', async () => {
      const mockUser = { _id: 'user123', isHR: jest.fn().mockReturnValue(false) };
      
      userService.getUserById = jest.fn().mockResolvedValue(mockUser);
      User.mockImplementation(() => mockUser);

      await userController.sendBulkInvitations(req, res, next);
      await new Promise(resolve => setImmediate(resolve));

      expect(next).toHaveBeenCalledWith(expect.any(ForbiddenError));
    });

    it('should handle invalid emails array', async () => {
      const mockUser = { _id: 'user123', isHR: jest.fn().mockReturnValue(true) };
      req.body = { emails: null };

      userService.getUserById = jest.fn().mockResolvedValue(mockUser);
      User.mockImplementation(() => mockUser);

      await userController.sendBulkInvitations(req, res, next);
      await new Promise(resolve => setImmediate(resolve));

      expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
    });

    it('should handle invalid email format', async () => {
      const mockUser = { _id: 'user123', isHR: jest.fn().mockReturnValue(true) };
      req.body = {
        emails: ['invalid-email'],
        role: 'staff'
      };

      userService.getUserById = jest.fn().mockResolvedValue(mockUser);
      User.mockImplementation(() => mockUser);

      await userController.sendBulkInvitations(req, res, next);
      await new Promise(resolve => setImmediate(resolve));

      expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
    });

    it('should handle invalid role', async () => {
      const mockUser = { _id: 'user123', isHR: jest.fn().mockReturnValue(true) };
      req.body = {
        emails: ['122686006h@gmail.com'],
        role: 'invalid-role'
      };

      userService.getUserById = jest.fn().mockResolvedValue(mockUser);
      User.mockImplementation(() => mockUser);

      await userController.sendBulkInvitations(req, res, next);
      await new Promise(resolve => setImmediate(resolve));

      expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
    });

    it('should skip existing users', async () => {
      const mockUser = { _id: 'user123', isHR: jest.fn().mockReturnValue(true) };
      req.body = {
        emails: ['existing@example.com'],
        role: 'staff'
      };

      userService.getUserById = jest.fn().mockResolvedValue(mockUser);
      userService.getUserByEmail = jest.fn().mockResolvedValue({ id: 'existing' });
      User.mockImplementation(() => mockUser);

      await userController.sendBulkInvitations(req, res, next);

      expect(userService.getUserByEmail).toHaveBeenCalledWith('existing@example.com');
    });
  });
});
