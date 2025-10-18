const Subtask = require('../../../src/domain/Subtask');

describe('Subtask Domain Class', () => {
  let subtaskData;
  let subtask;

  beforeEach(() => {
    subtaskData = {
      _id: '507f1f77bcf86cd799439011',
      parentTaskId: '507f1f77bcf86cd799439012',
      title: 'Test Subtask',
      description: 'A test subtask description',
      dueDate: new Date('2024-12-31T23:59:59Z'),
      status: 'ongoing',
      assigneeId: '507f1f77bcf86cd799439013',
      collaborators: ['507f1f77bcf86cd799439013'],
      lastStatusUpdate: null,
      isDeleted: false,
      createdAt: new Date('2024-01-01T00:00:00Z'),
      updatedAt: new Date('2024-01-01T00:00:00Z')
    };
    subtask = new Subtask(subtaskData);
  });

  describe('Constructor', () => {
    it('should initialize with provided data', () => {
      expect(subtask.id).toBe(subtaskData._id);
      expect(subtask.parentTaskId).toBe(subtaskData.parentTaskId);
      expect(subtask.title).toBe(subtaskData.title);
      expect(subtask.description).toBe(subtaskData.description);
      expect(subtask.dueDate).toBe(subtaskData.dueDate);
      expect(subtask.status).toBe(subtaskData.status);
      expect(subtask.assigneeId).toBe(subtaskData.assigneeId);
      expect(subtask.collaborators).toEqual(subtaskData.collaborators);
      expect(subtask.lastStatusUpdate).toBe(subtaskData.lastStatusUpdate);
      expect(subtask.isDeleted).toBe(subtaskData.isDeleted);
      expect(subtask.createdAt).toBe(subtaskData.createdAt);
      expect(subtask.updatedAt).toBe(subtaskData.updatedAt);
    });

    it('should handle data with id instead of _id', () => {
      const dataWithId = { ...subtaskData, id: 'test-id' };
      delete dataWithId._id;
      const subtaskWithId = new Subtask(dataWithId);
      expect(subtaskWithId.id).toBe('test-id');
    });

    it('should initialize with default values', () => {
      const minimalData = {
        _id: '507f1f77bcf86cd799439011',
        parentTaskId: '507f1f77bcf86cd799439012',
        title: 'Test Subtask'
      };
      const minimalSubtask = new Subtask(minimalData);
      expect(minimalSubtask.collaborators).toEqual([]);
    });
  });

  describe('Status checks', () => {
    it('should identify completed subtasks', () => {
      const completedSubtask = new Subtask({ ...subtaskData, status: 'completed' });
      expect(completedSubtask.isCompleted()).toBe(true);
      expect(subtask.isCompleted()).toBe(false);
    });

    it('should identify ongoing subtasks', () => {
      expect(subtask.isOngoing()).toBe(true);
      const completedSubtask = new Subtask({ ...subtaskData, status: 'completed' });
      expect(completedSubtask.isOngoing()).toBe(false);
    });

    it('should identify subtasks under review', () => {
      const reviewSubtask = new Subtask({ ...subtaskData, status: 'under_review' });
      expect(reviewSubtask.isUnderReview()).toBe(true);
      expect(subtask.isUnderReview()).toBe(false);
    });

    it('should identify unassigned subtasks', () => {
      const unassignedSubtask = new Subtask({ ...subtaskData, status: 'unassigned' });
      expect(unassignedSubtask.isUnassigned()).toBe(true);
      expect(subtask.isUnassigned()).toBe(false);
    });

    it('should identify overdue subtasks', () => {
      const overdueData = {
        ...subtaskData,
        dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
        status: 'ongoing'
      };
      const overdueSubtask = new Subtask(overdueData);
      expect(overdueSubtask.isOverdue()).toBe(true);
    });

    it('should not consider completed subtasks as overdue', () => {
      const completedData = {
        ...subtaskData,
        dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
        status: 'completed'
      };
      const completedSubtask = new Subtask(completedData);
      expect(completedSubtask.isOverdue()).toBe(false);
    });
  });

  describe('Permission checks', () => {
    let mockUser;

    beforeEach(() => {
      mockUser = {
        id: '507f1f77bcf86cd799439013'
      };
    });

    describe('canBeCompletedBy', () => {
      it('should allow completion by assignee', () => {
        expect(subtask.canBeCompletedBy(mockUser)).toBe(true);
      });

      it('should allow completion by collaborators', () => {
        mockUser.id = '507f1f77bcf86cd799439999';
        subtask.collaborators = ['507f1f77bcf86cd799439999'];
        expect(subtask.canBeCompletedBy(mockUser)).toBe(true);
      });

      it('should deny completion by non-assignees and non-collaborators', () => {
        mockUser.id = '507f1f77bcf86cd799439999';
        expect(subtask.canBeCompletedBy(mockUser)).toBe(false);
      });

      it('should handle subtasks without assignee', () => {
        const unassignedSubtask = new Subtask({ ...subtaskData, assigneeId: null });
        mockUser.id = '507f1f77bcf86cd799439999';
        unassignedSubtask.collaborators = ['507f1f77bcf86cd799439999'];
        expect(unassignedSubtask.canBeCompletedBy(mockUser)).toBe(true);
      });
    });

    describe('canBeEditedBy', () => {
      it('should allow editing by assignee', () => {
        expect(subtask.canBeEditedBy(mockUser)).toBe(true);
      });

      it('should allow editing by collaborators', () => {
        mockUser.id = '507f1f77bcf86cd799439999';
        subtask.collaborators = ['507f1f77bcf86cd799439999'];
        expect(subtask.canBeEditedBy(mockUser)).toBe(true);
      });

      it('should deny editing by non-assignees and non-collaborators', () => {
        mockUser.id = '507f1f77bcf86cd799439999';
        expect(subtask.canBeEditedBy(mockUser)).toBe(false);
      });
    });

    describe('isCollaborator', () => {
      it('should identify collaborators correctly', () => {
        expect(subtask.isCollaborator(mockUser)).toBe(true);
      });

      it('should identify non-collaborators correctly', () => {
        mockUser.id = '507f1f77bcf86cd799439999';
        expect(subtask.isCollaborator(mockUser)).toBe(false);
      });
    });
  });

  describe('Business logic methods', () => {
    it('should update status correctly', () => {
      subtask.updateStatus('completed');
      
      expect(subtask.status).toBe('completed');
      expect(subtask.lastStatusUpdate.status).toBe('completed');
      expect(subtask.lastStatusUpdate.updatedAt).toBeInstanceOf(Date);
    });

    it('should assign subtask to user', () => {
      const userId = '507f1f77bcf86cd799439999';
      subtask.assignTo(userId);
      
      expect(subtask.assigneeId).toBe(userId);
      expect(subtask.collaborators).toContain(userId);
    });

    it('should not add duplicate collaborator when assigning', () => {
      const userId = '507f1f77bcf86cd799439013'; // Already a collaborator
      const initialLength = subtask.collaborators.length;
      subtask.assignTo(userId);
      
      expect(subtask.assigneeId).toBe(userId);
      expect(subtask.collaborators.length).toBe(initialLength);
    });

    it('should add collaborator', () => {
      const userId = '507f1f77bcf86cd799439999';
      subtask.addCollaborator(userId);
      
      expect(subtask.collaborators).toContain(userId);
    });

    it('should not add duplicate collaborator', () => {
      const userId = '507f1f77bcf86cd799439013'; // Already a collaborator
      const initialLength = subtask.collaborators.length;
      subtask.addCollaborator(userId);
      
      expect(subtask.collaborators.length).toBe(initialLength);
    });
  });

  describe('toDTO', () => {
    it('should return complete DTO', () => {
      const dto = subtask.toDTO();
      expect(dto).toEqual({
        id: subtask.id,
        parentTaskId: subtask.parentTaskId,
        title: subtask.title,
        description: subtask.description,
        dueDate: subtask.dueDate,
        status: subtask.status,
        assigneeId: subtask.assigneeId,
        collaborators: subtask.collaborators,
        lastStatusUpdate: subtask.lastStatusUpdate,
        isDeleted: subtask.isDeleted,
        createdAt: subtask.createdAt,
        updatedAt: subtask.updatedAt
      });
    });
  });
});
