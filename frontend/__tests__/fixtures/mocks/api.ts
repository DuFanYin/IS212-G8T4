import { vi } from 'vitest';
import type { User } from '@/types/user';

interface AuthResponse {
  status: string;
  data?: {
    token: string;
    user: User;
  };
  message?: string;
}

interface UserResponse {
  status: string;
  data?: User[];
  message?: string;
}

// Mock API responses
export const mockApiResponses = {
  login: {
    success: {
      status: 'success',
      data: {
        token: 'mock-token',
        user: {
          id: '1',
          name: 'Test User',
          email: 'test@example.com',
          role: 'staff',
          teamId: '1',
          departmentId: '1'
        }
      }
    } as AuthResponse,
    error: {
      status: 'error',
      message: 'Invalid credentials'
    } as AuthResponse
  },
  users: {
    teamMembers: {
      status: 'success',
      data: [
        { id: '1', name: 'John Doe', email: 'john@example.com', role: 'staff', teamId: '1', departmentId: '1' },
        { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'staff', teamId: '1', departmentId: '1' }
      ]
    } as UserResponse,
    departmentMembers: {
      status: 'success',
      data: [
        { id: '1', name: 'John Doe', email: 'john@example.com', role: 'staff', teamId: '1', departmentId: '1' },
        { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'manager', teamId: '2', departmentId: '1' },
        { id: '3', name: 'Bob Wilson', email: 'bob@example.com', role: 'staff', teamId: '3', departmentId: '1' }
      ]
    } as UserResponse,
    error: {
      status: 'error',
      message: 'Failed to fetch users'
    } as UserResponse
  }
};

// Mock API service
export const mockAuthService = {
  login: vi.fn().mockImplementation((email: string, password: string) => {
    if (email === 'test@example.com' && password === 'password123') {
      return Promise.resolve(mockApiResponses.login.success);
    }
    return Promise.resolve({ status: 'error', message: 'Invalid email or password' });
  }),
  getProfile: vi.fn().mockImplementation((token: string) => {
    if (token === 'mock-token') {
      return Promise.resolve(mockApiResponses.login.success.data?.user);
    }
    return Promise.resolve({ status: 'error', message: 'Invalid token' });
  }),
  requestPasswordReset: vi.fn().mockImplementation((email: string) => {
    if (email) {
      return Promise.resolve({ status: 'success', message: 'Reset email sent' });
    }
    return Promise.resolve({ status: 'error', message: 'Email is required' });
  }),
  resetPassword: vi.fn().mockImplementation((token: string, newPassword: string) => {
    if (token && newPassword.length >= 6) {
      return Promise.resolve({ status: 'success', message: 'Password updated' });
    }
    return Promise.resolve({ status: 'error', message: 'Invalid token or password' });
  })
};

export const mockUserService = {
  getTeamMembers: vi.fn().mockImplementation((token: string) => {
    if (token === 'test-token') {
      return Promise.resolve(mockApiResponses.users.teamMembers);
    }
    return Promise.resolve(mockApiResponses.users.error);
  }),
  getDepartmentMembers: vi.fn().mockImplementation((token: string, departmentId?: string) => {
    if (token === 'test-token') {
      return Promise.resolve(mockApiResponses.users.departmentMembers);
    }
    return Promise.resolve(mockApiResponses.users.error);
  })
};