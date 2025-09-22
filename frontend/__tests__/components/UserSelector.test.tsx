import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { UserSelector } from '@/components/UserSelector';
import { useTeamMembers, useDepartmentMembers } from '@/hooks/useUsers';

// Mock the hooks
vi.mock('@/hooks/useUsers', () => ({
  useTeamMembers: vi.fn(),
  useDepartmentMembers: vi.fn()
}));

// Get the mocked functions
const mockUseTeamMembers = vi.mocked(useTeamMembers);
const mockUseDepartmentMembers = vi.mocked(useDepartmentMembers);

const mockOnUserSelect = vi.fn();

describe('UserSelector Component', () => {
  beforeEach(() => {
    mockOnUserSelect.mockClear();
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
    mockUseTeamMembers.mockReturnValue({
      users: [],
      loading: true,
      error: null,
      refetch: vi.fn()
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

  it('displays users when loaded and allows selection', () => {
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
    
    fireEvent.click(screen.getByText('John Doe'));
    
    expect(mockOnUserSelect).toHaveBeenCalledWith({
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'staff'
    });
  });
});
