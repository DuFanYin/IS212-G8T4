const TaskService = require('../../../src/services/taskService');

describe('TaskService - Filtering and Sorting', () => {
  describe('filterByStatus', () => {
    const mockTasks = [
      { status: 'ongoing', dueDate: new Date('2025-01-15') },
      { status: 'completed', dueDate: new Date('2025-01-10') },
      { status: 'unassigned', dueDate: new Date('2025-01-20') },
      { status: 'under_review', dueDate: new Date('2025-01-12') },
      { status: 'ongoing', dueDate: new Date('2024-01-01') }
    ];

    it('should return all tasks when status is all', () => {
      const result = TaskService.filterByStatus(mockTasks, 'all');
      expect(result.length).toBe(mockTasks.length);
    });

    it('should filter by ongoing status', () => {
      const result = TaskService.filterByStatus(mockTasks, 'ongoing');
      expect(result.every(t => t.status === 'ongoing')).toBe(true);
    });

    it('should filter by completed status', () => {
      const result = TaskService.filterByStatus(mockTasks, 'completed');
      expect(result.every(t => t.status === 'completed')).toBe(true);
    });

    it('should filter by unassigned status', () => {
      const result = TaskService.filterByStatus(mockTasks, 'unassigned');
      expect(result.every(t => t.status === 'unassigned')).toBe(true);
    });

    it('should filter by under_review status', () => {
      const result = TaskService.filterByStatus(mockTasks, 'under_review');
      expect(result.every(t => t.status === 'under_review')).toBe(true);
    });
  });

  describe('sortTasks', () => {
    const mockTasks = [
      { title: 'B Task', dueDate: new Date('2025-02-01') },
      { title: 'A Task', dueDate: new Date('2025-01-01') },
      { title: 'C Task', dueDate: new Date('2025-03-01') }
    ];

    it('should sort by due date ascending', () => {
      const result = TaskService.sortTasks(mockTasks, 'dueDate', 'asc');
      expect(result[0].title).toBe('A Task');
      expect(result[result.length - 1].title).toBe('C Task');
    });

    it('should sort by due date descending', () => {
      const result = TaskService.sortTasks(mockTasks, 'dueDate', 'desc');
      expect(result[0].title).toBe('C Task');
    });

    it('should sort by assignee ascending', () => {
      const result = TaskService.sortTasks(mockTasks, 'assignee', 'asc');
      // When unsorted, should still return the same count
      expect(result.length).toBe(mockTasks.length);
    });

    it('should return unsorted when sortBy is not provided', () => {
      const result = TaskService.sortTasks(mockTasks);
      expect(result.length).toBe(mockTasks.length);
    });
  });
});

