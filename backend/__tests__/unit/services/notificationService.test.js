const Notification = require('../../../src/db/models/Notification');

jest.mock('../../../src/db/models/Notification');

describe('NotificationService', () => {
  it('should create notification successfully', async () => {
    const mockNotification = {
      _id: 'notif123',
      userId: 'user123',
      message: 'Test notification',
      type: 'task_assigned',
      link: '/tasks/123',
      read: false
    };

    Notification.create = jest.fn().mockResolvedValue(mockNotification);

    const notificationService = require('../../../src/services/notificationService');
    const result = await notificationService.createNotification({
      userId: 'user123',
      message: 'Test notification',
      type: 'task_assigned',
      link: '/tasks/123'
    });

    expect(result).toEqual(mockNotification);
  });

  it('should handle errors when creating notification', async () => {
    Notification.create = jest.fn().mockRejectedValue(new Error('Database error'));

    const notificationService = require('../../../src/services/notificationService');
    
    await expect(notificationService.createNotification({})).rejects.toThrow();
  });
});

