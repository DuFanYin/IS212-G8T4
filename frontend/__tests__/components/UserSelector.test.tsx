import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UserSelector } from '@/components/UserSelector';
import { mockUserService } from '../fixtures/api';

// Mock the hooks
vi.mock('@/hooks/useUsers', () => ({
  useTeamMembers: vi.fn(),
  useDepartmentMembers: vi.fn()
}));

const mockOnUserSelect = vi.fn();

describe('UserSelector Component', () => {
  beforeEach(() => {
    mockOnUserSelect.mockClear();
  });

  it('renders input field', () => {
    render(
      <UserSelector
        token="test-token"
        userRole="manager"
        onUserSelect={mockOnUserSelect}
      />
    );
    
    expect(screen.getByPlaceholderText('Select a user...')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    const { useTeamMembers } = require('@/hooks/useUsers');
    useTeamMembers.mockReturnValue({
      users: [],
      loading: true,
      error: null
    });

    render(
      <UserSelector
        token="test-token"
        userRole="manager"
        onUserSelect={mockOnUserSelect}
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
      <UserSelector
        token="test-token"
        userRole="manager"
        onUserSelect={mockOnUserSelect}
      />
    );
    
    expect(screen.getByText('Error loading users: Failed to load users')).toBeInTheDocument();
  });

  it('displays users when loaded', () => {
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
      <UserSelector
        token="test-token"
        userRole="manager"
        onUserSelect={mockOnUserSelect}
      />
    );
    
    const input = screen.getByPlaceholderText('Select a user...');
    fireEvent.focus(input);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('calls onUserSelect when user is clicked', () => {
    const { useTeamMembers } = require('@/hooks/useUsers');
    const mockUser = { id: '1', name: 'John Doe', email: 'john@example.com', role: 'staff' };
    useTeamMembers.mockReturnValue({
      users: [mockUser],
      loading: false,
      error: null
    });

    render(
      <UserSelector
        token="test-token"
        userRole="manager"
        onUserSelect={mockOnUserSelect}
      />
    );
    
    const input = screen.getByPlaceholderText('Select a user...');
    fireEvent.focus(input);
    
    fireEvent.click(screen.getByText('John Doe'));
    
    expect(mockOnUserSelect).toHaveBeenCalledWith(mockUser);
  });
});
