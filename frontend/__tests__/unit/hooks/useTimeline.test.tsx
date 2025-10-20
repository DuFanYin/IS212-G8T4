import { renderHook } from '@testing-library/react';
import { vi } from 'vitest';
import { useTimeline } from '@/lib/hooks/useTimeline';

// Mock UserContext
vi.mock('@/contexts/UserContext', () => ({
  useUser: () => ({
    user: {
      id: 'user1',
      token: 'test-token',
      role: 'manager'
    }
  })
}));

// Mock services
vi.mock('@/lib/services/api', () => ({
  projectService: {
    getProjects: vi.fn().mockResolvedValue({
      status: 'success',
      data: []
    })
  }
}));

vi.mock('@/lib/services/subtask', () => ({
  subtaskService: {
    getByParentTask: vi.fn().mockResolvedValue({
      status: 'success',
      data: []
    })
  }
}));

vi.mock('@/lib/utils/orgAccess', () => ({
  getVisibleTasks: vi.fn().mockResolvedValue({
    status: 'success',
    data: []
  })
}));

vi.mock('@/lib/utils/timeline', () => ({
  getProjectDates: vi.fn().mockReturnValue({
    start: new Date(),
    end: new Date()
  })
}));

describe('useTimeline', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with default values', () => {
    const { result } = renderHook(() => useTimeline({}));
    
    expect(result.current.timelineItems).toEqual([]);
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('returns timeline data structure', () => {
    const { result } = renderHook(() => useTimeline({}));
    
    expect(result.current).toHaveProperty('timelineItems');
    expect(result.current).toHaveProperty('loading');
    expect(result.current).toHaveProperty('error');
    expect(result.current).toHaveProperty('visibleProjects');
    expect(result.current).toHaveProperty('projectSpans');
    expect(result.current).toHaveProperty('refetch');
  });
});
