const ActivityLog = require('../../../src/domain/ActivityLog');

describe('ActivityLog Domain Class', () => {
  let activityLogData;
  let activityLog;

  beforeEach(() => {
    activityLogData = {
      _id: '507f1f77bcf86cd799439011',
      userId: '507f1f77bcf86cd799439012',
      action: 'created',
      details: { description: 'Task created' },
      resourceType: 'task',
      resourceId: '507f1f77bcf86cd799439013',
      timestamp: new Date('2024-01-15T10:00:00Z'),
      createdAt: new Date('2024-01-15T10:00:00Z'),
      updatedAt: new Date('2024-01-15T10:00:00Z')
    };
    activityLog = new ActivityLog(activityLogData);
  });

  describe('Constructor', () => {
    it('should initialize with provided data', () => {
      expect(activityLog.id).toBe(activityLogData._id);
      expect(activityLog.userId).toBe(activityLogData.userId);
      expect(activityLog.action).toBe(activityLogData.action);
      expect(activityLog.details).toEqual(activityLogData.details);
      expect(activityLog.resourceType).toBe(activityLogData.resourceType);
      expect(activityLog.taskId).toBe(activityLogData.resourceId);
      expect(activityLog.timestamp).toBe(activityLogData.timestamp);
      expect(activityLog.createdAt).toBe(activityLogData.createdAt);
      expect(activityLog.updatedAt).toBe(activityLogData.updatedAt);
    });

    it('should handle data with id instead of _id', () => {
      const dataWithId = { ...activityLogData, id: 'test-id' };
      delete dataWithId._id;
      const log = new ActivityLog(dataWithId);
      expect(log.id).toBe('test-id');
    });

    it('should handle missing details', () => {
      const dataWithoutDetails = { ...activityLogData };
      delete dataWithoutDetails.details;
      const log = new ActivityLog(dataWithoutDetails);
      expect(log.details).toEqual({});
    });
  });

  describe('isRecent', () => {
    it('should return true for recent activity', () => {
      const recentData = {
        ...activityLogData,
        timestamp: new Date(Date.now() - 2 * 60 * 1000) // 2 minutes ago
      };
      const recentLog = new ActivityLog(recentData);
      expect(recentLog.isRecent()).toBe(true);
    });

    it('should return false for old activity', () => {
      const oldData = {
        ...activityLogData,
        timestamp: new Date(Date.now() - 10 * 60 * 1000) // 10 minutes ago
      };
      const oldLog = new ActivityLog(oldData);
      expect(oldLog.isRecent()).toBe(false);
    });

    it('should use custom minutes parameter', () => {
      const data = {
        ...activityLogData,
        timestamp: new Date(Date.now() - 8 * 60 * 1000) // 8 minutes ago
      };
      const log = new ActivityLog(data);
      expect(log.isRecent(10)).toBe(true);
      expect(log.isRecent(5)).toBe(false);
    });
  });

  describe('isToday', () => {
    it('should return true for today\'s activity', () => {
      const todayData = {
        ...activityLogData,
        timestamp: new Date()
      };
      const todayLog = new ActivityLog(todayData);
      expect(todayLog.isToday()).toBe(true);
    });

    it('should return false for yesterday\'s activity', () => {
      const yesterdayData = {
        ...activityLogData,
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000)
      };
      const yesterdayLog = new ActivityLog(yesterdayData);
      expect(yesterdayLog.isToday()).toBe(false);
    });
  });

  describe('isThisWeek', () => {
    it('should return true for this week\'s activity', () => {
      const thisWeekData = {
        ...activityLogData,
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
      };
      const thisWeekLog = new ActivityLog(thisWeekData);
      expect(thisWeekLog.isThisWeek()).toBe(true);
    });

    it('should return false for last week\'s activity', () => {
      const lastWeekData = {
        ...activityLogData,
        timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000) // 8 days ago
      };
      const lastWeekLog = new ActivityLog(lastWeekData);
      expect(lastWeekLog.isThisWeek()).toBe(false);
    });
  });

  describe('toDTO', () => {
    it('should return complete DTO', () => {
      const dto = activityLog.toDTO();
      expect(dto).toEqual({
        id: activityLog.id,
        userId: activityLog.userId,
        action: activityLog.action,
        details: activityLog.details,
        resourceType: activityLog.resourceType,
        resourceId: activityLog.resourceId,
        timestamp: activityLog.timestamp,
        createdAt: activityLog.createdAt,
        updatedAt: activityLog.updatedAt
      });
    });
  });

  describe('toSafeDTO', () => {
    it('should return safe DTO without sensitive data', () => {
      const safeDto = activityLog.toSafeDTO();
      expect(safeDto).toEqual({
        id: activityLog.id,
        action: activityLog.action,
        details: activityLog.details,
        resourceType: activityLog.resourceType,
        resourceId: activityLog.resourceId,
        timestamp: activityLog.timestamp
      });
      expect(safeDto.userId).toBeUndefined();
      expect(safeDto.createdAt).toBeUndefined();
      expect(safeDto.updatedAt).toBeUndefined();
    });
  });
});
