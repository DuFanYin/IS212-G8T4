import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTeamMembers, useDepartmentMembers } from '@/hooks/useUsers';
import { mockUserService } from '../fixtures/api';

// Mock the API service
vi.mock('@/services/api', () => ({
  userService: mockUserService
}));

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

  it('should handle network error', async () => {
    mockUserService.getTeamMembers.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useTeamMembers('test-token'));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.users).toEqual([]);
    expect(result.current.error).toBe('Failed to fetch team members');
  });

  it('should not fetch when token is empty', () => {
    const { result } = renderHook(() => useTeamMembers(''));

    expect(result.current.loading).toBe(false);
    expect(result.current.users).toEqual([]);
    expect(result.current.error).toBe(null);
    expect(mockUserService.getTeamMembers).not.toHaveBeenCalled();
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

  it('should refetch when departmentId changes', async () => {
    const { result, rerender } = renderHook(
      ({ token, departmentId }) => useDepartmentMembers(token, departmentId),
      { initialProps: { token: 'test-token', departmentId: 'dept-1' } }
    );

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(mockUserService.getDepartmentMembers).toHaveBeenCalledWith('test-token', 'dept-1');

    rerender({ token: 'test-token', departmentId: 'dept-2' });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(mockUserService.getDepartmentMembers).toHaveBeenCalledWith('test-token', 'dept-2');
  });
});
