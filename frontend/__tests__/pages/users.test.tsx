import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import UsersPage from '@/app/users/page';
import { UserProvider } from '@/contexts/UserContext';

// Mock storage
vi.mock('@/utils/storage', () => ({
  storage: {
    getToken: vi.fn(() => 'test-token')
  }
}));

// Mock the hooks
vi.mock('@/hooks/useUsers', () => ({
  useTeamMembers: vi.fn(),
  useDepartmentMembers: vi.fn()
}));

// Mock UserContext
const mockUseUser = vi.fn();
vi.mock('@/contexts/UserContext', () => ({
  UserProvider: ({ children }: { children: React.ReactNode }) => children,
  useUser: mockUseUser
}));

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
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders user profile information', () => {
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
    expect(screen.getByText('Your Profile')).toBeInTheDocument();
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('manager')).toBeInTheDocument();
  });

  it('shows task assignment demo for users who can assign tasks', () => {
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
    
    expect(screen.getByText('Task Assignment Demo')).toBeInTheDocument();
    expect(screen.getByText('Select a user to assign a task to (based on your role permissions):')).toBeInTheDocument();
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

  it('displays role-based permissions information', () => {
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
    
    expect(screen.getByText('Role-Based Permissions')).toBeInTheDocument();
    expect(screen.getByText('Staff')).toBeInTheDocument();
    expect(screen.getByText('Manager')).toBeInTheDocument();
    expect(screen.getByText('Director')).toBeInTheDocument();
    expect(screen.getByText('HR')).toBeInTheDocument();
    expect(screen.getByText('Senior Management')).toBeInTheDocument();
  });
});