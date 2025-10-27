const MetricsService = require('../../../src/services/metricsService');
const TaskModel = require('../../../src/db/models/Task');
const User = require('../../../src/domain/User');

jest.mock('../../../src/repositories/TaskRepository');
jest.mock('../../../src/repositories/DepartmentRepository');
jest.mock('../../../src/repositories/TeamRepository');
jest.mock('../../../src/repositories/UserRepository');
jest.mock('../../../src/db/models/Task');
jest.mock('../../../src/domain/User');

describe('MetricsService', () => {
  let taskRepository;
  let teamRepository;
  let userRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Get the mocked repositories from the module
    taskRepository = MetricsService.taskRepository;
    teamRepository = MetricsService.teamRepository;
    userRepository = MetricsService.userRepository;
  });

  describe('getTeamMetrics', () => {
    it('should return team metrics successfully', async () => {
      const mockUser = { canSeeDepartmentTasks: jest.fn().mockReturnValue(true) };
      const mockTeams = [{ _id: 'team1', name: 'Team 1' }];
      const mockTasks = [
        { _id: 'task1', status: 'ongoing', projectId: 'proj1', isDeleted: false },
        { _id: 'task2', status: 'completed', projectId: 'proj2', isDeleted: false }
      ];
      
      userRepository.findById = jest.fn().mockResolvedValue({ _id: 'user123' });
      User.mockImplementation(() => mockUser);
      teamRepository.findAll = jest.fn().mockResolvedValue(mockTeams);
      taskRepository.findTasksByTeam = jest.fn().mockResolvedValue(mockTasks);
      TaskModel.populate = jest.fn().mockResolvedValue(mockTasks);

      const metrics = await MetricsService.getTeamMetrics('user123');

      expect(Array.isArray(metrics)).toBe(true);
    });

    it('should handle errors when fetching team metrics', async () => {
      taskRepository.findTasksByTeam = jest.fn().mockRejectedValue(new Error('Database error'));

      await expect(MetricsService.getTeamMetrics('user123')).rejects.toThrow();
    });
  });

  describe('getSingleTeamMetrics', () => {
    it('should return single team metrics successfully', async () => {
      const mockUser = { canSeeTeamTasks: jest.fn().mockReturnValue(true) };
      const mockTasks = [
        { _id: 'task1', status: 'ongoing', projectId: 'proj1', isDeleted: false },
        { _id: 'task2', status: 'completed', projectId: 'proj2', isDeleted: false }
      ];
      
      userRepository.findById = jest.fn().mockResolvedValue({ _id: 'user123', teamId: 'team123' });
      User.mockImplementation(() => mockUser);
      taskRepository.findTasksByTeam = jest.fn().mockResolvedValue(mockTasks);
      TaskModel.populate = jest.fn().mockResolvedValue(mockTasks);

      const metrics = await MetricsService.getSingleTeamMetrics('user123', 'team123');

      expect(Array.isArray(metrics)).toBe(true);
    });

    it('should handle errors when fetching single team metrics', async () => {
      taskRepository.findTasksByTeam = jest.fn().mockRejectedValue(new Error('Database error'));

      await expect(MetricsService.getSingleTeamMetrics('user123', 'team123')).rejects.toThrow();
    });
  });

  describe('getPersonalMetrics', () => {
    it('should return personal metrics successfully', async () => {
      const mockUser = { teamId: 'team123', name: 'Test User' };
      const mockTasks = [
        { _id: 'task1', status: 'ongoing', projectId: 'proj1', isDeleted: false },
        { _id: 'task2', status: 'completed', projectId: 'proj2', isDeleted: false }
      ];
      
      userRepository.findById = jest.fn().mockResolvedValue(mockUser);
      User.mockImplementation(() => mockUser);
      taskRepository.findTasksByAssignee = jest.fn().mockResolvedValue([mockTasks[0]]);
      taskRepository.findTasksByTeam = jest.fn().mockResolvedValue([mockTasks[1]]);
      taskRepository.findTasksByCollaborator = jest.fn().mockResolvedValue([]);
      TaskModel.populate = jest.fn().mockResolvedValue(mockTasks);

      const metrics = await MetricsService.getPersonalMetrics('user123');

      expect(Array.isArray(metrics)).toBe(true);
    });

    it('should handle errors when fetching personal metrics', async () => {
      taskRepository.findTasksByAssignee = jest.fn().mockRejectedValue(new Error('Database error'));

      await expect(MetricsService.getPersonalMetrics('user123')).rejects.toThrow();
    });
  });
});

