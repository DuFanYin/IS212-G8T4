import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TaskItem } from '@/components/features/tasks/TaskItem';
import type { Task } from '@/lib/types/task';

const mockTask: Task = {
  id: '1',
  title: 'Test Task',
  description: 'Test description',
  status: 'ongoing',
  priority: 5,
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
      />
    );

    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText('ONGOING')).toBeInTheDocument();
  });

  it('renders priority badge', () => {
    render(
      <TaskItem
        task={mockTask}
      />
    );

    expect(screen.getByText('P5')).toBeInTheDocument();
  });

  it('renders unassigned task status', () => {
    const unassignedTask = { ...mockTask, status: 'unassigned' as const };

    render(
      <TaskItem
        task={unassignedTask}
      />
    );

    expect(screen.getByText('UNASSIGNED')).toBeInTheDocument();
  });
});
