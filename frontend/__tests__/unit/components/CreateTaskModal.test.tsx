import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import { CreateTaskModal } from '@/components/forms/CreateTaskModal';

const mockOnCreateTask = vi.fn();
const mockOnClose = vi.fn();

describe('CreateTaskModal Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders modal when open', () => {
    render(
      <CreateTaskModal
        isOpen={true}
        onClose={mockOnClose}
        onCreateTask={mockOnCreateTask}
      />
    );

    expect(screen.getByText('Create New Task')).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    render(
      <CreateTaskModal
        isOpen={true}
        onClose={mockOnClose}
        onCreateTask={mockOnCreateTask}
      />
    );

    // Try to submit the form by clicking the submit button
    const submitButton = screen.getByRole('button', { name: 'Create Task' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Title and due date are required')).toBeInTheDocument();
    });
    
    // Verify that onCreateTask was not called due to validation failure
    expect(mockOnCreateTask).not.toHaveBeenCalled();
  });

  it('creates task with valid data', async () => {
    mockOnCreateTask.mockResolvedValue(undefined);

    render(
      <CreateTaskModal
        isOpen={true}
        onClose={mockOnClose}
        onCreateTask={mockOnCreateTask}
      />
    );

    fireEvent.change(screen.getByLabelText('Title *'), { target: { value: 'Test Task' } });
    fireEvent.change(screen.getByLabelText('Due Date *'), { target: { value: '2024-12-31' } });
    fireEvent.click(screen.getByText('Create Task'));

    await waitFor(() => {
      expect(mockOnCreateTask).toHaveBeenCalledWith({
        title: 'Test Task',
        description: '',
        dueDate: '2024-12-31',
        assigneeId: '',
        projectId: '',
        collaborators: []
      });
    });
  });
});
