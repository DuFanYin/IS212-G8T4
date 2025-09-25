import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { UserList } from '@/components/features/users/UserList';
import { useTeamMembers, useDepartmentMembers } from '@/lib/hooks/useUsers';

// Mock the hooks
vi.mock('@/lib/hooks/useUsers', () => ({
  useTeamMembers: vi.fn(),
  useDepartmentMembers: vi.fn()
}));

// Get the mocked functions
const mockUseTeamMembers = vi.mocked(useTeamMembers);
const mockUseDepartmentMembers = vi.mocked(useDepartmentMembers);

const mockOnUserClick = vi.fn();

describe('UserList Component', () => {
  beforeEach(() => {
    mockOnUserClick.mockClear();
    mockUseTeamMembers.mockClear();
    mockUseDepartmentMembers.mockClear();
    
    // Set default mock return values
    mockUseTeamMembers.mockReturnValue({
      users: [],
      loading: false,
      error: null,
      refetch: vi.fn()
    });
    mockUseDepartmentMembers.mockReturnValue({
      users: [],
      loading: false,
      error: null,
      refetch: vi.fn()
    });
  });

  it('shows loading state', () => {
    mockUseTeamMembers.mockReturnValue({
      users: [],
      loading: true,
      error: null,
      refetch: vi.fn()
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
    mockUseTeamMembers.mockReturnValue({
      users: [],
      loading: false,
      error: 'Failed to load users',
      refetch: vi.fn()
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

  it('displays team members for manager role', () => {
    mockUseTeamMembers.mockReturnValue({
      users: [
        { id: '1', name: 'John Doe', email: 'john@example.com', role: 'staff' },
        { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'staff' }
      ],
      loading: false,
      error: null,
      refetch: vi.fn()
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
    mockUseDepartmentMembers.mockReturnValue({
      users: [
        { id: '1', name: 'John Doe', email: 'john@example.com', role: 'staff' },
        { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'manager' }
      ],
      loading: false,
      error: null,
      refetch: vi.fn()
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
    const mockUser = { id: '1', name: 'John Doe', email: 'john@example.com', role: 'staff' };
    mockUseTeamMembers.mockReturnValue({
      users: [mockUser],
      loading: false,
      error: null,
      refetch: vi.fn()
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
