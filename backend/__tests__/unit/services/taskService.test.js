// Mock dependencies before importing
jest.mock('../../../src/repositories/TaskRepository');
jest.mock('../../../src/repositories/UserRepository');
jest.mock('../../../src/repositories/ProjectRepository');
jest.mock('../../../src/repositories/SubtaskRepository');
jest.mock('../../../src/domain/Task');
jest.mock('../../../src/domain/User');
jest.mock('../../../src/services/projectService');
jest.mock('../../../src/services/activityLogService');
jest.mock('../../../src/db/models/Task');

const TaskRepository = require('../../../src/repositories/TaskRepository');
const UserRepository = require('../../../src/repositories/UserRepository');
const ProjectRepository = require('../../../src/repositories/ProjectRepository');
const SubtaskRepository = require('../../../src/repositories/SubtaskRepository');
const Task = require('../../../src/domain/Task');
const User = require('../../../src/domain/User');
const projectService = require('../../../src/services/projectService');
const activityLogService = require('../../../src/services/activityLogService');
const TaskModel = require('../../../src/db/models/Task');

describe('TaskService', () => {
  let mockTaskRepository;
  let mockUserRepository;
  let mockProjectRepository;
  let mockSubtaskRepository;
  let taskService;

  beforeEach(() => {
    mockTaskRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      updateById: jest.fn(),
      assignTask: jest.fn(),
      updateStatus: jest.fn(),
      softDelete: jest.fn(),
      setProjects: jest.fn(),
      findTasksByAssignee: jest.fn(),
      findTasksByCreator: jest.fn(),
      findTasksByProject: jest.fn(),
      findTasksByTeam: jest.fn(),
      findTasksByDepartment: jest.fn(),
      findUnassignedTasks: jest.fn(),
      findTasksByCollaborator: jest.fn(),
      findActiveTasks: jest.fn()
    };

    mockUserRepository = {
      findById: jest.fn()
    };

    mockProjectRepository = {
      findById: jest.fn(),
      addCollaborators: jest.fn()
    };

    mockSubtaskRepository = {
      findByParentTask: jest.fn()
    };

    TaskRepository.mockImplementation(() => mockTaskRepository);
    UserRepository.mockImplementation(() => mockUserRepository);
    ProjectRepository.mockImplementation(() => mockProjectRepository);
    SubtaskRepository.mockImplementation(() => mockSubtaskRepository);

    // Mock TaskModel.populate
    TaskModel.populate = jest.fn();

    // Import the singleton service after mocking
    taskService = require('../../../src/services/taskService');
    
    // Replace the service's repository with our mock
    taskService.taskRepository = mockTaskRepository;
    
    jest.clearAllMocks();
  });

  describe('validatePriority', () => {
    it('should validate priority successfully', () => {
      expect(() => taskService.validatePriority(5)).not.toThrow();
    });

    it('should throw error when priority is undefined', () => {
      expect(() => taskService.validatePriority(undefined))
        .toThrow('Task priority must be provided');
    });

    it('should throw error when priority is null', () => {
      expect(() => taskService.validatePriority(null))
        .toThrow('Task priority must be provided');
    });

    it('should throw error when priority is out of range', () => {
      expect(() => taskService.validatePriority(0))
        .toThrow('Task priority must be a number between 1 and 10 (inclusive)');
      expect(() => taskService.validatePriority(11))
        .toThrow('Task priority must be a number between 1 and 10 (inclusive)');
    });

    it('should throw error when priority is not a number', () => {
      expect(() => taskService.validatePriority('5'))
        .toThrow('Task priority must be a number between 1 and 10 (inclusive)');
    });
  });

  describe('mapPopulatedTaskDocToDTO', () => {
    it('should map populated task document to DTO', () => {
      const mockTaskDoc = {
        _id: 'task1',
        title: 'Test Task',
        description: 'Test Description',
        assigneeId: { _id: 'user1', name: 'User 1' },
        createdBy: { _id: 'creator1', name: 'Creator 1' },
        collaborators: [{ _id: 'collab1', name: 'Collab 1' }],
        projectId: { _id: 'project1', name: 'Project 1' }
      };

      const result = taskService.mapPopulatedTaskDocToDTO(mockTaskDoc);

      expect(result).toEqual({
        id: 'task1',
        title: 'Test Task',
        description: 'Test Description',
        dueDate: undefined,
        status: undefined,
        priority: undefined,
        createdBy: 'creator1',
        createdByName: 'Creator 1',
        assigneeId: 'user1',
        assigneeName: 'User 1',
        projectId: 'project1',
        projectName: 'Project 1',
        attachments: [],
        collaborators: ['collab1'],
        collaboratorNames: ['Collab 1'],
        lastStatusUpdate: undefined,
        isDeleted: undefined,
        createdAt: undefined,
        updatedAt: undefined
      });
    });
  });

  describe('buildEnrichedTaskDTO', () => {
    it('should build enriched DTO successfully', async () => {
      const mockTask = {
        toDTO: jest.fn().mockReturnValue({
          id: 'task1',
          projectId: 'project1',
          assigneeId: 'user1',
          createdBy: 'creator1',
          collaborators: ['collab1']
        })
      };
      const mockActivityLog = { id: 'log1' };

      projectService.getProjectById.mockResolvedValue({ name: 'Project 1' });
      mockUserRepository.findById
        .mockResolvedValueOnce({ name: 'User 1' })
        .mockResolvedValueOnce({ name: 'Creator 1' })
        .mockResolvedValueOnce({ name: 'Collab 1' });

      const result = await taskService.buildEnrichedTaskDTO(mockTask, mockActivityLog);

      expect(result).toEqual({
        id: 'task1',
        projectId: 'project1',
        assigneeId: 'user1',
        createdBy: 'creator1',
        collaborators: ['collab1'],
        projectName: 'Project 1',
        assigneeName: 'User 1',
        createdByName: 'Creator 1',
        collaboratorNames: ['Collab 1'],
        activityLogId: 'log1'
      });
    });

    it('should handle errors gracefully and return fallback DTO', async () => {
      const mockTask = {
        toDTO: jest.fn().mockReturnValue({ id: 'task1' })
      };

      projectService.getProjectById.mockRejectedValue(new Error('Project not found'));
      mockUserRepository.findById.mockRejectedValue(new Error('User not found'));

      const result = await taskService.buildEnrichedTaskDTO(mockTask, null);

      expect(result).toEqual({ id: 'task1' });
    });
  });

  describe('isVisibleToUser', () => {
    it('should return true for HR/SM users', async () => {
      const mockTaskDoc = { _id: 'task1' };
      const mockUserDoc = { _id: 'user1' };
      const mockTask = {};
      const mockUser = { canSeeAllTasks: jest.fn().mockReturnValue(true) };

      mockTaskRepository.findById.mockResolvedValue(mockTaskDoc);
      mockUserRepository.findById.mockResolvedValue(mockUserDoc);
      Task.mockImplementation(() => mockTask);
      User.mockImplementation(() => mockUser);

      const result = await taskService.isVisibleToUser('task1', 'user1');

      expect(result).toBe(true);
    });

    it('should return false when task not found', async () => {
      mockTaskRepository.findById.mockResolvedValue(null);

      const result = await taskService.isVisibleToUser('task1', 'user1');

      expect(result).toBe(false);
    });

    it('should return false when user not found', async () => {
      const mockTaskDoc = { _id: 'task1' };
      const mockTask = {};

      mockTaskRepository.findById.mockResolvedValue(mockTaskDoc);
      mockUserRepository.findById.mockResolvedValue(null);
      Task.mockImplementation(() => mockTask);

      const result = await taskService.isVisibleToUser('task1', 'user1');

      expect(result).toBe(false);
    });

    it('should return false when error occurs', async () => {
      mockTaskRepository.findById.mockRejectedValue(new Error('Database error'));

      const result = await taskService.isVisibleToUser('task1', 'user1');

      expect(result).toBe(false);
    });
  });

  describe('getTasksByAssignee', () => {
    it('should get tasks by assignee successfully', async () => {
      const mockTaskDocs = [{ _id: 'task1' }, { _id: 'task2' }];
      const mockTasks = [{ id: 'task1' }, { id: 'task2' }];

      mockTaskRepository.findTasksByAssignee.mockResolvedValue(mockTaskDocs);
      Task.mockImplementation((doc) => ({ id: doc._id }));

      const result = await taskService.getTasksByAssignee('user1');

      expect(result).toEqual(mockTasks);
      expect(mockTaskRepository.findTasksByAssignee).toHaveBeenCalledWith('user1');
    });

    it('should throw error when repository fails', async () => {
      const error = new Error('Database error');
      mockTaskRepository.findTasksByAssignee.mockRejectedValue(error);

      await expect(taskService.getTasksByAssignee('user1'))
        .rejects.toThrow('Error fetching tasks by assignee');
    });
  });

  describe('getTasksByCreator', () => {
    it('should get tasks by creator successfully', async () => {
      const mockTaskDocs = [{ _id: 'task1' }];
      const mockTasks = [{ id: 'task1' }];

      mockTaskRepository.findTasksByCreator.mockResolvedValue(mockTaskDocs);
      Task.mockImplementation((doc) => ({ id: doc._id }));

      const result = await taskService.getTasksByCreator('creator1');

      expect(result).toEqual(mockTasks);
      expect(mockTaskRepository.findTasksByCreator).toHaveBeenCalledWith('creator1');
    });

    it('should throw error when repository fails', async () => {
      const error = new Error('Database error');
      mockTaskRepository.findTasksByCreator.mockRejectedValue(error);

      await expect(taskService.getTasksByCreator('creator1'))
        .rejects.toThrow('Error fetching tasks by creator');
    });
  });

  describe('getTasksByCollaborator', () => {
    it('should get tasks by collaborator successfully', async () => {
      const mockTaskDocs = [{ _id: 'task1' }];
      const mockTasks = [{ id: 'task1' }];

      mockTaskRepository.findTasksByCollaborator.mockResolvedValue(mockTaskDocs);
      Task.mockImplementation((doc) => ({ id: doc._id }));

      const result = await taskService.getTasksByCollaborator('collab1');

      expect(result).toEqual(mockTasks);
      expect(mockTaskRepository.findTasksByCollaborator).toHaveBeenCalledWith('collab1');
    });

    it('should throw error when repository fails', async () => {
      const error = new Error('Database error');
      mockTaskRepository.findTasksByCollaborator.mockRejectedValue(error);

      await expect(taskService.getTasksByCollaborator('collab1'))
        .rejects.toThrow('Error fetching tasks by collaborator');
    });
  });

  describe('getById', () => {
    it('should get task by id successfully', async () => {
      const mockTaskDoc = {
        _id: 'task1',
        title: 'Test Task',
        populate: jest.fn().mockResolvedValue({
          _id: 'task1',
          title: 'Test Task',
          assigneeId: { _id: 'user1', name: 'User 1' }
        })
      };

      mockTaskRepository.findById.mockResolvedValue(mockTaskDoc);
      TaskModel.populate.mockResolvedValue({
        _id: 'task1',
        title: 'Test Task',
        assigneeId: { _id: 'user1', name: 'User 1' },
        createdBy: { _id: 'creator1', name: 'Creator 1' },
        collaborators: [{ _id: 'collab1', name: 'Collab 1' }],
        projectId: { _id: 'project1', name: 'Project 1' }
      });

      const result = await taskService.getById('task1');

      expect(result.id).toBe('task1');
      expect(result.title).toBe('Test Task');
      expect(mockTaskRepository.findById).toHaveBeenCalledWith('task1');
    });

    it('should throw error when task not found', async () => {
      mockTaskRepository.findById.mockResolvedValue(null);

      await expect(taskService.getById('task1'))
        .rejects.toThrow('Error fetching task');
    });

    it('should throw error when repository fails', async () => {
      const error = new Error('Database error');
      mockTaskRepository.findById.mockRejectedValue(error);

      await expect(taskService.getById('task1'))
        .rejects.toThrow('Error fetching task');
    });
  });

  describe('setTaskProjects', () => {
    it('should set task projects successfully', async () => {
      const mockTaskDoc = {
        _id: 'task1',
        populate: jest.fn().mockResolvedValue({
          _id: 'task1',
          title: 'Test Task',
          projects: [{ _id: 'project1', name: 'Project 1' }]
        })
      };
      const mockTask = { canBeEditedBy: jest.fn().mockReturnValue(true) };

      mockTaskRepository.findById.mockResolvedValue(mockTaskDoc);
      mockTaskRepository.setProjects.mockResolvedValue(mockTaskDoc);
      TaskModel.populate.mockResolvedValue({
        _id: 'task1',
        title: 'Test Task',
        assigneeId: { _id: 'user1', name: 'User 1' },
        createdBy: { _id: 'creator1', name: 'Creator 1' },
        collaborators: [{ _id: 'collab1', name: 'Collab 1' }],
        projectId: { _id: 'project1', name: 'Project 1' },
        projects: [{ _id: 'project1', name: 'Project 1' }]
      });
      Task.mockImplementation(() => mockTask);

      const result = await taskService.setTaskProjects('task1', ['project1'], 'user1');

      expect(result.id).toBe('task1');
      expect(mockTaskRepository.setProjects).toHaveBeenCalledWith('task1', ['project1']);
    });

    it('should throw error when task not found', async () => {
      mockTaskRepository.findById.mockResolvedValue(null);

      await expect(taskService.setTaskProjects('task1', ['project1'], 'user1'))
        .rejects.toThrow('Task not found');
    });

    it('should throw error when not authorized', async () => {
      const mockTaskDoc = { _id: 'task1' };
      const mockTask = { canBeEditedBy: jest.fn().mockReturnValue(false) };

      mockTaskRepository.findById.mockResolvedValue(mockTaskDoc);
      Task.mockImplementation(() => mockTask);

      await expect(taskService.setTaskProjects('task1', ['project1'], 'user1'))
        .rejects.toThrow('Not authorized to edit this task');
    });
  });
});
