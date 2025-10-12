import { vi } from 'vitest';
import { activityLogService } from '@/lib/services/activityLog';

// Mock fetch
global.fetch = vi.fn();

describe('ActivityLogService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls correct API endpoint for getting activity logs', async () => {
    const mockResponse = {
      status: 'success',
      data: [
        {
          id: 'log-1',
          taskId: 'task-1',
          userId: 'user1',
          action: 'created',
          details: { before: null, after: { title: 'Test Task' } },
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        }
      ]
    };

    (fetch as any).mockResolvedValue({
      json: () => Promise.resolve(mockResponse)
    });

    const result = await activityLogService.getActivityLogs('test-token', { resourceId: 'task-1' });

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/logs/',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-token'
        }),
        body: JSON.stringify({ resourceId: 'task-1' })
      })
    );

    expect(result).toEqual(mockResponse);
  });

  it('handles API error response', async () => {
    const mockErrorResponse = {
      status: 'error',
      message: 'Failed to fetch logs'
    };

    (fetch as any).mockResolvedValue({
      json: () => Promise.resolve(mockErrorResponse)
    });

    const result = await activityLogService.getActivityLogs('test-token');

    expect(result).toEqual(mockErrorResponse);
  });
});
