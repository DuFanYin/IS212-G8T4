import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { EditTaskModal } from '@/components/forms/EditTaskModal';

// Mock services
vi.mock('@/lib/services/task', () => ({
  taskService: {
    updateTask: vi.fn().mockResolvedValue({ status: 'success', data: {} })
  }
}));

describe('EditTaskModal', () => {
  const mockTask = {
    id: 'task-1',
    title: 'Test Task',
    description: 'Test Description',
    status: 'ongoing' as const,
    dueDate: '2024-12-31T00:00:00.000Z',
    priority: 5,
    collaborators: [],
    attachments: [],
    isDeleted: false,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  };

  const defaultProps = {
    isOpen: true,
    task: mockTask,
    onClose: vi.fn(),
    onUpdate: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders modal with task data', () => {
    render(<EditTaskModal {...defaultProps} />);
    expect(screen.getByDisplayValue('Test Task')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument();
  });

  it('calls onClose when cancel button clicked', () => {
    render(<EditTaskModal {...defaultProps} />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('calls onUpdate when save button clicked', async () => {
    render(<EditTaskModal {...defaultProps} />);
    fireEvent.click(screen.getByText('Save Changes'));
    expect(defaultProps.onUpdate).toHaveBeenCalled();
  });
});
