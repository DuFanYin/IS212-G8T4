jest.mock('../../../src/repositories/ProjectRepository');
jest.mock('../../../src/repositories/UserRepository');
jest.mock('../../../src/repositories/TaskRepository');
jest.mock('../../../src/domain/Project');
jest.mock('../../../src/domain/User');
jest.mock('../../../src/db/models/Project');
jest.mock('../../../src/db/models/Task');

const ProjectRepository = require('../../../src/repositories/ProjectRepository');
const UserRepository = require('../../../src/repositories/UserRepository');
const TaskRepository = require('../../../src/repositories/TaskRepository');
const Project = require('../../../src/domain/Project');
const User = require('../../../src/domain/User');
const ProjectModel = require('../../../src/db/models/Project');

describe('ProjectService - Extended Tests', () => {
  let projectService;
  let mockProjectRepository;
  let mockUserRepository;
  let mockTaskRepository;

  beforeEach(() => {
    mockProjectRepository = {
      findById: jest.fn(),
      findAllProjects: jest.fn(),
      findActiveProjects: jest.fn(),
      findProjectsByDepartment: jest.fn(),
      findProjectsByOwner: jest.fn(),
      findProjectsByCollaborator: jest.fn(),
      updateById: jest.fn(),
      addCollaborators: jest.fn(),
      removeCollaborators: jest.fn(),
      assignRole: jest.fn()
    };

    mockUserRepository = {
      findById: jest.fn()
    };

    mockTaskRepository = {
      countByStatusForProject: jest.fn(),
      findTasksByProject: jest.fn()
    };

    ProjectRepository.mockImplementation(() => mockProjectRepository);
    UserRepository.mockImplementation(() => mockUserRepository);
    TaskRepository.mockImplementation(() => mockTaskRepository);

    // Use mockReturnThis to preserve 'this' context
    jest.clearAllMocks();
    
    projectService = require('../../../src/services/projectService');
    
    projectService.projectRepository = mockProjectRepository;
    projectService.userRepository = mockUserRepository;
    projectService.taskRepository = mockTaskRepository;
  });

  describe('getProjectProgress', () => {
    it('should return project progress successfully', async () => {
      const mockProjectDoc = { _id: 'project1', name: 'Test Project' };
      const mockUserDoc = { _id: 'user1', name: 'Test User' };
      const mockProject = { canBeModifiedBy: jest.fn().mockReturnValue(true) };
      const mockUser = { canSeeAllTasks: jest.fn().mockReturnValue(false) };
      const mockProgress = { total: 10, completed: 5, unassigned: 2 };

      mockProjectRepository.findById.mockResolvedValue(mockProjectDoc);
      mockUserRepository.findById.mockResolvedValue(mockUserDoc);
      mockTaskRepository.countByStatusForProject.mockResolvedValue(mockProgress);
      Project.mockImplementation(() => mockProject);
      User.mockImplementation(() => mockUser);

      const result = await projectService.getProjectProgress('project1', 'user1');

      expect(result).toBe(mockProgress);
      expect(mockProjectRepository.findById).toHaveBeenCalledWith('project1');
    });

    it('should throw Not Authorized error', async () => {
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

  describe('updateProject', () => {
    it('should update project successfully', async () => {
      const mockProjectDoc = { _id: 'project1', departmentId: 'dept1', collaborators: [] };
      const mockProject = {
        departmentId: 'dept1',
        collaborators: [],
        canBeModifiedBy: jest.fn().mockReturnValue(true)
      };

      mockProjectRepository.findById.mockResolvedValue(mockProjectDoc);
      mockProjectRepository.updateById.mockResolvedValue(mockProjectDoc);
      Project.mockImplementation((doc) => ({ ...doc, ...mockProject }));

      const result = await projectService.updateProject('project1', { name: 'Updated' }, 'user1');

      expect(mockProjectRepository.updateById).toHaveBeenCalled();
    });
  });

  describe('addCollaborator', () => {
    it('should add collaborator successfully', async () => {
      const mockProjectDoc = { _id: 'project1', departmentId: 'dept1' };
      const mockProject = {
        departmentId: 'dept1',
        canBeModifiedBy: jest.fn().mockReturnValue(true)
      };
      const mockCollaboratorDoc = { _id: 'user1', departmentId: 'dept1' };

      projectService.getProjectDomainById = jest.fn().mockResolvedValue(mockProject);
      projectService.validateUser = jest.fn();
      projectService.validateDepartmentMembership = jest.fn();

      mockProjectRepository.findById.mockResolvedValue(mockProjectDoc);
      mockUserRepository.findById.mockResolvedValue(mockCollaboratorDoc);
      mockProjectRepository.addCollaborators.mockResolvedValue(mockProjectDoc);

      const result = await projectService.addCollaborator('project1', 'user1', 'owner1');

      expect(mockProjectRepository.addCollaborators).toHaveBeenCalled();
    });
  });

  describe('assignRoleToCollaborator', () => {
    it('should assign role successfully', async () => {
      const mockProject = {
        ownerId: 'owner1',
        isOwner: jest.fn().mockReturnValue(true)
      };
      const mockUserDoc = { _id: 'user1', name: 'Test User' };

      projectService.getProjectDomainById = jest.fn().mockResolvedValue(mockProject);

      mockUserRepository.findById
        .mockResolvedValueOnce(mockUserDoc)
        .mockResolvedValueOnce(mockUserDoc);
      
      mockProjectRepository.assignRole = jest.fn().mockResolvedValue(mockProject);

      const result = await projectService.assignRoleToCollaborator(
        'project1',
        'user1',
        'viewer',
        'owner1'
      );

      expect(mockProjectRepository.assignRole).toHaveBeenCalled();
    });

    it('should throw error when not owner', async () => {
      const mockProject = {
        ownerId: 'owner1',
        isOwner: jest.fn().mockReturnValue(false)
      };

      projectService.getProjectDomainById = jest.fn().mockResolvedValue(mockProject);
      mockUserRepository.findById.mockResolvedValue({ _id: 'user1' });

      await expect(
        projectService.assignRoleToCollaborator('project1', 'user1', 'viewer', 'owner1')
      ).rejects.toThrow('Only the project owner can assign or change roles');
    });
  });

  describe('validateCollaborators', () => {
    it('should validate collaborators in same department', async () => {
      const mockCollaboratorDoc = { _id: 'collab1', departmentId: 'dept1' };
      const mockCollaborator = { departmentId: 'dept1' };

      mockUserRepository.findById.mockResolvedValue(mockCollaboratorDoc);
      User.mockImplementation(() => mockCollaborator);

      await expect(
        projectService.validateCollaborators(['collab1'], 'dept1')
      ).resolves.not.toThrow();
    });

    it('should throw error when collaborator not found', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(
        projectService.validateCollaborators(['collab1'], 'dept1')
      ).rejects.toThrow('Collaborator collab1 not found');
    });

    it('should throw error for department mismatch', async () => {
      const mockCollaboratorDoc = { 
        _id: 'collab1', 
        name: 'Collaborator',
        email: 'collab@example.com',
        role: 'staff',
        departmentId: 'dept2' 
      };
      
      mockUserRepository.findById.mockResolvedValue(mockCollaboratorDoc);
      
      User.mockImplementation(function(doc) {
        return {
          id: doc._id || doc.id,
          name: doc.name,
          email: doc.email,
          role: doc.role,
          departmentId: doc.departmentId // Critical: extract from doc
        };
      });

      await expect(
        projectService.validateCollaborators(['collab1'], 'dept1')
      ).rejects.toThrow('All collaborators must be from the same department');
    });
  });

  describe('validateUser', () => {
    it('should throw error for unauthorized user', async () => {
      const mockUserDoc = { _id: 'user1', name: 'Test User', email: 'test@example.com', role: 'staff' };
      
      mockUserRepository.findById.mockResolvedValue(mockUserDoc);

      const mockProject = {
        canBeModifiedBy: jest.fn().mockReturnValue(false)
      };

      User.mockImplementation(function(doc) {
        return {
          id: doc._id || doc.id,
          name: doc.name,
          email: doc.email,
          role: doc.role,
          isManager: jest.fn().mockReturnValue(false),
          canSeeAllTasks: jest.fn().mockReturnValue(false),
          canSeeDepartmentTasks: jest.fn().mockReturnValue(false),
          canSeeTeamTasks: jest.fn().mockReturnValue(false)
        };
      });

      const result = projectService.validateUser(mockProject, 'user1');
      await expect(result).rejects.toThrow('Not Authorized');
    });
  });

  describe('isVisibleToUser', () => {
    it('should return true for accessible project', async () => {
      const mockProjectDoc = { 
        _id: 'project1', 
        name: 'Test Project',
        ownerId: 'user1',
        departmentId: 'dept1',
        collaborators: []
      };
      const mockUserDoc = { 
        _id: 'user1', 
        name: 'Test User', 
        role: 'manager',
        departmentId: 'dept1'
      };

      mockProjectRepository.findById.mockResolvedValue(mockProjectDoc);
      mockUserRepository.findById.mockResolvedValue(mockUserDoc);
      
      // Mock Project constructor 
      Project.mockImplementation(function(doc) {
        const project = {
          id: doc._id || doc.id,
          ownerId: doc.ownerId,
          departmentId: doc.departmentId,
          collaborators: doc.collaborators || [],
          canBeAccessedBy: jest.fn().mockReturnValue(true)
        };
        return project;
      });
      
      User.mockImplementation(function(doc) {
        return {
          id: doc._id || doc.id,
          name: doc.name,
          role: doc.role,
          departmentId: doc.departmentId,
          canSeeAllTasks: jest.fn().mockReturnValue(false),
          canSeeDepartmentTasks: jest.fn().mockReturnValue(false),
          canSeeTeamTasks: jest.fn().mockReturnValue(false)
        };
      });

      const result = await projectService.isVisibleToUser('project1', 'user1');

      expect(result).toBe(true);
    });

    it('should return false when error occurs', async () => {
      mockProjectRepository.findById.mockRejectedValue(new Error('Not found'));

      const result = await projectService.isVisibleToUser('project1', 'user1');

      expect(result).toBe(false);
    });
  });
});

