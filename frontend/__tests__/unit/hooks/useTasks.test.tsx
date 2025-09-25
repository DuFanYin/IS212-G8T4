import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useTasks } from '@/lib/hooks/useTasks';
import { taskService } from '@/lib/services/api';
import type { Task } from '@/lib/types/task';

vi.mock('@/lib/services/api');
vi.mock('@/contexts/UserContext', () => ({
  useUser: () => ({ user: { token: 'test-token' } })
}));

const mockTaskService = vi.mocked(taskService);

describe('useTasks Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches tasks on mount', async () => {
    const mockTasks: Task[] = [{
      id: '1',
      title: 'Test Task',
      description: 'Desc',
      status: 'ongoing',
      dueDate: '2024-12-31',
      createdBy: 'u1',
      collaborators: [],
      attachments: [],
      isDeleted: false,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z'
    }];
    mockTaskService.getUserTasks.mockResolvedValue({
      status: 'success',
      data: mockTasks
    });

    const { result } = renderHook(() => useTasks());

    await waitFor(() => {
      expect(result.current.tasks).toEqual(mockTasks);
    });

    expect(mockTaskService.getUserTasks).toHaveBeenCalledWith('test-token');
  });

  it('creates task successfully', async () => {
    const newTask: Task = {
      id: '2',
      title: 'New Task',
      description: 'New task description',
      status: 'unassigned',
      dueDate: '2024-12-31',
      createdBy: 'u1',
      collaborators: [],
      attachments: [],
      isDeleted: false,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z'
    };
    mockTaskService.getUserTasks.mockResolvedValue({ status: 'success', data: [] });
    mockTaskService.createTask.mockResolvedValue({
      status: 'success',
      data: newTask
    });

    const { result } = renderHook(() => useTasks());

    await waitFor(() => {
      expect(result.current.tasks).toEqual([]);
    });

    await act(async () => {
      await result.current.createTask({ title: 'New Task', description: 'Test description', dueDate: '2024-12-31' });
    });

    await waitFor(() => {
      expect(result.current.tasks).toContain(newTask);
    });
  });

  it('updates task status', async () => {
    const updatedTask: Task = {
      id: '1',
      title: 'Test Task',
      description: 'Desc',
      status: 'completed',
      dueDate: '2024-12-31',
      createdBy: 'u1',
      collaborators: [],
      attachments: [],
      isDeleted: false,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z'
    };
    mockTaskService.getUserTasks.mockResolvedValue({
      status: 'success',
      data: [{
        id: '1',
        title: 'Test Task',
        description: 'Desc',
        status: 'ongoing',
        dueDate: '2024-12-31',
        createdBy: 'u1',
        collaborators: [],
        attachments: [],
        isDeleted: false,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      }]
    });
    mockTaskService.updateTaskStatus.mockResolvedValue({
      status: 'success',
      data: updatedTask
    });

    const { result } = renderHook(() => useTasks());

    await waitFor(() => {
      expect(result.current.tasks).toHaveLength(1);
    });

    await act(async () => {
      await result.current.updateTaskStatus('1', { status: 'completed' });
    });

    await waitFor(() => {
      expect(result.current.tasks[0].status).toBe('completed');
    });
  });
});
