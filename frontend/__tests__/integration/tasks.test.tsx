import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TasksPage from '@/app/tasks/page';
import { useTasks } from '@/lib/hooks/useTasks';
import { mockTasks } from '../utils/mocks';

vi.mock('@/lib/hooks/useTasks');
vi.mock('@/contexts/UserContext', () => ({
  useUser: () => ({ user: { id: '1', role: 'manager', token: 'test-token' } })
}));

const mockUseTasks = vi.mocked(useTasks);

describe('TasksPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseTasks.mockReturnValue({
      tasks: mockTasks,
      loading: false,
      error: null,
      createTask: vi.fn(),
      updateTaskStatus: vi.fn(),
      archiveTask: vi.fn(),
      fetchTasks: vi.fn(),
      updateTask: vi.fn(),
      assignTask: vi.fn()
    });
  });

  it('renders tasks page', () => {
    render(<TasksPage />);

    expect(screen.getByText('Tasks')).toBeInTheDocument();
    expect(screen.getByText(mockTasks[0].title)).toBeInTheDocument();
    expect(screen.getByText(mockTasks[1].title)).toBeInTheDocument();
  });

  it('shows create task button', () => {
    render(<TasksPage />);

    expect(screen.getByText('Create New Task')).toBeInTheDocument();
  });

  it('filters tasks by status', () => {
    render(<TasksPage />);

    fireEvent.click(screen.getByText('Unassigned (1)'));

    expect(screen.getByText(mockTasks[1].title)).toBeInTheDocument();
    expect(screen.queryByText(mockTasks[0].title)).not.toBeInTheDocument();
  });

  it('shows role-based task counts', () => {
    render(<TasksPage />);

    expect(screen.getByText('All Tasks (2)')).toBeInTheDocument();
    expect(screen.getByText('Ongoing (1)')).toBeInTheDocument();
    expect(screen.getByText('Unassigned (1)')).toBeInTheDocument();
  });
});
