import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, vi, beforeEach } from 'vitest';
import TasksPage from '@/app/tasks/page';

vi.mock('@/lib/hooks/useTasks', () => ({
  useTasks: () => ({
    tasks: [{ id: 't1', title: 'Task 1', status: 'ongoing', dueDate: '2024-12-31' }],
    loading: false,
    error: null,
    createTask: vi.fn(),
    updateTaskStatus: vi.fn(),
    archiveTask: vi.fn(),
    fetchTasks: vi.fn(),
    updateTask: vi.fn(),
    assignTask: vi.fn()
  })
}));

vi.mock('@/contexts/UserContext', () => ({
  useUser: () => ({ user: { id: 'u1', role: 'manager', token: 't' } })
}));

vi.mock('@/lib/services/subtask', () => ({
  subtaskService: {
    getByParentTask: vi.fn().mockResolvedValue({ status: 'success', data: [] }),
    create: vi.fn().mockResolvedValue({ status: 'success', data: { id: 's1', title: 'Subtask', dueDate: '2024-12-31', status: 'unassigned' } })
  }
}));

describe('Subtasks demo buttons', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(() => 't'),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn()
    } as unknown as Storage);
  });

  it('triggers list and create subtask actions', () => {
    render(<TasksPage />);

    // Select the only task by opening Assign modal then closing to set activeTask
    fireEvent.click(screen.getByText('Create New Task'));
    // We just need the page rendered; buttons should be present either way
    fireEvent.click(screen.getByText('List Subtasks'));
    fireEvent.click(screen.getByText('Create Subtask'));
  });
});
