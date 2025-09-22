import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTeamMembers, useDepartmentMembers } from '@/lib/hooks/useUsers';
import { userService } from '@/lib/services/api';

// Mock the API service
vi.mock('@/lib/services/api', () => ({
  userService: {
    getTeamMembers: vi.fn(),
    getDepartmentMembers: vi.fn()
  }
}));

// Get the mocked functions
const mockUserService = vi.mocked(userService);

describe('useTeamMembers Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch team members successfully', async () => {
    const mockUsers = [
      { id: '1', name: 'John Doe', email: 'john@example.com', role: 'staff' },
      { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'staff' }
    ];
    
    mockUserService.getTeamMembers.mockResolvedValue({
      status: 'success',
      data: mockUsers
    });

    const { result } = renderHook(() => useTeamMembers('test-token'));

    expect(result.current.loading).toBe(true);
    expect(result.current.users).toEqual([]);
    expect(result.current.error).toBe(null);

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.users).toEqual(mockUsers);
    expect(result.current.error).toBe(null);
  });

  it('should handle API error', async () => {
    mockUserService.getTeamMembers.mockResolvedValue({
      status: 'error',
      message: 'Failed to fetch team members'
    });

    const { result } = renderHook(() => useTeamMembers('test-token'));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.users).toEqual([]);
    expect(result.current.error).toBe('Failed to fetch team members');
  });
});

describe('useDepartmentMembers Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch department members successfully', async () => {
    const mockUsers = [
      { id: '1', name: 'John Doe', email: 'john@example.com', role: 'staff' },
      { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'manager' }
    ];
    
    mockUserService.getDepartmentMembers.mockResolvedValue({
      status: 'success',
      data: mockUsers
    });

    const { result } = renderHook(() => useDepartmentMembers('test-token', 'dept-1'));

    expect(result.current.loading).toBe(true);

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.users).toEqual(mockUsers);
    expect(result.current.error).toBe(null);
  });
});
