const Task = require('../../../src/domain/Task');

describe('Task Domain Class', () => {
  let taskData;
  let task;

  beforeEach(() => {
    taskData = {
      _id: '507f1f77bcf86cd799439011',
      title: 'Test Task',
      description: 'A test task description',
      dueDate: new Date('2024-12-31T23:59:59Z'),
      status: 'ongoing',
      priority: 'medium',
      createdBy: '507f1f77bcf86cd799439012',
      assigneeId: '507f1f77bcf86cd799439013',
      projectId: '507f1f77bcf86cd799439014',
      attachments: ['507f1f77bcf86cd799439015'],
      collaborators: ['507f1f77bcf86cd799439012', '507f1f77bcf86cd799439013'],
      lastStatusUpdate: null,
      isDeleted: false,
      createdAt: new Date('2024-01-01T00:00:00Z'),
      updatedAt: new Date('2024-01-01T00:00:00Z')
    };
    task = new Task(taskData);
  });

  describe('Constructor', () => {
    it('should initialize with provided data', () => {
      expect(task.id).toBe(taskData._id);
      expect(task.title).toBe(taskData.title);
      expect(task.description).toBe(taskData.description);
      expect(task.dueDate).toBe(taskData.dueDate);
      expect(task.status).toBe(taskData.status);
      expect(task.priority).toBe(taskData.priority);
      expect(task.createdBy).toBe(taskData.createdBy);
      expect(task.assigneeId).toBe(taskData.assigneeId);
      expect(task.projectId).toBe(taskData.projectId);
      expect(task.attachments).toEqual(taskData.attachments);
      expect(task.collaborators).toEqual(taskData.collaborators);
      expect(task.lastStatusUpdate).toBe(taskData.lastStatusUpdate);
      expect(task.isDeleted).toBe(taskData.isDeleted);
      expect(task.createdAt).toBe(taskData.createdAt);
      expect(task.updatedAt).toBe(taskData.updatedAt);
    });

    it('should handle data with id instead of _id', () => {
      const dataWithId = { ...taskData, id: 'test-id' };
      delete dataWithId._id;
      const taskWithId = new Task(dataWithId);
      expect(taskWithId.id).toBe('test-id');
    });

    it('should initialize with default values', () => {
      const minimalData = {
        _id: '507f1f77bcf86cd799439011',
        title: 'Test Task',
        createdBy: '507f1f77bcf86cd799439012'
      };
      const minimalTask = new Task(minimalData);
      expect(minimalTask.attachments).toEqual([]);
      expect(minimalTask.collaborators).toEqual([]);
      expect(minimalTask.isDeleted).toBe(false);
    });
  });

  describe('Status checks', () => {
    it('should identify overdue tasks correctly', () => {
      const overdueData = {
        ...taskData,
        dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
        status: 'ongoing'
      };
      const overdueTask = new Task(overdueData);
      expect(overdueTask.isOverdue()).toBe(true);
    });

    it('should not consider completed tasks as overdue', () => {
      const completedData = {
        ...taskData,
        dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
        status: 'completed'
      };
      const completedTask = new Task(completedData);
      expect(completedTask.isOverdue()).toBe(false);
    });

    it('should identify completed tasks', () => {
      const completedTask = new Task({ ...taskData, status: 'completed' });
      expect(completedTask.isCompleted()).toBe(true);
      expect(task.isCompleted()).toBe(false);
    });

    it('should identify unassigned tasks', () => {
      const unassignedTask = new Task({ ...taskData, status: 'unassigned' });
      expect(unassignedTask.isUnassigned()).toBe(true);
      expect(task.isUnassigned()).toBe(false);
    });

    it('should identify ongoing tasks', () => {
      expect(task.isOngoing()).toBe(true);
      const completedTask = new Task({ ...taskData, status: 'completed' });
      expect(completedTask.isOngoing()).toBe(false);
    });

    it('should identify tasks under review', () => {
      const reviewTask = new Task({ ...taskData, status: 'under_review' });
      expect(reviewTask.isUnderReview()).toBe(true);
      expect(task.isUnderReview()).toBe(false);
    });
  });

  describe('Permission checks', () => {
    let mockUser;

    beforeEach(() => {
      mockUser = {
        id: '507f1f77bcf86cd799439012',
        isStaff: jest.fn(),
        isManager: jest.fn(),
        canAssignTasks: jest.fn()
      };
    });

    describe('canBeCompletedBy', () => {
      it('should allow completion by task creator', () => {
        expect(task.canBeCompletedBy(mockUser)).toBe(true);
      });

      it('should allow completion by assignee', () => {
        mockUser.id = '507f1f77bcf86cd799439013';
        expect(task.canBeCompletedBy(mockUser)).toBe(true);
      });

      it('should allow completion by collaborators', () => {
        mockUser.id = '507f1f77bcf86cd799439999';
        task.collaborators = ['507f1f77bcf86cd799439999'];
        expect(task.canBeCompletedBy(mockUser)).toBe(true);
      });

      it('should deny completion by non-collaborators', () => {
        mockUser.id = '507f1f77bcf86cd799439999';
        expect(task.canBeCompletedBy(mockUser)).toBe(false);
      });
    });

    describe('canBeAssignedBy', () => {
      it('should allow assignment by users who can assign tasks', () => {
        mockUser.canAssignTasks.mockReturnValue(true);
        expect(task.canBeAssignedBy(mockUser)).toBe(true);
      });

      it('should deny assignment by users who cannot assign tasks', () => {
        mockUser.canAssignTasks.mockReturnValue(false);
        expect(task.canBeAssignedBy(mockUser)).toBe(false);
      });
    });

    describe('canBeEditedBy', () => {
      it('should allow editing by staff who created the task', () => {
        mockUser.isStaff.mockReturnValue(true);
        expect(task.canBeEditedBy(mockUser)).toBe(true);
      });

      it('should deny editing by staff who did not create the task', () => {
        mockUser.id = '507f1f77bcf86cd799439999';
        mockUser.isStaff.mockReturnValue(true);
        expect(task.canBeEditedBy(mockUser)).toBe(false);
      });

      it('should allow editing by managers who are collaborators', () => {
        mockUser.isStaff.mockReturnValue(false);
        mockUser.isManager.mockReturnValue(true);
        expect(task.canBeEditedBy(mockUser)).toBe(true);
      });

      it('should deny editing by managers who are not collaborators', () => {
        mockUser.id = '507f1f77bcf86cd799439999';
        mockUser.isStaff.mockReturnValue(false);
        mockUser.isManager.mockReturnValue(true);
        expect(task.canBeEditedBy(mockUser)).toBe(false);
      });
    });

    describe('canRemoveAttachment', () => {
      it('should allow removal by task creator', () => {
        expect(task.canRemoveAttachment(mockUser)).toBe(true);
      });

      it('should allow removal by managers who are collaborators', () => {
        mockUser.isManager.mockReturnValue(true);
        expect(task.canRemoveAttachment(mockUser)).toBe(true);
      });

      it('should deny removal by managers who are not collaborators', () => {
        mockUser.id = '507f1f77bcf86cd799439999';
        mockUser.isManager.mockReturnValue(true);
        expect(task.canRemoveAttachment(mockUser)).toBe(false);
      });

      it('should deny removal by non-managers who are not creators', () => {
        mockUser.id = '507f1f77bcf86cd799439999'; // Different from creator
        mockUser.isManager.mockReturnValue(false);
        expect(task.canRemoveAttachment(mockUser)).toBe(false);
      });
    });
  });

  describe('Business logic methods', () => {
    it('should update status correctly', () => {
      const updatedBy = { id: '507f1f77bcf86cd799439012' };
      task.updateStatus('completed', updatedBy);
      
      expect(task.status).toBe('completed');
      expect(task.lastStatusUpdate.status).toBe('completed');
      expect(task.lastStatusUpdate.updatedBy).toBe(updatedBy.id);
      expect(task.lastStatusUpdate.updatedAt).toBeInstanceOf(Date);
    });

    it('should assign task to user', () => {
      const userId = '507f1f77bcf86cd799439999';
      task.assignTo(userId);
      
      expect(task.assigneeId).toBe(userId);
      expect(task.status).toBe('ongoing');
    });

    it('should add collaborator', () => {
      const userId = '507f1f77bcf86cd799439999';
      task.addCollaborator(userId);
      
      expect(task.collaborators).toContain(userId);
    });

    it('should not add duplicate collaborator', () => {
      const userId = '507f1f77bcf86cd799439012';
      const initialLength = task.collaborators.length;
      task.addCollaborator(userId);
      
      expect(task.collaborators.length).toBe(initialLength);
    });

    it('should check if task has attachments', () => {
      expect(task.hasAttachments()).toBe(true);
      
      const taskWithoutAttachments = new Task({ ...taskData, attachments: [] });
      expect(taskWithoutAttachments.hasAttachments()).toBe(false);
    });

    it('should check if user is collaborator', () => {
      expect(task.isCollaborator('507f1f77bcf86cd799439012')).toBe(true);
      expect(task.isCollaborator('507f1f77bcf86cd799439999')).toBe(false);
    });
  });

  describe('toDTO', () => {
    it('should return complete DTO', () => {
      const dto = task.toDTO();
      expect(dto).toEqual({
        id: task.id,
        title: task.title,
        description: task.description,
        dueDate: task.dueDate,
        status: task.status,
        priority: task.priority,
        createdBy: task.createdBy,
        assigneeId: task.assigneeId,
        projectId: task.projectId,
        collaborators: task.collaborators,
        attachments: task.attachments,
        recurringInterval: task.recurringInterval,
        isOverdue: task.isOverdue(),
        hasAttachments: task.hasAttachments(),
        createdAt: task.createdAt,
        updatedAt: task.updatedAt
      });
    });
  });
});
