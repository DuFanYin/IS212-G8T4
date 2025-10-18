const Project = require('../../../src/domain/Project');

describe('Project Domain Class', () => {
  let projectData;
  let project;

  beforeEach(() => {
    projectData = {
      _id: '507f1f77bcf86cd799439011',
      name: 'Test Project',
      description: 'A test project',
      ownerId: '507f1f77bcf86cd799439012',
      deadline: new Date('2024-12-31T23:59:59Z'),
      departmentId: '507f1f77bcf86cd799439013',
      collaborators: ['507f1f77bcf86cd799439014'],
      isArchived: false,
      hasContainedTasks: true,
      createdAt: new Date('2024-01-01T00:00:00Z'),
      updatedAt: new Date('2024-01-01T00:00:00Z')
    };
    project = new Project(projectData);
  });

  describe('Constructor', () => {
    it('should initialize with provided data', () => {
      expect(project.id).toBe(projectData._id);
      expect(project.name).toBe(projectData.name);
      expect(project.description).toBe(projectData.description);
      expect(project.ownerId).toBe(projectData.ownerId);
      expect(project.deadline).toBe(projectData.deadline);
      expect(project.departmentId).toBe(projectData.departmentId);
      expect(project.collaborators).toEqual(projectData.collaborators);
      expect(project.isArchived).toBe(projectData.isArchived);
      expect(project.hasContainedTasks).toBe(projectData.hasContainedTasks);
      expect(project.createdAt).toBe(projectData.createdAt);
      expect(project.updatedAt).toBe(projectData.updatedAt);
    });

    it('should handle data with id instead of _id', () => {
      const dataWithId = { ...projectData, id: 'test-id' };
      delete dataWithId._id;
      const proj = new Project(dataWithId);
      expect(proj.id).toBe('test-id');
    });

    it('should initialize with default values', () => {
      const minimalData = {
        _id: '507f1f77bcf86cd799439011',
        name: 'Test Project',
        ownerId: '507f1f77bcf86cd799439012'
      };
      const proj = new Project(minimalData);
      expect(proj.collaborators).toContain(proj.ownerId); // Owner is automatically added
      expect(proj.isArchived).toBe(false);
      expect(proj.hasContainedTasks).toBe(false);
    });

    it('should add owner to collaborators', () => {
      const dataWithoutOwnerInCollaborators = {
        ...projectData,
        collaborators: ['507f1f77bcf86cd799439014']
      };
      const proj = new Project(dataWithoutOwnerInCollaborators);
      expect(proj.collaborators).toContain(proj.ownerId);
    });
  });

  describe('isOwner', () => {
    it('should return true for the owner', () => {
      expect(project.isOwner(projectData.ownerId)).toBe(true);
    });

    it('should return false for non-owner', () => {
      expect(project.isOwner('507f1f77bcf86cd799439999')).toBe(false);
    });

    it('should handle string comparison correctly', () => {
      expect(project.isOwner(projectData.ownerId.toString())).toBe(true);
    });
  });

  describe('isCollaborator', () => {
    it('should return true for collaborators', () => {
      expect(project.isCollaborator('507f1f77bcf86cd799439014')).toBe(true);
    });

    it('should return true for owner (who is also a collaborator)', () => {
      expect(project.isCollaborator(projectData.ownerId)).toBe(true);
    });

    it('should return false for non-collaborators', () => {
      expect(project.isCollaborator('507f1f77bcf86cd799439999')).toBe(false);
    });
  });

  describe('canBeAccessedBy', () => {
    let mockUser;

    beforeEach(() => {
      mockUser = {
        id: '507f1f77bcf86cd799439012',
        canSeeAllTasks: jest.fn(),
        canSeeDepartmentTasks: jest.fn(),
        canAccessDepartment: jest.fn(),
        isManager: jest.fn()
      };
    });

    it('should allow access for owner', () => {
      expect(project.canBeAccessedBy(mockUser)).toBe(true);
    });

    it('should allow access for collaborators', () => {
      mockUser.id = '507f1f77bcf86cd799439014';
      expect(project.canBeAccessedBy(mockUser)).toBe(true);
    });

    it('should allow access for users who can see all tasks', () => {
      mockUser.id = '507f1f77bcf86cd799439999';
      mockUser.canSeeAllTasks.mockReturnValue(true);
      expect(project.canBeAccessedBy(mockUser)).toBe(true);
    });

    it('should allow access for department users who can see department tasks', () => {
      mockUser.id = '507f1f77bcf86cd799439999';
      mockUser.canSeeAllTasks.mockReturnValue(false);
      mockUser.canSeeDepartmentTasks.mockReturnValue(true);
      mockUser.canAccessDepartment.mockReturnValue(true);
      expect(project.canBeAccessedBy(mockUser)).toBe(true);
    });

    it('should deny access for unauthorized users', () => {
      mockUser.id = '507f1f77bcf86cd799439999';
      mockUser.canSeeAllTasks.mockReturnValue(false);
      mockUser.canSeeDepartmentTasks.mockReturnValue(false);
      expect(project.canBeAccessedBy(mockUser)).toBe(false);
    });
  });

  describe('canBeModifiedBy', () => {
    let mockUser;

    beforeEach(() => {
      mockUser = {
        id: '507f1f77bcf86cd799439012',
        isManager: jest.fn()
      };
    });

    it('should allow modification for owner', () => {
      expect(project.canBeModifiedBy(mockUser)).toBe(true);
    });

    it('should allow modification for managers', () => {
      mockUser.id = '507f1f77bcf86cd799439999';
      mockUser.isManager.mockReturnValue(true);
      expect(project.canBeModifiedBy(mockUser)).toBe(true);
    });

    it('should deny modification for non-owners and non-managers', () => {
      mockUser.id = '507f1f77bcf86cd799439999';
      mockUser.isManager.mockReturnValue(false);
      expect(project.canBeModifiedBy(mockUser)).toBe(false);
    });
  });

  describe('addCollaborator', () => {
    it('should add new collaborator', () => {
      const newCollaborator = '507f1f77bcf86cd799439999';
      project.addCollaborator(newCollaborator);
      expect(project.collaborators).toContain(newCollaborator);
    });

    it('should not add duplicate collaborator', () => {
      const existingCollaborator = '507f1f77bcf86cd799439014';
      const initialLength = project.collaborators.length;
      project.addCollaborator(existingCollaborator);
      expect(project.collaborators.length).toBe(initialLength);
    });
  });

  describe('isOverdue', () => {
    it('should return true for overdue projects', () => {
      const overdueData = {
        ...projectData,
        deadline: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
        isArchived: false
      };
      const overdueProject = new Project(overdueData);
      expect(overdueProject.isOverdue()).toBe(true);
    });

    it('should return false for future deadlines', () => {
      const futureData = {
        ...projectData,
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        isArchived: false
      };
      const futureProject = new Project(futureData);
      expect(futureProject.isOverdue()).toBe(false);
    });

    it('should return false for archived projects', () => {
      const archivedData = {
        ...projectData,
        deadline: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
        isArchived: true
      };
      const archivedProject = new Project(archivedData);
      expect(archivedProject.isOverdue()).toBe(false);
    });

    it('should return false for projects without deadline', () => {
      const noDeadlineData = {
        ...projectData,
        deadline: null
      };
      const noDeadlineProject = new Project(noDeadlineData);
      expect(noDeadlineProject.isOverdue()).toBe(null);
    });
  });

  describe('hasTasks', () => {
    it('should return true when project has tasks', () => {
      expect(project.hasTasks()).toBe(true);
    });

    it('should return false when project has no tasks', () => {
      const noTasksData = {
        ...projectData,
        hasContainedTasks: false
      };
      const noTasksProject = new Project(noTasksData);
      expect(noTasksProject.hasTasks()).toBe(false);
    });
  });

  describe('setHasTasks', () => {
    it('should set hasContainedTasks to true', () => {
      project.setHasTasks(true);
      expect(project.hasContainedTasks).toBe(true);
    });

    it('should set hasContainedTasks to false', () => {
      project.setHasTasks(false);
      expect(project.hasContainedTasks).toBe(false);
    });
  });

  describe('toDTO', () => {
    it('should return complete DTO', () => {
      const dto = project.toDTO();
      expect(dto).toEqual({
        id: project.id,
        name: project.name,
        description: project.description,
        ownerId: project.ownerId,
        deadline: project.deadline,
        departmentId: project.departmentId,
        collaborators: project.collaborators,
        isArchived: project.isArchived,
        hasContainedTasks: project.hasContainedTasks,
        isOverdue: project.isOverdue(),
        createdAt: project.createdAt,
        updatedAt: project.updatedAt
      });
    });
  });
});
