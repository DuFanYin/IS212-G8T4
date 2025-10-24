import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import UsersPage from '@/app/users/page';
import { UserProvider, useUser } from '@/contexts/UserContext';
import { useTeamMembers, useDepartmentMembers } from '@/lib/hooks/useUsers';

// Mock storage
vi.mock('@/utils/storage', () => ({
  storage: {
    getToken: vi.fn(() => 'test-token')
  }
}));

// Mock the hooks
vi.mock('@/lib/hooks/useUsers', () => ({
  useTeamMembers: vi.fn(),
  useDepartmentMembers: vi.fn()
}));

// Mock UserContext
vi.mock('@/contexts/UserContext', () => ({
  UserProvider: ({ children }: { children: React.ReactNode }) => children,
  useUser: vi.fn()
}));

// Get the mocked functions
const mockUseUser = vi.mocked(useUser);
const mockUseTeamMembers = vi.mocked(useTeamMembers);
const mockUseDepartmentMembers = vi.mocked(useDepartmentMembers);

const mockUser = {
  id: '1',
  name: 'Test User',
  email: 'test@example.com',
  role: 'manager',
  teamId: 'team-1',
  departmentId: 'dept-1'
};

describe('Users Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Set default mock for useUser
    mockUseUser.mockReturnValue({
      user: null,
      logout: vi.fn(),
      refreshUser: vi.fn(),
      canAssignTasks: () => false,
      canSeeAllTasks: () => false,
      canSeeDepartmentTasks: () => false,
      canSeeTeamTasks: () => false,
      getVisibleUsersScope: () => 'none'
    });
    
    // Set default mock for hooks
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

  it('renders loading state when user is not loaded', () => {
    mockUseUser.mockReturnValue({
      user: null,
      logout: vi.fn(),
      refreshUser: vi.fn(),
      canAssignTasks: () => false,
      canSeeAllTasks: () => false,
      canSeeDepartmentTasks: () => false,
      canSeeTeamTasks: () => false,
      getVisibleUsersScope: () => 'none'
    });

    render(
      <UserProvider>
        <UsersPage />
      </UserProvider>
    );
    
    // Check for loading skeleton instead of text
    const skeleton = document.querySelector('.animate-pulse.h-6.w-24.bg-gray-200.rounded');
    expect(skeleton).toBeInTheDocument();
  });

  it('renders user profile and shows task assignment demo for managers', () => {
    mockUseUser.mockReturnValue({
      user: mockUser,
      logout: vi.fn(),
      refreshUser: vi.fn(),
      canAssignTasks: () => true,
      canSeeAllTasks: () => false,
      canSeeDepartmentTasks: () => false,
      canSeeTeamTasks: () => true,
      getVisibleUsersScope: () => 'team'
    });

    render(
      <UserProvider>
        <UsersPage />
      </UserProvider>
    );
    
    expect(screen.getByText('User Management')).toBeInTheDocument();
    expect(screen.getByText(/Test User/)).toBeInTheDocument();
    expect(screen.getByText(/test@example.com/)).toBeInTheDocument();
    expect(screen.getByText(/Manager/)).toBeInTheDocument();
  });

  it('does not show task assignment demo for staff users', () => {
    const staffUser = { ...mockUser, role: 'staff' };
    mockUseUser.mockReturnValue({
      user: staffUser,
      logout: vi.fn(),
      refreshUser: vi.fn(),
      canAssignTasks: () => false,
      canSeeAllTasks: () => false,
      canSeeDepartmentTasks: () => false,
      canSeeTeamTasks: () => false,
      getVisibleUsersScope: () => 'none'
    });

    render(
      <UserProvider>
        <UsersPage />
      </UserProvider>
    );
    
    expect(screen.queryByText('Task Assignment Demo')).not.toBeInTheDocument();
  });
});
