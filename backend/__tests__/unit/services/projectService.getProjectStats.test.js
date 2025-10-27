jest.mock('../../../src/repositories/ProjectRepository');
jest.mock('../../../src/repositories/TaskRepository');
jest.mock('../../../src/repositories/UserRepository');
jest.mock('../../../src/domain/Project');
jest.mock('../../../src/domain/User');
jest.mock('../../../src/db/models/Task');

const ProjectRepository = require('../../../src/repositories/ProjectRepository');
const TaskRepository = require('../../../src/repositories/TaskRepository');
const UserRepository = require('../../../src/repositories/UserRepository');
const Project = require('../../../src/domain/Project');
const User = require('../../../src/domain/User');
const TaskModel = require('../../../src/db/models/Task');
const Task = require('../../../src/domain/Task');

describe('ProjectService - getProjectStats', () => {
  let projectService;
  let mockProjectRepository;
  let mockTaskRepository;
  let mockUserRepository;

  beforeEach(() => {
    // Create mock repositories
    mockProjectRepository = {
      findById: jest.fn()
    };
    
    mockTaskRepository = {
      findTasksByProject: jest.fn()
    };

    mockUserRepository = {
      findById: jest.fn()
    };

    ProjectRepository.mockImplementation(() => mockProjectRepository);
    TaskRepository.mockImplementation(() => mockTaskRepository);
    UserRepository.mockImplementation(() => mockUserRepository);

    // Import the singleton service
    projectService = require('../../../src/services/projectService');
    
    // Replace the service's repositories with mocks
    projectService.projectRepository = mockProjectRepository;
    projectService.taskRepository = mockTaskRepository;
    projectService.userRepository = mockUserRepository;

    jest.clearAllMocks();
  });

  it('should return project stats successfully', async () => {
    const mockUserDoc = { _id: 'user123', role: 'manager' };
    const mockUser = { canSeeAllTasks: jest.fn().mockReturnValue(true) };
    const mockProjectDoc = { _id: 'project123' };
    const mockProject = { canBeModifiedBy: jest.fn().mockReturnValue(false) };
    const mockTasks = [
      { status: 'completed' },
      { status: 'ongoing' },
      { status: 'unassigned' }
    ];

    mockUserRepository.findById.mockResolvedValue(mockUserDoc);
    mockProjectRepository.findById.mockResolvedValue(mockProjectDoc);
    mockTaskRepository.findTasksByProject.mockResolvedValue(mockTasks);
    
    // Mock populate
    TaskModel.populate = jest.fn().mockResolvedValue(mockTasks.map(t => ({ ...t, dueDate: null })));
    User.mockImplementation(() => mockUser);
    Project.mockImplementation(() => mockProject);

    const stats = await projectService.getProjectStats('project123', 'user123');

    expect(stats).toHaveProperty('total');
    expect(stats).toHaveProperty('completed');
    expect(stats).toHaveProperty('inProgress');
    expect(stats).toHaveProperty('overdue');
    expect(stats).toHaveProperty('unassigned');
  });

  it('should handle errors when user not found', async () => {
    mockUserRepository.findById.mockResolvedValue(null);

    await expect(projectService.getProjectStats('project123', 'user123')).rejects.toThrow();
  });

  it('should handle errors when project not found', async () => {
    const mockUserDoc = { _id: 'user123', role: 'manager' };
    const mockUser = { canSeeAllTasks: jest.fn().mockReturnValue(true) };
    
    mockUserRepository.findById.mockResolvedValue(mockUserDoc);
    mockProjectRepository.findById.mockResolvedValue(null);
    
    User.mockImplementation(() => mockUser);

    await expect(projectService.getProjectStats('project123', 'user123')).rejects.toThrow();
  });
});

