// Mock dependencies before importing
jest.mock('../../../src/repositories/DepartmentRepository');
jest.mock('../../../src/repositories/TeamRepository');
jest.mock('../../../src/repositories/UserRepository');

describe('OrganizationService', () => {
  let organizationService;

  beforeEach(() => {
    organizationService = require('../../../src/services/organizationService');
    jest.clearAllMocks();
  });

  describe('getAllDepartments', () => {
    it('should return departments with statistics', async () => {
      // Mock the repository methods directly on the service instance
      organizationService.departmentRepository = {
        findAll: jest.fn().mockResolvedValue([
          { _id: 'dept1', name: 'Department 1', description: 'Desc 1', directorId: { name: 'Director 1' }, createdAt: new Date(), updatedAt: new Date() }
        ])
      };
      organizationService.teamRepository = {
        findByDepartment: jest.fn().mockResolvedValue([{ id: 'team1' }, { id: 'team2' }])
      };
      organizationService.userRepository = {
        findUsersByDepartment: jest.fn().mockResolvedValue([{ id: 'user1' }, { id: 'user2' }, { id: 'user3' }])
      };

      const result = await organizationService.getAllDepartments();

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 'dept1',
        name: 'Department 1',
        description: 'Desc 1',
        directorId: { name: 'Director 1' },
        directorName: 'Director 1',
        teamCount: 2,
        userCount: 3,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      });
    });

    it('should handle errors when fetching departments', async () => {
      organizationService.departmentRepository = {
        findAll: jest.fn().mockRejectedValue(new Error('Database error'))
      };

      await expect(organizationService.getAllDepartments()).rejects.toThrow('Error fetching departments: Database error');
    });
  });

  describe('getTeamsByDepartment', () => {
    it('should return teams with user counts', async () => {
      const departmentId = 'dept123';
      organizationService.teamRepository = {
        findByDepartment: jest.fn().mockResolvedValue([
          { _id: 'team1', name: 'Team 1', description: 'Desc 1', managerId: { name: 'Manager 1' }, createdAt: new Date(), updatedAt: new Date() }
        ])
      };
      organizationService.userRepository = {
        findUsersByTeam: jest.fn().mockResolvedValue([{ id: 'user1' }, { id: 'user2' }])
      };

      const result = await organizationService.getTeamsByDepartment(departmentId);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 'team1',
        name: 'Team 1',
        description: 'Desc 1',
        departmentId: undefined,
        managerId: { name: 'Manager 1' },
        managerName: 'Manager 1',
        userCount: 2,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      });
    });

    it('should handle errors when fetching teams', async () => {
      const departmentId = 'dept123';
      organizationService.teamRepository = {
        findByDepartment: jest.fn().mockRejectedValue(new Error('Database error'))
      };

      await expect(organizationService.getTeamsByDepartment(departmentId)).rejects.toThrow('Error fetching teams for department: Database error');
    });
  });

  describe('getAllTeams', () => {
    it('should return all teams with statistics', async () => {
      organizationService.teamRepository = {
        findAll: jest.fn().mockResolvedValue([
          { _id: 'team1', name: 'Team 1', description: 'Desc 1', departmentId: { name: 'Dept 1' }, managerId: { name: 'Manager 1' }, createdAt: new Date(), updatedAt: new Date() }
        ])
      };
      organizationService.userRepository = {
        findUsersByTeam: jest.fn().mockResolvedValue([{ id: 'user1' }, { id: 'user2' }])
      };

      const result = await organizationService.getAllTeams();

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 'team1',
        name: 'Team 1',
        description: 'Desc 1',
        departmentId: { name: 'Dept 1' },
        departmentName: 'Dept 1',
        managerId: { name: 'Manager 1' },
        managerName: 'Manager 1',
        userCount: 2,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      });
    });

    it('should handle errors when fetching all teams', async () => {
      organizationService.teamRepository = {
        findAll: jest.fn().mockRejectedValue(new Error('Database error'))
      };

      await expect(organizationService.getAllTeams()).rejects.toThrow('Error fetching all teams: Database error');
    });
  });
});
