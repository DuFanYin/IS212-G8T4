// Mock dependencies before importing
jest.mock('../../../src/repositories/ActivityLogRepository');
jest.mock('../../../src/domain/ActivityLog');

const ActivityLogRepository = require('../../../src/repositories/ActivityLogRepository');
const ActivityLog = require('../../../src/domain/ActivityLog');

describe('ActivityLogService', () => {
  let mockRepository;
  let activityLogService;

  beforeEach(() => {
    mockRepository = {
      create: jest.fn(),
      findByUser: jest.fn(),
      findByResource: jest.fn(),
      findAll: jest.fn()
    };
    
    // Mock the repository constructor to return our mock
    ActivityLogRepository.mockImplementation(() => mockRepository);
    
    // Import the singleton service after mocking
    activityLogService = require('../../../src/services/activityLogService');
    
    // Replace the service's repository with our mock
    activityLogService.activityLogRepository = mockRepository;
    
    jest.clearAllMocks();
  });

  describe('logActivity', () => {
    it('should log activity successfully', async () => {
      const mockActivityData = {
        taskId: '507f1f77bcf86cd799439013',
        userId: '507f1f77bcf86cd799439012',
        action: 'created',
        details: { before: null, after: { name: 'Test Task' } }
      };
      const mockCreatedLog = { _id: '507f1f77bcf86cd799439011', ...mockActivityData };
      const mockActivityLog = { id: '507f1f77bcf86cd799439011' };

      mockRepository.create.mockResolvedValue(mockCreatedLog);
      ActivityLog.mockImplementation(() => mockActivityLog);

      const result = await activityLogService.logActivity('created', '507f1f77bcf86cd799439013', null, { name: 'Test Task' }, '507f1f77bcf86cd799439012');

      expect(mockRepository.create).toHaveBeenCalledWith({
        taskId: '507f1f77bcf86cd799439013',
        userId: '507f1f77bcf86cd799439012',
        action: 'created',
        details: { before: null, after: { name: 'Test Task' } }
      });
      expect(ActivityLog).toHaveBeenCalledWith(mockCreatedLog);
      expect(result).toBe(mockActivityLog);
    });

    it('should throw error when repository fails', async () => {
      const error = new Error('Database connection failed');
      mockRepository.create.mockRejectedValue(error);

      await expect(activityLogService.logActivity('created', '507f1f77bcf86cd799439013', null, {}, '507f1f77bcf86cd799439012'))
        .rejects.toThrow('Error in logging: Database connection failed');
    });
  });

  describe('getUserActivityLogs', () => {
    it('should get user activity logs successfully', async () => {
      const mockActivityDocs = [
        { _id: '507f1f77bcf86cd799439011', userId: '507f1f77bcf86cd799439012' },
        { _id: '507f1f77bcf86cd799439013', userId: '507f1f77bcf86cd799439012' }
      ];
      const mockActivityLogs = [
        { id: '507f1f77bcf86cd799439011' },
        { id: '507f1f77bcf86cd799439013' }
      ];

      mockRepository.findByUser.mockResolvedValue(mockActivityDocs);
      ActivityLog.mockImplementation((doc) => ({ id: doc._id }));

      const result = await activityLogService.getUserActivityLogs('507f1f77bcf86cd799439012');

      expect(mockRepository.findByUser).toHaveBeenCalledWith('507f1f77bcf86cd799439012', {});
      expect(result).toEqual(mockActivityLogs);
    });

    it('should get user activity logs with filters', async () => {
      const filters = { action: 'created' };
      const mockActivityDocs = [{ _id: '507f1f77bcf86cd799439011' }];
      const mockActivityLogs = [{ id: '507f1f77bcf86cd799439011' }];

      mockRepository.findByUser.mockResolvedValue(mockActivityDocs);
      ActivityLog.mockImplementation((doc) => ({ id: doc._id }));

      const result = await activityLogService.getUserActivityLogs('507f1f77bcf86cd799439012', filters);

      expect(mockRepository.findByUser).toHaveBeenCalledWith('507f1f77bcf86cd799439012', filters);
      expect(result).toEqual(mockActivityLogs);
    });

    it('should throw error when repository fails', async () => {
      const error = new Error('Database error');
      mockRepository.findByUser.mockRejectedValue(error);

      await expect(activityLogService.getUserActivityLogs('507f1f77bcf86cd799439012'))
        .rejects.toThrow('Database error');
    });
  });

  describe('getResourceActivityLogs', () => {
    it('should get resource activity logs successfully', async () => {
      const mockActivityDocs = [
        { _id: '507f1f77bcf86cd799439011', resourceType: 'task', resourceId: '507f1f77bcf86cd799439013' }
      ];
      const mockActivityLogs = [{ id: '507f1f77bcf86cd799439011' }];

      mockRepository.findByResource.mockResolvedValue(mockActivityDocs);
      ActivityLog.mockImplementation((doc) => ({ id: doc._id }));

      const result = await activityLogService.getResourceActivityLogs('task', '507f1f77bcf86cd799439013');

      expect(mockRepository.findByResource).toHaveBeenCalledWith('task', '507f1f77bcf86cd799439013');
      expect(result).toEqual(mockActivityLogs);
    });

    it('should throw error when repository fails', async () => {
      const error = new Error('Database error');
      mockRepository.findByResource.mockRejectedValue(error);

      await expect(activityLogService.getResourceActivityLogs('task', '507f1f77bcf86cd799439013'))
        .rejects.toThrow('Database error');
    });
  });

  describe('getAllActivityLogs', () => {
    it('should get all activity logs successfully', async () => {
      const mockActivityDocs = [
        { _id: '507f1f77bcf86cd799439011' },
        { _id: '507f1f77bcf86cd799439013' }
      ];
      const mockActivityLogs = [
        { id: '507f1f77bcf86cd799439011' },
        { id: '507f1f77bcf86cd799439013' }
      ];

      mockRepository.findAll.mockResolvedValue(mockActivityDocs);
      ActivityLog.mockImplementation((doc) => ({ id: doc._id }));

      const result = await activityLogService.getAllActivityLogs();

      expect(mockRepository.findAll).toHaveBeenCalledWith({});
      expect(result).toEqual(mockActivityLogs);
    });

    it('should get all activity logs with filters', async () => {
      const filters = { action: 'created' };
      const mockActivityDocs = [{ _id: '507f1f77bcf86cd799439011' }];
      const mockActivityLogs = [{ id: '507f1f77bcf86cd799439011' }];

      mockRepository.findAll.mockResolvedValue(mockActivityDocs);
      ActivityLog.mockImplementation((doc) => ({ id: doc._id }));

      const result = await activityLogService.getAllActivityLogs(filters);

      expect(mockRepository.findAll).toHaveBeenCalledWith(filters);
      expect(result).toEqual(mockActivityLogs);
    });

    it('should throw error when repository fails', async () => {
      const error = new Error('Database error');
      mockRepository.findAll.mockRejectedValue(error);

      await expect(activityLogService.getAllActivityLogs())
        .rejects.toThrow('Database error');
    });
  });
});
