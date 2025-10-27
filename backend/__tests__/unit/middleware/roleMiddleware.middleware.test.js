const roleMiddleware = require('../../../src/middleware/roleMiddleware');
const UserRepository = require('../../../src/repositories/UserRepository');
const User = require('../../../src/domain/User');

jest.mock('../../../src/repositories/UserRepository');
jest.mock('../../../src/domain/User');

describe('RoleMiddleware - Middleware Functions', () => {
  let req, res, next;
  let mockUserRepository;

  beforeEach(() => {
    mockUserRepository = {
      findById: jest.fn()
    };

    UserRepository.mockImplementation(() => mockUserRepository);

    req = {
      user: { userId: 'user123' },
      body: {},
      params: {}
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };

    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('requireRole', () => {
    it('should allow access for authorized role', async () => {
      const mockUser = { role: 'manager' };
      const mockUserDoc = { _id: 'user123', role: 'manager' };

      mockUserRepository.findById.mockResolvedValue(mockUserDoc);
      User.mockImplementation(() => mockUser);

      const middleware = roleMiddleware.requireRole('manager', 'director');
      await middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
      expect(req.userDomain).toBeDefined();
    });

    it('should deny access for unauthorized role', async () => {
      const mockUser = { role: 'staff' };
      const mockUserDoc = { _id: 'user123', role: 'staff' };

      mockUserRepository.findById.mockResolvedValue(mockUserDoc);
      User.mockImplementation(() => mockUser);

      const middleware = roleMiddleware.requireRole('manager', 'director');
      await middleware(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Insufficient permissions'
      });
    });

    it('should return 401 when user not authenticated', async () => {
      req.user = null;

      const middleware = roleMiddleware.requireRole('manager');
      await middleware(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Not authenticated'
      });
    });

    it('should return 401 when userId missing', async () => {
      req.user = {};

      const middleware = roleMiddleware.requireRole('manager');
      await middleware(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('should handle errors and return 500', async () => {
      mockUserRepository.findById.mockRejectedValue(new Error('Database error'));

      const middleware = roleMiddleware.requireRole('manager');
      await middleware(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Database error'
      });
    });
  });

  describe('requireTaskManagement', () => {
    it('should allow access for manager', async () => {
      const mockUser = { 
        role: 'manager',
        canManageTasks: jest.fn().mockReturnValue(true)
      };
      const mockUserDoc = { _id: 'user123', role: 'manager' };

      mockUserRepository.findById.mockResolvedValue(mockUserDoc);
      User.mockImplementation(() => mockUser);

      const middleware = roleMiddleware.requireTaskManagement();
      await middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
      expect(req.userDomain).toBeDefined();
    });

    it('should allow access for HR', async () => {
      const mockUser = { 
        role: 'hr',
        canManageTasks: jest.fn().mockReturnValue(true)
      };
      const mockUserDoc = { _id: 'user123', role: 'hr' };

      mockUserRepository.findById.mockResolvedValue(mockUserDoc);
      User.mockImplementation(() => mockUser);

      const middleware = roleMiddleware.requireTaskManagement();
      await middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.userDomain).toBeDefined();
    });

    it('should deny access for staff', async () => {
      const mockUser = { 
        role: 'staff',
        canManageTasks: jest.fn().mockReturnValue(false)
      };
      const mockUserDoc = { _id: 'user123', role: 'staff' };

      mockUserRepository.findById.mockResolvedValue(mockUserDoc);
      User.mockImplementation(() => mockUser);

      const middleware = roleMiddleware.requireTaskManagement();
      await middleware(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Insufficient permissions to manage tasks'
      });
    });

    it('should return 401 when user not authenticated', async () => {
      req.user = null;

      const middleware = roleMiddleware.requireTaskManagement();
      await middleware(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Not authenticated'
      });
    });

    it('should return 401 when userId missing', async () => {
      req.user = {};

      const middleware = roleMiddleware.requireTaskManagement();
      await middleware(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('should handle errors and return 500', async () => {
      mockUserRepository.findById.mockRejectedValue(new Error('Database error'));

      const middleware = roleMiddleware.requireTaskManagement();
      await middleware(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Database error'
      });
    });

    it('should handle user not found error', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      const middleware = roleMiddleware.requireTaskManagement();
      await middleware(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'User not found'
      });
    });
  });
});

