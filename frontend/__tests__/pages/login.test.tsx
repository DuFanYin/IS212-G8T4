import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginPage from '@/app/login/page';
import { UserProvider, useUser } from '@/contexts/UserContext';
import { mockAuthService } from '../fixtures/mocks/api';
import { storage } from '@/utils/storage';

// Mock storage
vi.mock('@/utils/storage', () => ({
  storage: {
    setToken: vi.fn(),
    getToken: vi.fn(),
    removeToken: vi.fn()
  }
}));

// Mock router
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush
  })
}));

// Mock UserContext
vi.mock('@/contexts/UserContext', () => ({
  UserProvider: ({ children }: { children: React.ReactNode }) => children,
  useUser: vi.fn()
}));

// Get the mocked functions
const mockUseUser = vi.mocked(useUser);

describe('Login Page', () => {
  beforeEach(() => {
    mockAuthService.login.mockClear();
    vi.mocked(storage.setToken).mockClear();
    mockPush.mockClear();
    mockUseUser.mockClear();
    
    // Default mock for useUser
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
  });

  it('should handle successful login', async () => {
    render(
      <UserProvider>
        <LoginPage />
      </UserProvider>
    );
    
    // Fill in form with valid credentials
    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'password123' }
    });
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: 'Login' }));
    
    // Verify API was called with correct data
    expect(mockAuthService.login).toHaveBeenCalledWith(
      'test@example.com',
      'password123'
    );
    
    // Verify successful login flow
    await waitFor(() => {
      expect(storage.setToken).toHaveBeenCalledWith('mock-token');
      expect(mockPush).toHaveBeenCalledWith('/home');
    });
  });

  it('should show error message on failed login', async () => {
    // Mock failed login response
    mockAuthService.login.mockResolvedValueOnce({
      status: 'error',
      message: 'Invalid email or password'
    });

    render(
      <UserProvider>
        <LoginPage />
      </UserProvider>
    );
    
    // Fill and submit form with wrong credentials
    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'wrong@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'wrongpass' }
    });
    fireEvent.click(screen.getByRole('button', { name: 'Login' }));
    
    // Verify error message appears
    await waitFor(() => {
      expect(screen.getByText('Invalid email or password')).toBeInTheDocument();
    });
    
    // Verify no success actions were called
    expect(storage.setToken).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalledWith('/home');
  });

  it('should validate email format', async () => {
    render(
      <UserProvider>
        <LoginPage />
      </UserProvider>
    );
    
    // Submit with invalid email
    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'invalid-email' }
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'password123' }
    });
    fireEvent.click(screen.getByRole('button', { name: 'Login' }));
    
    // Verify validation error appears
    await waitFor(() => {
      const errorMessage = screen.getByTestId('input-error');
      expect(errorMessage).toHaveClass('error-message');
      expect(errorMessage).toHaveTextContent('Please enter a valid email');
    });
    
    // Verify API was not called
    expect(mockAuthService.login).not.toHaveBeenCalled();
  });
});