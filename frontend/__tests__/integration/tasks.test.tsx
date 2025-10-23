import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TasksPage from '@/app/projects-tasks/page';
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

    expect(screen.getByText('Projects & Tasks')).toBeInTheDocument();
    expect(screen.getByText('New Project')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(<TasksPage />);

    expect(screen.getByText('Loading projects...')).toBeInTheDocument();
    expect(screen.getByText('Select a project or view unassigned tasks')).toBeInTheDocument();
  });

  it('shows task sections', () => {
    render(<TasksPage />);

    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('Tasks')).toBeInTheDocument();
  });

  it('shows loading messages', () => {
    render(<TasksPage />);

    expect(screen.getByText('Loading projects...')).toBeInTheDocument();
    expect(screen.getByText('Select a project or view unassigned tasks')).toBeInTheDocument();
  });
});
