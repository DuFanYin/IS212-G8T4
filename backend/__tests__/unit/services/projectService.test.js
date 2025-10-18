// Mock dependencies before importing
jest.mock('../../../src/repositories/ProjectRepository');
jest.mock('../../../src/repositories/UserRepository');
jest.mock('../../../src/repositories/TaskRepository');
jest.mock('../../../src/domain/Project');
jest.mock('../../../src/domain/User');
jest.mock('../../../src/db/models/Project');

const ProjectRepository = require('../../../src/repositories/ProjectRepository');
const UserRepository = require('../../../src/repositories/UserRepository');
const TaskRepository = require('../../../src/repositories/TaskRepository');
const Project = require('../../../src/domain/Project');
const User = require('../../../src/domain/User');
const ProjectModel = require('../../../src/db/models/Project');

describe('ProjectService', () => {
  let mockProjectRepository;
  let mockUserRepository;
  let mockTaskRepository;
  let projectService;

  beforeEach(() => {
    mockProjectRepository = {
      findById: jest.fn(),
      create: jest.fn(),
      findAllProjects: jest.fn(),
      findActiveProjects: jest.fn(),
      findProjectsByDepartment: jest.fn(),
      findProjectsByOwner: jest.fn(),
      findProjectsByCollaborator: jest.fn(),
      updateById: jest.fn(),
      addCollaborators: jest.fn(),
      removeCollaborators: jest.fn()
    };

    mockUserRepository = {
      findById: jest.fn()
    };

    mockTaskRepository = {
      countByStatusForProject: jest.fn()
    };

    ProjectRepository.mockImplementation(() => mockProjectRepository);
    UserRepository.mockImplementation(() => mockUserRepository);
    TaskRepository.mockImplementation(() => mockTaskRepository);

    // Mock ProjectModel.populate
    ProjectModel.populate = jest.fn();

    // Import the singleton service after mocking
    projectService = require('../../../src/services/projectService');
    
    // Replace the service's repositories with our mocks
    projectService.projectRepository = mockProjectRepository;
    projectService.userRepository = mockUserRepository;
    projectService.taskRepository = mockTaskRepository;
    
    jest.clearAllMocks();
  });

  describe('getProjectProgress', () => {
    it('should get project progress for authorized user', async () => {
      const mockProjectDoc = { _id: 'project1', name: 'Test Project' };
      const mockUserDoc = { _id: 'user1', name: 'Test User' };
      const mockProject = { canBeModifiedBy: jest.fn().mockReturnValue(true) };
      const mockUser = { canSeeAllTasks: jest.fn().mockReturnValue(false) };
      const mockProgress = { total: 10, completed: 5 };

      mockProjectRepository.findById.mockResolvedValue(mockProjectDoc);
      mockUserRepository.findById.mockResolvedValue(mockUserDoc);
      mockTaskRepository.countByStatusForProject.mockResolvedValue(mockProgress);
      Project.mockImplementation(() => mockProject);
      User.mockImplementation(() => mockUser);

      const result = await projectService.getProjectProgress('project1', 'user1');

      expect(result).toBe(mockProgress);
      expect(mockProjectRepository.findById).toHaveBeenCalledWith('project1');
      expect(mockUserRepository.findById).toHaveBeenCalledWith('user1');
      expect(mockTaskRepository.countByStatusForProject).toHaveBeenCalledWith('project1');
    });

    it('should throw error when user not found', async () => {
      mockProjectRepository.findById.mockResolvedValue({});
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(projectService.getProjectProgress('project1', 'user1'))
        .rejects.toThrow('User not found');
    });

    it('should throw error when not authorized', async () => {
      const mockProjectDoc = { _id: 'project1' };
      const mockUserDoc = { _id: 'user1' };
      const mockProject = { canBeModifiedBy: jest.fn().mockReturnValue(false) };
      const mockUser = { canSeeAllTasks: jest.fn().mockReturnValue(false) };

      mockProjectRepository.findById.mockResolvedValue(mockProjectDoc);
      mockUserRepository.findById.mockResolvedValue(mockUserDoc);
      Project.mockImplementation(() => mockProject);
      User.mockImplementation(() => mockUser);

      await expect(projectService.getProjectProgress('project1', 'user1'))
        .rejects.toThrow('Not Authorized');
    });
  });

  describe('buildEnrichedProjectDTO', () => {
    it('should build enriched DTO with owner and collaborator names', async () => {
      const mockProject = {
        toDTO: jest.fn().mockReturnValue({
          id: 'project1',
          ownerId: 'owner1',
          collaborators: ['collab1', 'collab2']
        })
      };
      const mockOwnerDoc = { name: 'Owner Name' };
      const mockCollabDoc1 = { name: 'Collab 1' };
      const mockCollabDoc2 = { name: 'Collab 2' };

      mockUserRepository.findById
        .mockResolvedValueOnce(mockOwnerDoc)
        .mockResolvedValueOnce(mockCollabDoc1)
        .mockResolvedValueOnce(mockCollabDoc2);

      const result = await projectService.buildEnrichedProjectDTO(mockProject);

      expect(result).toEqual({
        id: 'project1',
        ownerId: 'owner1',
        collaborators: ['collab1', 'collab2'],
        ownerName: 'Owner Name',
        collaboratorNames: ['Collab 1', 'Collab 2']
      });
    });

    it('should handle errors gracefully when fetching names', async () => {
      const mockProject = {
        toDTO: jest.fn().mockReturnValue({
          id: 'project1',
          ownerId: 'owner1',
          collaborators: ['collab1']
        })
      };

      mockUserRepository.findById.mockRejectedValue(new Error('User not found'));

      const result = await projectService.buildEnrichedProjectDTO(mockProject);

      expect(result).toEqual({
        id: 'project1',
        ownerId: 'owner1',
        collaborators: ['collab1'],
        ownerName: undefined,
        collaboratorNames: []
      });
    });
  });

  describe('validateCollaborators', () => {
    it('should validate collaborators successfully', async () => {
      const mockCollaboratorDoc = { _id: 'collab1', departmentId: 'dept1' };
      const mockCollaborator = { departmentId: 'dept1' };

      mockUserRepository.findById.mockResolvedValue(mockCollaboratorDoc);
      User.mockImplementation(() => mockCollaborator);

      // Should not throw
      await expect(projectService.validateCollaborators(['collab1'], 'dept1'))
        .resolves.not.toThrow();
    });

    it('should throw error when collaborator not found', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(projectService.validateCollaborators(['collab1'], 'dept1'))
        .rejects.toThrow('Collaborator collab1 not found');
    });

    it('should throw error when department mismatch', async () => {
      const mockCollaboratorDoc = { _id: 'collab1', departmentId: 'dept1' };
      const mockCollaborator = { departmentId: 'dept2' };

      mockUserRepository.findById.mockResolvedValue(mockCollaboratorDoc);
      User.mockImplementation(() => mockCollaborator);

      await expect(projectService.validateCollaborators(['collab1'], 'dept1'))
        .rejects.toThrow('All collaborators must be from the same department');
    });
  });

  describe('validateDepartmentMembership', () => {
    it('should validate same department', () => {
      expect(() => projectService.validateDepartmentMembership('dept1', 'dept1'))
        .not.toThrow();
    });

    it('should throw error for different departments', () => {
      expect(() => projectService.validateDepartmentMembership('dept1', 'dept2'))
        .toThrow('All collaborators must be from the same department');
    });

    it('should handle null department IDs', () => {
      expect(() => projectService.validateDepartmentMembership(null, 'dept1'))
        .not.toThrow();
      expect(() => projectService.validateDepartmentMembership('dept1', null))
        .not.toThrow();
    });
  });

  describe('isVisibleToUser', () => {
    it('should return true when project is accessible', async () => {
      const mockProjectDoc = { _id: 'project1' };
      const mockUserDoc = { _id: 'user1' };
      const mockProject = { canBeAccessedBy: jest.fn().mockReturnValue(true) };
      const mockUser = {};

      mockProjectRepository.findById.mockResolvedValue(mockProjectDoc);
      mockUserRepository.findById.mockResolvedValue(mockUserDoc);
      Project.mockImplementation(() => mockProject);
      User.mockImplementation(() => mockUser);

      const result = await projectService.isVisibleToUser('project1', 'user1');

      expect(result).toBe(true);
    });

    it('should return false when error occurs', async () => {
      mockProjectRepository.findById.mockRejectedValue(new Error('Project not found'));

      const result = await projectService.isVisibleToUser('project1', 'user1');

      expect(result).toBe(false);
    });
  });

  describe('getProjectsByOwner', () => {
    it('should get projects by owner successfully', async () => {
      const mockProjectDocs = [{ _id: 'project1' }, { _id: 'project2' }];
      const mockProjects = [{ id: 'project1' }, { id: 'project2' }];

      mockProjectRepository.findProjectsByOwner.mockResolvedValue(mockProjectDocs);
      Project.mockImplementation((doc) => ({ id: doc._id }));

      const result = await projectService.getProjectsByOwner('owner1');

      expect(result).toEqual(mockProjects);
      expect(mockProjectRepository.findProjectsByOwner).toHaveBeenCalledWith('owner1');
    });

    it('should throw error when repository fails', async () => {
      const error = new Error('Database error');
      mockProjectRepository.findProjectsByOwner.mockRejectedValue(error);

      await expect(projectService.getProjectsByOwner('owner1'))
        .rejects.toThrow('Database error');
    });
  });

  describe('getProjectsByDepartment', () => {
    it('should get projects by department successfully', async () => {
      const mockProjectDocs = [{ _id: 'project1' }];
      const mockProjects = [{ id: 'project1' }];

      mockProjectRepository.findProjectsByDepartment.mockResolvedValue(mockProjectDocs);
      Project.mockImplementation((doc) => ({ id: doc._id }));

      const result = await projectService.getProjectsByDepartment('dept1');

      expect(result).toEqual(mockProjects);
      expect(mockProjectRepository.findProjectsByDepartment).toHaveBeenCalledWith('dept1');
    });

    it('should throw error when repository fails', async () => {
      const error = new Error('Database error');
      mockProjectRepository.findProjectsByDepartment.mockRejectedValue(error);

      await expect(projectService.getProjectsByDepartment('dept1'))
        .rejects.toThrow('Database error');
    });
  });

  describe('getProjectById', () => {
    it('should get project by id successfully', async () => {
      const mockProjectDoc = { 
        _id: 'project1', 
        name: 'Test Project'
      };

      const mockPopulatedDoc = {
        _id: 'project1',
        name: 'Test Project',
        description: 'Test Description',
        ownerId: { _id: 'owner1', name: 'Owner' },
        collaborators: [{ _id: 'collab1', name: 'Collab' }],
        departmentId: { _id: 'dept1', name: 'Department' },
        isArchived: false,
        hasContainedTasks: false,
        deadline: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockProjectRepository.findById.mockResolvedValue(mockProjectDoc);
      ProjectModel.populate.mockResolvedValue(mockPopulatedDoc);

      const result = await projectService.getProjectById('project1');

      expect(result.id).toBe('project1');
      expect(result.name).toBe('Test Project');
      expect(mockProjectRepository.findById).toHaveBeenCalledWith('project1');
      expect(ProjectModel.populate).toHaveBeenCalledWith(mockProjectDoc, [
        { path: 'ownerId', select: 'name' },
        { path: 'collaborators', select: 'name' },
        { path: 'departmentId', select: 'name' }
      ]);
    });

    it('should throw error when project not found', async () => {
      mockProjectRepository.findById.mockResolvedValue(null);

      await expect(projectService.getProjectById('project1'))
        .rejects.toThrow('Project not found');
    });

    it('should throw error when repository fails', async () => {
      const error = new Error('Database error');
      mockProjectRepository.findById.mockRejectedValue(error);

      await expect(projectService.getProjectById('project1'))
        .rejects.toThrow('Database error');
    });
  });
});
