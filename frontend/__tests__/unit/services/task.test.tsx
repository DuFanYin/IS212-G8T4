import { vi } from 'vitest';
import { taskService } from '@/lib/services/task';

// Mock fetch
global.fetch = vi.fn();

describe('TaskService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls correct API for adding attachment', async () => {
    const mockFile = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    const mockResponse = { status: 'success', data: { id: 'task-1', attachments: [] } };

    (fetch as any).mockResolvedValue({
      json: () => Promise.resolve(mockResponse)
    });

    await taskService.addAttachment('test-token', 'task-1', mockFile);

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/tasks/task-1/attachments',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token'
        })
      })
    );
  });

  it('calls correct API for removing attachment', async () => {
    const mockResponse = { status: 'success', message: 'Attachment removed' };

    (fetch as any).mockResolvedValue({
      json: () => Promise.resolve(mockResponse)
    });

    await taskService.removeAttachment('test-token', 'task-1', 'att-1');

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/tasks/task-1/attachments/att-1',
      expect.objectContaining({
        method: 'DELETE',
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token'
        })
      })
    );
  });

  it('calls correct API for getting unassigned tasks', async () => {
    const mockResponse = { status: 'success', data: [] };

    (fetch as any).mockResolvedValue({
      json: () => Promise.resolve(mockResponse)
    });

    await taskService.getUnassignedTasks('test-token');

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/tasks/unassigned',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token'
        })
      })
    );
  });
});
