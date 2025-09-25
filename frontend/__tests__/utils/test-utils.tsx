// Test utilities for common test operations
import { render, RenderOptions } from '@testing-library/react';
import { vi } from 'vitest';
import { ReactElement } from 'react';
import { UserProvider } from '@/contexts/UserContext';

// Custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <UserProvider>
      {children}
    </UserProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Helper to render with specific user context
export const renderWithUser = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  const UserWrapper = ({ children }: { children: React.ReactNode }) => (
    <UserProvider>
      {children}
    </UserProvider>
  );

  return render(ui, { wrapper: UserWrapper, ...options });
};

// Helper to create mock functions with proper typing
export const createMockFn = <T extends (...args: unknown[]) => unknown>(fn?: T) => {
  return fn ? vi.fn(fn) : vi.fn();
};

// Helper to wait for async operations
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0));

// Re-export everything from testing-library
export * from '@testing-library/react';
export { customRender as render };
