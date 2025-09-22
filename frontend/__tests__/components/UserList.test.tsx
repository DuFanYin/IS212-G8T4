import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { UserList } from '@/components/UserList';
import { mockUserService } from '../fixtures/api';

// Mock the hooks
vi.mock('@/hooks/useUsers', () => ({
  useTeamMembers: vi.fn(),
  useDepartmentMembers: vi.fn()
}));

const mockOnUserClick = vi.fn();

describe('UserList Component', () => {
  beforeEach(() => {
    mockOnUserClick.mockClear();
  });

  it('shows loading state', () => {
    const { useTeamMembers } = require('@/hooks/useUsers');
    useTeamMembers.mockReturnValue({
      users: [],
      loading: true,
      error: null
    });

    render(
      <UserList
        token="test-token"
        userRole="manager"
        onUserClick={mockOnUserClick}
      />
    );
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows error state', () => {
    const { useTeamMembers } = require('@/hooks/useUsers');
    useTeamMembers.mockReturnValue({
      users: [],
      loading: false,
      error: 'Failed to load users'
    });

    render(
      <UserList
        token="test-token"
        userRole="manager"
        onUserClick={mockOnUserClick}
      />
    );
    
    expect(screen.getByText('Error loading users: Failed to load users')).toBeInTheDocument();
  });

  it('shows no users message', () => {
    const { useTeamMembers } = require('@/hooks/useUsers');
    useTeamMembers.mockReturnValue({
      users: [],
      loading: false,
      error: null
    });

    render(
      <UserList
        token="test-token"
        userRole="manager"
        onUserClick={mockOnUserClick}
      />
    );
    
    expect(screen.getByText('No users found')).toBeInTheDocument();
  });

  it('displays team members for manager role', () => {
    const { useTeamMembers } = require('@/hooks/useUsers');
    useTeamMembers.mockReturnValue({
      users: [
        { id: '1', name: 'John Doe', email: 'john@example.com', role: 'staff' },
        { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'staff' }
      ],
      loading: false,
      error: null
    });

    render(
      <UserList
        token="test-token"
        userRole="manager"
        onUserClick={mockOnUserClick}
      />
    );
    
    expect(screen.getByText('Team Members (2)')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('displays department members for director role', () => {
    const { useDepartmentMembers } = require('@/hooks/useUsers');
    useDepartmentMembers.mockReturnValue({
      users: [
        { id: '1', name: 'John Doe', email: 'john@example.com', role: 'staff' },
        { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'manager' }
      ],
      loading: false,
      error: null
    });

    render(
      <UserList
        token="test-token"
        userRole="director"
        userDepartmentId="dept-1"
        onUserClick={mockOnUserClick}
      />
    );
    
    expect(screen.getByText('Department Members (2)')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('calls onUserClick when user is clicked', () => {
    const { useTeamMembers } = require('@/hooks/useUsers');
    const mockUser = { id: '1', name: 'John Doe', email: 'john@example.com', role: 'staff' };
    useTeamMembers.mockReturnValue({
      users: [mockUser],
      loading: false,
      error: null
    });

    render(
      <UserList
        token="test-token"
        userRole="manager"
        onUserClick={mockOnUserClick}
      />
    );
    
    fireEvent.click(screen.getByText('John Doe'));
    
    expect(mockOnUserClick).toHaveBeenCalledWith(mockUser);
  });
});
