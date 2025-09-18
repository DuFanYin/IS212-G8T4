import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { mockAuthService } from './mocks/api';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
}));

// Mock API service
vi.mock('@/services/api', () => ({
  authService: mockAuthService
}));