import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TaskItem } from '@/components/features/tasks/TaskItem';
import type { Task } from '@/lib/types/task';

const mockTask: Task = {
  id: '1',
  title: 'Test Task',
  description: 'Test description',
  status: 'ongoing',
  dueDate: '2024-12-31T00:00:00.000Z',
  createdBy: 'user1',
  assigneeId: 'user2',
  projectId: 'project1',
  collaborators: ['user1', 'user2'],
  attachments: [],
  isDeleted: false,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z'
};

const mockHandlers = {
  onEdit: vi.fn(),
  onAssign: vi.fn(),
  onStatusChange: vi.fn(),
  onArchive: vi.fn()
};

describe('TaskItem Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders task information', () => {
    render(
      <TaskItem
        task={mockTask}
        onEdit={mockHandlers.onEdit}
        onAssign={mockHandlers.onAssign}
        onStatusChange={mockHandlers.onStatusChange}
        onArchive={mockHandlers.onArchive}
        canAssign={true}
      />
    );

    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText('ONGOING')).toBeInTheDocument();
  });

  it('calls onStatusChange when status changes', () => {
    render(
      <TaskItem
        task={mockTask}
        onEdit={mockHandlers.onEdit}
        onAssign={mockHandlers.onAssign}
        onStatusChange={mockHandlers.onStatusChange}
        onArchive={mockHandlers.onArchive}
        canAssign={true}
      />
    );

    const statusSelect = screen.getByRole('combobox');
    fireEvent.change(statusSelect, { target: { value: 'completed' } });

    expect(mockHandlers.onStatusChange).toHaveBeenCalledWith(mockTask, 'completed');
  });

  it('shows assign button only for managers on unassigned tasks', () => {
    const unassignedTask = { ...mockTask, status: 'unassigned' as const };

    const { rerender } = render(
      <TaskItem
        task={unassignedTask}
        onEdit={mockHandlers.onEdit}
        onAssign={mockHandlers.onAssign}
        onStatusChange={mockHandlers.onStatusChange}
        onArchive={mockHandlers.onArchive}
        canAssign={true}
      />
    );

    expect(screen.getByText('Assign')).toBeInTheDocument();

    rerender(
      <TaskItem
        task={unassignedTask}
        onEdit={mockHandlers.onEdit}
        onAssign={mockHandlers.onAssign}
        onStatusChange={mockHandlers.onStatusChange}
        onArchive={mockHandlers.onArchive}
        canAssign={false}
      />
    );

    expect(screen.queryByText('Assign')).not.toBeInTheDocument();
  });
});
