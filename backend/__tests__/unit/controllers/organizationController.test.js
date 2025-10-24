// Mock dependencies before importing
jest.mock('../../../src/services/organizationService');
jest.mock('../../../src/db/models');

const organizationService = require('../../../src/services/organizationService');
const { User } = require('../../../src/db/models');

describe('OrganizationController', () => {
  let organizationController;
  let mockReq, mockRes;

  beforeEach(() => {
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
  });

  describe('getAllDepartments', () => {
    it('should return departments for SM users', async () => {
      const mockUser = { _id: 'user123', role: 'sm' };
      const mockDepartments = [
        { id: 'dept1', name: 'Department 1' },
        { id: 'dept2', name: 'Department 2' }
      ];

      User.findById.mockResolvedValue(mockUser);
      organizationService.getAllDepartments.mockResolvedValue(mockDepartments);

      await organizationController.getAllDepartments(mockReq, mockRes);

      expect(User.findById).toHaveBeenCalledWith('user123');
      expect(organizationService.getAllDepartments).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockDepartments
      });
    });

    it('should return departments for HR users', async () => {
      const mockUser = { _id: 'user123', role: 'hr' };
      const mockDepartments = [{ id: 'dept1', name: 'Department 1' }];

      User.findById.mockResolvedValue(mockUser);
      organizationService.getAllDepartments.mockResolvedValue(mockDepartments);

      await organizationController.getAllDepartments(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockDepartments
      });
    });

    it('should return 403 when user not found', async () => {
      User.findById.mockResolvedValue(null);

      await organizationController.getAllDepartments(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'User not found'
      });
    });

    it('should return 403 for insufficient permissions', async () => {
      const mockUser = { _id: 'user123', role: 'staff' };
      User.findById.mockResolvedValue(mockUser);

      await organizationController.getAllDepartments(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Insufficient permissions'
      });
    });

    it('should handle service errors', async () => {
      const mockUser = { _id: 'user123', role: 'sm' };
      User.findById.mockResolvedValue(mockUser);
      organizationService.getAllDepartments.mockRejectedValue(new Error('Service error'));

      await organizationController.getAllDepartments(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Service error'
      });
    });
  });

  describe('getTeamsByDepartment', () => {
    beforeEach(() => {
      mockReq.params.departmentId = 'dept123';
    });

    it('should return teams for director accessing their own department', async () => {
      const mockUser = { _id: 'user123', role: 'director', departmentId: 'dept123' };
      const mockTeams = [{ id: 'team1', name: 'Team 1' }];

      User.findById.mockResolvedValue(mockUser);
      organizationService.getTeamsByDepartment.mockResolvedValue(mockTeams);

      await organizationController.getTeamsByDepartment(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockTeams
      });
    });

    it('should return 403 for director accessing different department', async () => {
      const mockUser = { _id: 'user123', role: 'director', departmentId: 'dept456' };
      const mockTeams = [{ id: 'team1', name: 'Team 1' }];

      User.findById.mockResolvedValue(mockUser);
      organizationService.getTeamsByDepartment.mockResolvedValue(mockTeams);

      await organizationController.getTeamsByDepartment(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Access denied: You can only access your own department'
      });
    });

    it('should allow access for non-existent department', async () => {
      const mockUser = { _id: 'user123', role: 'director', departmentId: 'dept456' };

      User.findById.mockResolvedValue(mockUser);
      organizationService.getTeamsByDepartment.mockResolvedValue([]);

      await organizationController.getTeamsByDepartment(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        data: []
      });
    });

    it('should return teams for manager users', async () => {
      const mockUser = { _id: 'user123', role: 'manager' };
      const mockTeams = [{ id: 'team1', name: 'Team 1' }];

      User.findById.mockResolvedValue(mockUser);
      organizationService.getTeamsByDepartment.mockResolvedValue(mockTeams);

      await organizationController.getTeamsByDepartment(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockTeams
      });
    });

    it('should return teams for SM users', async () => {
      const mockUser = { _id: 'user123', role: 'sm' };
      const mockTeams = [{ id: 'team1', name: 'Team 1' }];

      User.findById.mockResolvedValue(mockUser);
      organizationService.getTeamsByDepartment.mockResolvedValue(mockTeams);

      await organizationController.getTeamsByDepartment(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockTeams
      });
    });

    it('should return teams for HR users', async () => {
      const mockUser = { _id: 'user123', role: 'hr' };
      const mockTeams = [{ id: 'team1', name: 'Team 1' }];

      User.findById.mockResolvedValue(mockUser);
      organizationService.getTeamsByDepartment.mockResolvedValue(mockTeams);

      await organizationController.getTeamsByDepartment(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockTeams
      });
    });

    it('should return 403 for staff users', async () => {
      const mockUser = { _id: 'user123', role: 'staff' };
      User.findById.mockResolvedValue(mockUser);

      await organizationController.getTeamsByDepartment(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Insufficient permissions'
      });
    });

    it('should handle service errors', async () => {
      const mockUser = { _id: 'user123', role: 'manager' };
      User.findById.mockResolvedValue(mockUser);
      organizationService.getTeamsByDepartment.mockRejectedValue(new Error('Service error'));

      await organizationController.getTeamsByDepartment(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Service error'
      });
    });
  });
});
