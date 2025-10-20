import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { AssignTaskModal } from '@/components/forms/AssignTaskModal';

// Mock services
vi.mock('@/lib/services/task', () => ({
  taskService: {
    assignTask: vi.fn().mockResolvedValue({ status: 'success', data: {} })
  }
}));

vi.mock('@/lib/services/user', () => ({
  userService: {
    getUsers: vi.fn().mockResolvedValue({
      status: 'success',
      data: [
        { id: 'user1', name: 'User One' },
        { id: 'user2', name: 'User Two' }
      ]
    })
  }
}));

describe('AssignTaskModal', () => {
  const mockTask = {
    id: 'task-1',
    title: 'Test Task',
    description: 'Test Description',
    status: 'unassigned' as const,
    priority: 5,
    dueDate: '2024-12-31T00:00:00.000Z',
    collaborators: [],
    attachments: [],
    isDeleted: false,
    createdBy: 'user-1',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  };

  const defaultProps = {
    isOpen: true,
    task: mockTask,
    onClose: vi.fn(),
    onAssign: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders modal when open', () => {
    render(<AssignTaskModal {...defaultProps} />);
    expect(screen.getByRole('heading', { name: 'Assign Task' })).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<AssignTaskModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByText('Assign Task')).not.toBeInTheDocument();
  });

  it('calls onClose when cancel button clicked', () => {
    render(<AssignTaskModal {...defaultProps} />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(defaultProps.onClose).toHaveBeenCalled();
  });
});
