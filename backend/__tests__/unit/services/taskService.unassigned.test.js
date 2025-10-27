const TaskService = require('../../../src/services/taskService');

describe('TaskService - calculateTaskStats', () => {
  describe('calculateTaskStats', () => {
    const mockTasks = [
      { status: 'ongoing' },
      { status: 'completed' },
      { status: 'unassigned' },
      { status: 'under_review' },
      { status: 'ongoing' }
    ];

    it('should calculate task statistics correctly', () => {
      const stats = TaskService.calculateTaskStats(mockTasks);
      
      expect(stats.total).toBe(mockTasks.length);
      expect(stats.ongoing).toBe(2);
      expect(stats.completed).toBe(1);
      expect(stats.unassigned).toBe(1);
    });

    it('should handle empty task array', () => {
      const stats = TaskService.calculateTaskStats([]);
      
      expect(stats.total).toBe(0);
      expect(stats.ongoing).toBe(0);
      expect(stats.completed).toBe(0);
      expect(stats.unassigned).toBe(0);
    });
  });
});

