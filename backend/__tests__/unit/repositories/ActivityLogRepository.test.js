const ActivityLogRepository = require('../../../src/repositories/ActivityLogRepository');
const ActivityLogModel = require('../../../src/db/models/ActivityLog');

// Mock the ActivityLogModel
jest.mock('../../../src/db/models/ActivityLog');

describe('ActivityLogRepository', () => {
  let repository;

  beforeEach(() => {
    repository = new ActivityLogRepository();
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should find activity log by id', async () => {
      const mockActivityLog = { _id: '507f1f77bcf86cd799439011', action: 'created' };
      ActivityLogModel.findById.mockResolvedValue(mockActivityLog);

      const result = await repository.findById('507f1f77bcf86cd799439011');

      expect(ActivityLogModel.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(result).toBe(mockActivityLog);
    });
  });

  describe('findByUser', () => {
    it('should find activity logs by user id', async () => {
      const mockActivityLogs = [
        { _id: '507f1f77bcf86cd799439011', userId: '507f1f77bcf86cd799439012' },
        { _id: '507f1f77bcf86cd799439013', userId: '507f1f77bcf86cd799439012' }
      ];
      ActivityLogModel.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockActivityLogs)
      });

      const result = await repository.findByUser('507f1f77bcf86cd799439012');

      expect(ActivityLogModel.find).toHaveBeenCalledWith({ userId: '507f1f77bcf86cd799439012' });
      expect(result).toBe(mockActivityLogs);
    });

    it('should find activity logs by user id with filters', async () => {
      const mockActivityLogs = [{ _id: '507f1f77bcf86cd799439011' }];
      const filters = { action: 'created' };
      ActivityLogModel.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockActivityLogs)
      });

      const result = await repository.findByUser('507f1f77bcf86cd799439012', filters);

      expect(ActivityLogModel.find).toHaveBeenCalledWith({ 
        userId: '507f1f77bcf86cd799439012', 
        ...filters 
      });
      expect(result).toBe(mockActivityLogs);
    });
  });

  describe('findByResource', () => {
    it('should find activity logs by resource type and id', async () => {
      const mockActivityLogs = [
        { _id: '507f1f77bcf86cd799439011', resourceType: 'task', resourceId: '507f1f77bcf86cd799439013' }
      ];
      ActivityLogModel.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockActivityLogs)
      });

      const result = await repository.findByResource('task', '507f1f77bcf86cd799439013');

      expect(ActivityLogModel.find).toHaveBeenCalledWith({ 
        resourceType: 'task', 
        resourceId: '507f1f77bcf86cd799439013' 
      });
      expect(result).toBe(mockActivityLogs);
    });
  });

  describe('findAll', () => {
    it('should find all activity logs', async () => {
      const mockActivityLogs = [
        { _id: '507f1f77bcf86cd799439011' },
        { _id: '507f1f77bcf86cd799439013' }
      ];
      ActivityLogModel.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockActivityLogs)
      });

      const result = await repository.findAll();

      expect(ActivityLogModel.find).toHaveBeenCalledWith({});
      expect(result).toBe(mockActivityLogs);
    });

    it('should find all activity logs with filters', async () => {
      const mockActivityLogs = [{ _id: '507f1f77bcf86cd799439011' }];
      const filters = { action: 'created' };
      ActivityLogModel.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockActivityLogs)
      });

      const result = await repository.findAll(filters);

      expect(ActivityLogModel.find).toHaveBeenCalledWith(filters);
      expect(result).toBe(mockActivityLogs);
    });
  });

  describe('create', () => {
    it('should create new activity log', async () => {
      const activityData = {
        userId: '507f1f77bcf86cd799439012',
        action: 'created',
        resourceType: 'task',
        resourceId: '507f1f77bcf86cd799439013'
      };
      const mockCreatedLog = { _id: '507f1f77bcf86cd799439011', ...activityData };
      ActivityLogModel.create.mockResolvedValue(mockCreatedLog);

      const result = await repository.create(activityData);

      expect(ActivityLogModel.create).toHaveBeenCalledWith(activityData);
      expect(result).toBe(mockCreatedLog);
    });
  });

  describe('updateById', () => {
    it('should update activity log by id', async () => {
      const updates = { action: 'updated' };
      const mockUpdatedLog = { _id: '507f1f77bcf86cd799439011', ...updates };
      ActivityLogModel.findByIdAndUpdate.mockResolvedValue(mockUpdatedLog);

      const result = await repository.updateById('507f1f77bcf86cd799439011', updates);

      expect(ActivityLogModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011', 
        updates, 
        { new: true }
      );
      expect(result).toBe(mockUpdatedLog);
    });
  });
});
