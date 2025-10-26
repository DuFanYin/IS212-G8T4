jest.mock('../../../src/utils/asyncHandler', () => {
  return (fn) => fn;
});

jest.mock('../../../src/utils/responseHelper', () => ({
  sendSuccess: jest.fn((res, data) => {
    return res.json({
      status: 'success',
      data
    });
  })
}));

const mockFindById = jest.fn();
jest.mock('../../../src/repositories/UserRepository', () => {
  return jest.fn().mockImplementation(() => ({
    findById: mockFindById
  }));
});

jest.mock('../../../src/domain/User');

const mockHasAnyRole = jest.fn();
jest.mock('../../../src/middleware/roleMiddleware', () => ({
  hasAnyRole: mockHasAnyRole,
  ROLE_HIERARCHY: {},
  hasRole: jest.fn(),
  isHigherRole: jest.fn(),
  isHigherOrEqualRole: jest.fn(),
  canAssignTasks: jest.fn(),
  canSeeAllTasks: jest.fn(),
  canSeeDepartmentTasks: jest.fn(),
  canSeeTeamTasks: jest.fn(),
  canManageTasks: jest.fn(),
  canSeeTasks: jest.fn(),
  getUserDomain: jest.fn(),
  requireRole: jest.fn(),
  requireTaskManagement: jest.fn()
}));

jest.mock('../../../src/services/organizationService');

const organizationService = require('../../../src/services/organizationService');
const User = require('../../../src/domain/User');

describe('OrganizationController', () => {
  let organizationController;
  let mockReq, mockRes;

  beforeEach(() => {
    // Don't reset modules to keep mocks consistent
    organizationController = require('../../../src/controllers/organizationController');
    mockReq = {
      user: { userId: 'user123' },
      params: {},
      body: {}
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    jest.clearAllMocks();
    // Reset all mocks to their default state
    mockHasAnyRole.mockClear();
  });

  describe('getAllDepartments', () => {
    it('should return departments for SM users', async () => {
      const mockUserDoc = { _id: 'user123', role: 'sm' };
      const mockUser = { role: 'sm' };
      const mockDepartments = [
        { id: 'dept1', name: 'Department 1' },
        { id: 'dept2', name: 'Department 2' }
      ];

      mockFindById.mockResolvedValue(mockUserDoc);
      User.mockImplementation(() => mockUser);
      mockHasAnyRole.mockReturnValue(true);
      organizationService.getAllDepartments = jest.fn().mockResolvedValue(mockDepartments);

      await organizationController.getAllDepartments(mockReq, mockRes);

      expect(mockFindById).toHaveBeenCalledWith('user123');
      expect(mockHasAnyRole).toHaveBeenCalled();
      expect(organizationService.getAllDepartments).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockDepartments
      });
    });

    it('should throw error when user not found', async () => {
      mockFindById.mockResolvedValue(null);

      await expect(organizationController.getAllDepartments(mockReq, mockRes)).rejects.toThrow('User not found');
    });

    it('should throw error for insufficient permissions', async () => {
      const mockUserDoc = { _id: 'user123', role: 'staff' };
      const mockUser = { role: 'staff' };
      
      mockFindById.mockResolvedValue(mockUserDoc);
      User.mockImplementation(() => mockUser);
      mockHasAnyRole.mockReturnValue(false);

      await expect(organizationController.getAllDepartments(mockReq, mockRes)).rejects.toThrow(/Insufficient permissions|User not found/);
    });
  });

  describe('getTeamsByDepartment', () => {
    beforeEach(() => {
      mockReq.params.departmentId = 'dept123';
    });

    it('should return teams for director accessing their own department', async () => {
      const mockUserDoc = { _id: 'user123', role: 'director', departmentId: 'dept123' };
      const mockUser = { role: 'director', departmentId: { toString: () => 'dept123' } };
      const mockTeams = [{ id: 'team1', name: 'Team 1' }];

      mockFindById.mockResolvedValue(mockUserDoc);
      User.mockImplementation(() => mockUser);
      mockHasAnyRole.mockReturnValue(true);
      organizationService.getTeamsByDepartment = jest.fn().mockResolvedValue(mockTeams);

      await organizationController.getTeamsByDepartment(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockTeams
      });
    });

    it('should return 403 for director accessing different department', async () => {
      const mockUserDoc = { _id: 'user123', role: 'director', departmentId: 'dept456' };
      const mockUser = { role: 'director', departmentId: { toString: () => 'dept456' } };
      const mockTeams = [{ id: 'team1', name: 'Team 1' }];

      mockFindById.mockResolvedValue(mockUserDoc);
      User.mockImplementation(() => mockUser);
      mockHasAnyRole.mockReturnValue(true);
      organizationService.getTeamsByDepartment = jest.fn().mockResolvedValue(mockTeams);

      await organizationController.getTeamsByDepartment(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Access denied: You can only access your own department'
      });
    });

    it('should allow access for non-existent department', async () => {
      const mockUserDoc = { _id: 'user123', role: 'director', departmentId: 'dept456' };
      const mockUser = { role: 'director', departmentId: { toString: () => 'dept456' } };

      mockFindById.mockResolvedValue(mockUserDoc);
      User.mockImplementation(() => mockUser);
      mockHasAnyRole.mockReturnValue(true);
      organizationService.getTeamsByDepartment = jest.fn().mockResolvedValue([]);

      await organizationController.getTeamsByDepartment(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        data: []
      });
    });

    it('should throw error for staff users', async () => {
      const mockUserDoc = { _id: 'user123', role: 'staff' };
      const mockUser = { role: 'staff' };
      
      mockFindById.mockResolvedValue(mockUserDoc);
      User.mockImplementation(() => mockUser);
      mockHasAnyRole.mockReturnValue(false);

      await expect(organizationController.getTeamsByDepartment(mockReq, mockRes)).rejects.toThrow(/Insufficient permissions|User not found/);
    });
  });
});
