import { vi } from 'vitest';

export const mockAuthService = {
  login: vi.fn().mockResolvedValue({
    status: 'success',
    data: { token: 'mock-token', user: { id: '1', name: 'Test User' } }
  }),
  logout: vi.fn().mockResolvedValue({ status: 'success' }),
  refreshToken: vi.fn().mockResolvedValue({
    status: 'success',
    data: { token: 'new-mock-token' }
  })
};

export const mockTaskService = {
  getUserTasks: vi.fn().mockResolvedValue({
    status: 'success',
    data: []
  }),
  createTask: vi.fn().mockResolvedValue({
    status: 'success',
    data: { id: '2', title: 'New Task', status: 'unassigned' }
  }),
  updateTask: vi.fn().mockResolvedValue({
    status: 'success',
    data: { id: '1', title: 'Updated Task', status: 'ongoing' }
  }),
  updateTaskStatus: vi.fn().mockResolvedValue({
    status: 'success',
    data: { id: '1', title: 'Test Task', status: 'completed' }
  }),
  assignTask: vi.fn().mockResolvedValue({
    status: 'success',
    data: { id: '1', title: 'Test Task', status: 'ongoing', assigneeId: 'user2' }
  }),
  archiveTask: vi.fn().mockResolvedValue({
    status: 'success',
    data: { id: '1', title: 'Test Task', isDeleted: true }
  })
};

export const mockUserService = {
  getUsers: vi.fn().mockResolvedValue({
    status: 'success',
    data: []
  }),
  getUserById: vi.fn().mockResolvedValue({
    status: 'success',
    data: { id: '1', name: 'Test User', email: 'test@example.com' }
  })
};
