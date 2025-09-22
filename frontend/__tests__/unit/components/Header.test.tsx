import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Header from '@/components/layout/Header';
import { useUser } from '@/contexts/UserContext';

// Mock user context
const mockLogout = vi.fn();
const mockRefreshUser = vi.fn();
const mockUser = {
  id: '1',
  name: 'Test User',
  email: 'test@example.com',
  role: 'staff'
};

vi.mock('@/contexts/UserContext', () => ({
  useUser: vi.fn(() => ({
    user: mockUser,
    logout: mockLogout,
    refreshUser: mockRefreshUser
  }))
}));

describe('Header Component', () => {
  beforeEach(() => {
    mockLogout.mockClear();
  });

  it('renders user information when logged in', () => {
    render(<Header />);
    
    // Check all user information is displayed
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('staff')).toBeInTheDocument();
    expect(screen.getByText('Task Management System')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Logout' })).toBeInTheDocument();
  });

  it('handles logout click', () => {
    render(<Header />);
    
    const logoutButton = screen.getByRole('button', { name: 'Logout' });
    fireEvent.click(logoutButton);
    
    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  it('renders correctly when user is not logged in', () => {
    // Override mock for this test
    vi.mocked(useUser).mockReturnValueOnce({
      user: null,
      logout: mockLogout,
      refreshUser: mockRefreshUser
    });

    render(<Header />);
    
    // Should only show the title
    expect(screen.getByText('Task Management System')).toBeInTheDocument();
    expect(screen.queryByText('Test User')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Logout' })).not.toBeInTheDocument();
  });
});