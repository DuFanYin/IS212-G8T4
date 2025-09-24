import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useTasks } from '@/lib/hooks/useTasks';
import { taskService } from '@/lib/services/api';

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
    const mockTasks = [{ id: '1', title: 'Test Task', status: 'ongoing' }];
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
    const newTask = { id: '2', title: 'New Task', status: 'unassigned' };
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
      await result.current.createTask({ title: 'New Task', dueDate: '2024-12-31' });
    });

    await waitFor(() => {
      expect(result.current.tasks).toContain(newTask);
    });
  });

  it('updates task status', async () => {
    const updatedTask = { id: '1', title: 'Test Task', status: 'completed' };
    mockTaskService.getUserTasks.mockResolvedValue({
      status: 'success',
      data: [{ id: '1', title: 'Test Task', status: 'ongoing' }]
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
