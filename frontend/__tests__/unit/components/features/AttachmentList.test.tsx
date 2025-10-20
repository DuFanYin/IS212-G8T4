import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import AttachmentList from '@/components/features/AttachmentList';

// Mock the task service
vi.mock('@/lib/services/task', () => ({
  taskService: {
    removeAttachment: vi.fn()
  }
}));

describe('AttachmentList', () => {
  const mockAttachments = [
    {
      _id: 'att-1',
      filename: 'test.pdf',
      path: '/path/to/test.pdf',
      uploadedBy: 'user1',
      uploadedAt: '2024-01-01T00:00:00.000Z'
    },
    {
      _id: 'att-2',
      filename: 'document.docx',
      path: '/path/to/document.docx',
      uploadedBy: 'user2',
      uploadedAt: '2024-01-02T00:00:00.000Z'
    }
  ];

  const defaultProps = {
    attachments: mockAttachments,
    taskId: 'task-1',
    token: 'test-token',
    onAttachmentRemoved: vi.fn(),
    onError: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders attachments list', () => {
    render(<AttachmentList {...defaultProps} />);
    expect(screen.getByText('Attachments')).toBeInTheDocument();
    expect(screen.getByText('test.pdf')).toBeInTheDocument();
    expect(screen.getByText('document.docx')).toBeInTheDocument();
  });

  it('shows no attachments message when empty', () => {
    render(<AttachmentList {...defaultProps} attachments={[]} />);
    expect(screen.getByText('No attachments')).toBeInTheDocument();
  });

  it('handles attachment removal', async () => {
    const { taskService } = await import('@/lib/services/task');
    vi.mocked(taskService.removeAttachment).mockResolvedValue({ status: 'success', message: 'Attachment removed' });

    render(<AttachmentList {...defaultProps} />);
    
    const removeButtons = screen.getAllByText('Remove');
    fireEvent.click(removeButtons[0]);

    await waitFor(() => {
      expect(vi.mocked(taskService.removeAttachment)).toHaveBeenCalledWith('test-token', 'task-1', 'att-1');
      expect(defaultProps.onAttachmentRemoved).toHaveBeenCalledWith('att-1');
    });
  });

  it('handles removal error', async () => {
    const { taskService } = await import('@/lib/services/task');
    vi.mocked(taskService.removeAttachment).mockRejectedValue(new Error('Remove failed'));

    render(<AttachmentList {...defaultProps} />);
    
    const removeButtons = screen.getAllByText('Remove');
    fireEvent.click(removeButtons[0]);

    await waitFor(() => {
      expect(defaultProps.onError).toHaveBeenCalledWith('Failed to remove attachment');
    });
  });
});
