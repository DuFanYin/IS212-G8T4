import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ResetPasswordPage from '@/app/login/reset-password/page';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() })
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
    fireEvent.click(screen.getByRole('button', { name: 'Verify Email' }));

    await waitFor(() => {
      expect(localStorage.getItem('resetToken')).toBe('token-123');
      expect(screen.getByText(/Email verified/i)).toBeInTheDocument();
    });
  });

  it('submits new password using reset token', async () => {
    localStorage.setItem('resetToken', 'token-123');
    render(<ResetPasswordPage />);

    // First step: verify email to show password form
    fireEvent.change(screen.getByPlaceholderText('Enter your email'), { target: { value: 'user@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: 'Verify Email' }));

    await screen.findByText(/Email verified/i);

    // Second step: submit new password
    fireEvent.change(screen.getByPlaceholderText('Enter new password'), { target: { value: 'Password123!' } });
    fireEvent.click(screen.getByRole('button', { name: 'Update Password' }));

    await waitFor(() => {
      expect(screen.getByText(/Password updated successfully/i)).toBeInTheDocument();
    });
  });
});
