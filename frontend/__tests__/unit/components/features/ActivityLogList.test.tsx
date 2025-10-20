import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import ActivityLogList from '@/components/features/ActivityLogList';

// Mock the activity log service
vi.mock('@/lib/services/activityLog', () => ({
  activityLogService: {
    getActivityLogs: vi.fn()
  }
}));

describe('ActivityLogList', () => {
  const mockLogs = [
    {
      id: 'log-1',
      taskId: 'task-1',
      userId: 'user1',
      action: 'created',
      details: { before: undefined, after: { title: 'Test Task' } },
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z'
    },
    {
      id: 'log-2',
      taskId: 'task-1',
      userId: 'user2',
      action: 'status_changed',
      details: { before: { status: 'ongoing' }, after: { status: 'completed' } },
      createdAt: '2024-01-02T00:00:00.000Z',
      updatedAt: '2024-01-02T00:00:00.000Z'
    }
  ];

  const defaultProps = {
    taskId: 'task-1',
    token: 'test-token',
    onError: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders activity logs', async () => {
    const { activityLogService } = await import('@/lib/services/activityLog');
    vi.mocked(activityLogService.getActivityLogs).mockResolvedValue({
      status: 'success',
      data: mockLogs
    });

    render(<ActivityLogList {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Activity Log')).toBeInTheDocument();
      expect(screen.getByText('Created task')).toBeInTheDocument();
      expect(screen.getByText('Changed status')).toBeInTheDocument();
    });
  });

  it('shows loading state', async () => {
    const { activityLogService } = await import('@/lib/services/activityLog');
    vi.mocked(activityLogService.getActivityLogs).mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<ActivityLogList {...defaultProps} />);
    expect(screen.getByTestId('activity-log-loading')).toBeInTheDocument(); // Check for loading skeleton
  });

  it('shows no activity message when empty', async () => {
    const { activityLogService } = await import('@/lib/services/activityLog');
    vi.mocked(activityLogService.getActivityLogs).mockResolvedValue({
      status: 'success',
      data: []
    });

    render(<ActivityLogList {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('No activity recorded')).toBeInTheDocument();
    });
  });

  it('handles fetch error', async () => {
    const { activityLogService } = await import('@/lib/services/activityLog');
    vi.mocked(activityLogService.getActivityLogs).mockRejectedValue(new Error('Fetch failed'));

    render(<ActivityLogList {...defaultProps} />);

    await waitFor(() => {
      expect(defaultProps.onError).toHaveBeenCalledWith('Failed to fetch activity logs');
    });
  });
});
