const TaskService = require('../../../src/services/taskService');
const TaskRepository = require('../../../src/repositories/TaskRepository');
const Task = require('../../../src/domain/Task');
const UserRepository = require('../../../src/repositories/UserRepository');
const User = require('../../../src/domain/User');

jest.mock('../../../src/repositories/TaskRepository');
jest.mock('../../../src/repositories/UserRepository');
jest.mock('../../../src/domain/Task');
jest.mock('../../../src/domain/User');

describe('TaskService - Attachment Operations', () => {
  let mockTaskRepository;
  let mockUserRepository;

  beforeEach(() => {
    mockTaskRepository = {
      findById: jest.fn()
    };

    mockUserRepository = {
      findById: jest.fn()
    };

    TaskRepository.mockImplementation(() => mockTaskRepository);
    UserRepository.mockImplementation(() => mockUserRepository);

    // Import the singleton service
    const taskService = require('../../../src/services/taskService');
    taskService.taskRepository = mockTaskRepository;
    taskService.userRepository = mockUserRepository;

    jest.clearAllMocks();
  });

  describe('removeAttachment', () => {
    it('should remove attachment from task successfully', async () => {
      // Mock MongoDB attachment object with deleteOne method
      const mockAttachment = { 
        _id: 'attach1', 
        filename: 'test.pdf',
        toObject: jest.fn().mockReturnValue({ _id: 'attach1', filename: 'test.pdf' }),
        deleteOne: jest.fn()
      };
      const mockTaskDoc = { 
        _id: 'task123', 
        attachments: {
          id: jest.fn((id) => id === 'attach1' ? mockAttachment : null)
        },
        save: jest.fn().mockResolvedValue(true),
      };

      const mockTask = { 
        id: 'task123',
        status: 'ongoing',
        canRemoveAttachment: jest.fn().mockReturnValue(true)
      };

      mockTaskRepository.findById = jest.fn().mockResolvedValue(mockTaskDoc);
      mockUserRepository.findById = jest.fn().mockResolvedValue({ _id: 'user123' });
      User.mockImplementation(() => ({ id: 'user123' }));
      Task.mockImplementation(() => mockTask);

      const result = await TaskService.removeAttachment('task123', 'attach1', 'user123');

      expect(mockTaskDoc.save).toHaveBeenCalled();
    });

    it('should handle errors when attachment not found', async () => {
      const mockTaskDoc = { 
        _id: 'task123', 
        attachments: {
          id: jest.fn().mockReturnValue(null)
        }
      };

      const mockTask = { 
        id: 'task123',
        canRemoveAttachment: jest.fn().mockReturnValue(true)
      };

      mockTaskRepository.findById = jest.fn().mockResolvedValue(mockTaskDoc);
      Task.mockImplementation(() => mockTask);

      await expect(TaskService.removeAttachment('task123', 'nonexistent', 'user123')).rejects.toThrow();
    });
  });
});

