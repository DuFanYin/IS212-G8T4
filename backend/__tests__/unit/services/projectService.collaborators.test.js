jest.mock('../../../src/repositories/ProjectRepository');
jest.mock('../../../src/repositories/UserRepository');
jest.mock('../../../src/repositories/TaskRepository');
jest.mock('../../../src/domain/Project');
jest.mock('../../../src/domain/User');

const ProjectRepository = require('../../../src/repositories/ProjectRepository');
const UserRepository = require('../../../src/repositories/UserRepository');
const TaskRepository = require('../../../src/repositories/TaskRepository');
const Project = require('../../../src/domain/Project');
const User = require('../../../src/domain/User');

describe('ProjectService - Collaborator Operations', () => {
  let projectService;
  let mockProjectRepository;
  let mockUserRepository;
  let mockTaskRepository;

  beforeEach(() => {
    // Create mock repositories
    mockProjectRepository = {
      findById: jest.fn(),
      addCollaborators: jest.fn(),
      removeCollaborators: jest.fn()
    };
    
    mockUserRepository = {
      findById: jest.fn()
    };

    mockTaskRepository = {};

    ProjectRepository.mockImplementation(() => mockProjectRepository);
    UserRepository.mockImplementation(() => mockUserRepository);
    TaskRepository.mockImplementation(() => mockTaskRepository);

    // Import the singleton service
    projectService = require('../../../src/services/projectService');
    
    // Replace the service's repositories with mocks
    projectService.projectRepository = mockProjectRepository;
    projectService.userRepository = mockUserRepository;
    projectService.taskRepository = mockTaskRepository;

    jest.clearAllMocks();
  });

  describe('addCollaborator', () => {
    it('should add collaborator successfully', async () => {
      const mockProjectDoc = { _id: 'project123', departmentId: 'dept123' };
      const mockProject = { _id: 'project123', departmentId: 'dept123' };
      const mockCollaboratorDoc = { _id: 'user123', departmentId: 'dept123' };
      
      // Mock the internal method calls
      const originalGetProjectDomainById = projectService.getProjectDomainById.bind(projectService);
      const originalValidateUser = projectService.validateUser.bind(projectService);
      
      projectService.getProjectDomainById = jest.fn().mockResolvedValue(mockProject);
      projectService.validateUser = jest.fn().mockResolvedValue(undefined);
      
      mockProjectRepository.findById.mockResolvedValue(mockProjectDoc);
      mockUserRepository.findById.mockResolvedValue(mockCollaboratorDoc);
      mockProjectRepository.addCollaborators.mockResolvedValue(mockProject);
      Project.mockImplementation(() => mockProject);

      const result = await projectService.addCollaborator('project123', 'user123', 'owner123');

      expect(result).toBeDefined();
    });

    it('should handle collaborator not found', async () => {
      const mockProject = { _id: 'project123' };
      
      projectService.getProjectDomainById = jest.fn().mockResolvedValue(mockProject);
      projectService.validateUser = jest.fn().mockResolvedValue(undefined);
      
      mockProjectRepository.findById.mockResolvedValue(mockProject);
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(
        projectService.addCollaborator('project123', 'user123', 'owner123')
      ).rejects.toThrow('Collaborator not found');
    });
  });

  describe('removeCollaborator', () => {
    it('should remove collaborator successfully', async () => {
      const mockProjectDoc = { _id: 'project123', ownerId: 'owner123', collaborators: ['user123'] };
      const mockCollaboratorDoc = { _id: 'user123' };
      const mockProject = { 
        _id: 'project123', 
        ownerId: 'owner123', 
        collaborators: ['user123'],
        isOwner: jest.fn().mockReturnValue(false)
      };
      
      projectService.getProjectDomainById = jest.fn().mockResolvedValue(mockProject);
      projectService.validateUser = jest.fn().mockResolvedValue(undefined);
      
      mockProjectRepository.findById.mockResolvedValue(mockProjectDoc);
      mockUserRepository.findById.mockResolvedValue(mockCollaboratorDoc);
      mockProjectRepository.removeCollaborators.mockResolvedValue(mockProjectDoc);
      User.mockImplementation(() => mockProject);
      Project.mockImplementation(() => mockProject);

      const result = await projectService.removeCollaborator('project123', 'user123', 'owner123');

      expect(result).toBeDefined();
    });

    it('should prevent removing project owner', async () => {
      const mockProject = { 
        _id: 'project123', 
        ownerId: 'user123',
        isOwner: jest.fn((id) => id === 'user123')
      };
      
      projectService.getProjectDomainById = jest.fn().mockResolvedValue(mockProject);
      projectService.validateUser = jest.fn().mockResolvedValue(undefined);
      
      Project.mockImplementation(() => mockProject);

      await expect(
        projectService.removeCollaborator('project123', 'user123', 'owner123')
      ).rejects.toThrow('Cannot remove project owner');
    });
  });
});

