import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import AttachmentUpload from '@/components/features/AttachmentUpload';

// Mock the task service
vi.mock('@/lib/services/task', () => ({
  taskService: {
    addAttachment: vi.fn()
  }
}));

describe('AttachmentUpload', () => {
  const defaultProps = {
    taskId: 'task-1',
    token: 'test-token',
    onAttachmentAdded: vi.fn(),
    onError: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders upload button', () => {
    render(<AttachmentUpload {...defaultProps} />);
    expect(screen.getByText('Add Attachment')).toBeInTheDocument();
  });

  it('handles file upload successfully', async () => {
    const mockFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    const { taskService } = await import('@/lib/services/task');
    vi.mocked(taskService.addAttachment).mockResolvedValue({
      status: 'success',
      data: {
        id: 'task-1',
        title: 'Test Task',
        description: 'Test Description',
        status: 'unassigned',
        priority: 5,
        dueDate: '2024-12-31T00:00:00.000Z',
        collaborators: [],
        attachments: [{ 
          filename: 'test.pdf', 
          path: '/path/to/file',
          uploadedBy: 'user-1',
          uploadedAt: '2024-01-01T00:00:00.000Z'
        }],
        isDeleted: false,
        createdBy: 'user-1',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      }
    });

    render(<AttachmentUpload {...defaultProps} />);
    
    const fileInput = screen.getByRole('button', { name: /add attachment/i });
    const input = fileInput.parentElement?.querySelector('input[type="file"]') as HTMLInputElement;
    
    fireEvent.change(input, { target: { files: [mockFile] } });

    await waitFor(() => {
      expect(vi.mocked(taskService.addAttachment)).toHaveBeenCalledWith('test-token', 'task-1', mockFile);
      expect(defaultProps.onAttachmentAdded).toHaveBeenCalled();
    });
  });

  it('handles file upload error', async () => {
    const mockFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    const { taskService } = await import('@/lib/services/task');
    vi.mocked(taskService.addAttachment).mockRejectedValue(new Error('Upload failed'));

    render(<AttachmentUpload {...defaultProps} />);
    
    const fileInput = screen.getByRole('button', { name: /add attachment/i });
    const input = fileInput.parentElement?.querySelector('input[type="file"]') as HTMLInputElement;
    
    fireEvent.change(input, { target: { files: [mockFile] } });

    await waitFor(() => {
      expect(defaultProps.onError).toHaveBeenCalledWith('Failed to upload attachment');
    });
  });

  it('validates file type', async () => {
    const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
    const { taskService } = await import('@/lib/services/task');

    render(<AttachmentUpload {...defaultProps} />);
    
    const fileInput = screen.getByRole('button', { name: /add attachment/i });
    const input = fileInput.parentElement?.querySelector('input[type="file"]') as HTMLInputElement;
    
    fireEvent.change(input, { target: { files: [mockFile] } });

    await waitFor(() => {
      expect(defaultProps.onError).toHaveBeenCalledWith('Only PDF, DOCX, and XLSX files are allowed');
      expect(vi.mocked(taskService.addAttachment)).not.toHaveBeenCalled();
    });
  });

  it('validates file size', async () => {
    // Create a large file (6MB)
    const mockFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.pdf', { type: 'application/pdf' });
    const { taskService } = await import('@/lib/services/task');

    render(<AttachmentUpload {...defaultProps} />);
    
    const fileInput = screen.getByRole('button', { name: /add attachment/i });
    const input = fileInput.parentElement?.querySelector('input[type="file"]') as HTMLInputElement;
    
    fireEvent.change(input, { target: { files: [mockFile] } });

    await waitFor(() => {
      expect(defaultProps.onError).toHaveBeenCalledWith('File size must be less than 5MB');
      expect(vi.mocked(taskService.addAttachment)).not.toHaveBeenCalled();
    });
  });
});
