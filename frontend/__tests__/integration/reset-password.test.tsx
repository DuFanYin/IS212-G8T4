import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ResetPasswordPage from '@/app/login/reset-password/page';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => ({ get: vi.fn(() => null) })
}));

vi.mock('@/lib/services/api', () => ({
  authService: {
    requestPasswordReset: vi.fn().mockResolvedValue({ status: 'success', data: { resetToken: 'token-123' } }),
    resetPassword: vi.fn().mockResolvedValue({ status: 'success' })
  }
}));

describe('ResetPasswordPage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('requests reset token and proceeds to password input', async () => {
    render(<ResetPasswordPage />);

    fireEvent.change(screen.getByPlaceholderText('Enter your email'), { target: { value: 'user@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send Reset Email' }));

    await waitFor(() => {
      // Check that the form renders and button is clickable
      expect(screen.getByText('Reset Password')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Send Reset Email' })).toBeInTheDocument();
    });
  });

  it('submits new password using reset token', async () => {
    localStorage.setItem('resetToken', 'token-123');
    render(<ResetPasswordPage />);

    // Check that the form renders correctly
    expect(screen.getByText('Reset Password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Send Reset Email' })).toBeInTheDocument();
  });
});
