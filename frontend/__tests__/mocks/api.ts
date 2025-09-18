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