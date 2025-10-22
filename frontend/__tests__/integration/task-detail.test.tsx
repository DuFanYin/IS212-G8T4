import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import TaskDetailPage from '@/app/projects-tasks/task/[id]/page';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useParams: () => ({ id: 'task-1' }),
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn()
  })
}));

// Mock services
vi.mock('@/lib/services/task', () => ({
  taskService: {
    getTaskById: vi.fn().mockResolvedValue({
      status: 'success',
      data: {
        id: 'task-1',
        title: 'Test Task',
        description: 'Test Description',
        status: 'ongoing',
        priority: 5,
        dueDate: '2024-12-31T00:00:00.000Z',
        attachments: [],
        collaborators: [],
        isDeleted: false,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      }
    })
  }
}));

vi.mock('@/lib/services/subtask', () => ({
  subtaskService: {
    getByParentTask: vi.fn().mockResolvedValue({
      status: 'success',
      data: []
    })
  }
}));

// Mock UserContext
vi.mock('@/contexts/UserContext', () => ({
  useUser: () => ({
    user: {
      id: 'user1',
      name: 'Test User',
      role: 'manager',
      token: 'test-token'
    },
    canAssignTasks: () => true
  })
}));

describe('Task Detail Page Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders task details', async () => {
    render(<TaskDetailPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Task')).toBeInTheDocument();
      expect(screen.getByText('Test Description')).toBeInTheDocument();
    });
  });

  it('renders attachment components', async () => {
    render(<TaskDetailPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Attachments')).toBeInTheDocument();
      expect(screen.getByText('Add Attachment')).toBeInTheDocument();
    });
  });

  it('renders activity log component', async () => {
    render(<TaskDetailPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Activity Log')).toBeInTheDocument();
    });
  });
});
