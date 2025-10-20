'use client';

import { useState, useEffect } from 'react';
import { authService } from '@/lib/services/auth';
import { useRouter, useSearchParams } from 'next/navigation';

type Errors = {
  email?: string;
  password?: string;
  general?: string;
}

const Message = ({ text, type = 'error' }: { text: string; type?: 'error' | 'success' }) => (
  <div className={`p-3 rounded text-sm mb-4 ${type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
    {text}
  </div>
);

const Input = ({ type, placeholder, value, onChange, error }: {
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
}) => (
  <div>
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`w-full p-2 border rounded ${error ? 'border-red-500' : 'border-gray-300'}`}
    />
    {error && <p className="text-sm text-red-600">{error}</p>}
  </div>
);

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [message, setMessage] = useState({ text: '', type: 'error' as 'error' | 'success' });
  const [resetToken, setResetToken] = useState<string | null>(null);

  useEffect(() => {
    // Check if token is provided in URL (from email link)
    const token = searchParams.get('token');
    if (token) {
      setResetToken(token);
    }
  }, [searchParams]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setMessage({ text: '', type: 'error' });

    if (!email) {
      setErrors({ email: 'Email is required' });
      return;
    }

    try {
      const res = await authService.requestPasswordReset(email);
      if (res.status === 'success') {
        setEmailSent(true);
        setMessage({ 
          text: 'Password reset email sent! Please check your inbox and click the link to reset your password.', 
          type: 'success' 
        });
      } else {
        setErrors({ general: res.message || 'Unable to send reset email' });
      }
    } catch (error) {
      console.error('Password reset request error:', error);
      setErrors({ general: 'Request failed. Please try again.' });
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setMessage({ text: '', type: 'error' });

    if (!newPassword || newPassword.length < 6) {
      setErrors({ password: 'Password must be at least 6 characters' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrors({ password: 'Passwords do not match' });
      return;
    }

    if (!resetToken) {
      setErrors({ general: 'Invalid reset token' });
      return;
    }

    try {
      const res = await authService.resetPassword(resetToken, newPassword);
      if (res.status === 'success') {
        setMessage({ text: 'Password updated successfully! Redirecting to login...', type: 'success' });
        setTimeout(() => router.push('/login'), 2000);
      } else {
        setErrors({ general: res.message || 'Failed to reset password' });
      }
    } catch (error) {
      console.error('Password reset error:', error);
      setErrors({ general: 'Reset failed. Please try again.' });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm p-6">
        <h1 className="text-xl font-medium text-center mb-6">Reset Password</h1>

        {errors.general && <Message text={errors.general} type="error" />}
        {message.text && <Message text={message.text} type={message.type} />}

        {!emailSent && !resetToken ? (
          // Step 1: Request password reset
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div className="text-sm text-gray-600 mb-4">
              Enter your email address and we&apos;ll send you a link to reset your password.
            </div>
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
            />
            <button
              type="submit"
              className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Send Reset Email
            </button>
          </form>
        ) : resetToken ? (
          // Step 2: Reset password with token from email
          <form onSubmit={handlePasswordReset} className="space-y-4">
            <div className="text-sm text-gray-600 mb-4">
              Enter your new password below.
            </div>
            <Input
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              error={errors.password}
            />
            <Input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={errors.password}
            />
            <button
              type="submit"
              className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Update Password
            </button>
          </form>
        ) : (
          // Step 3: Email sent confirmation
          <div className="text-center space-y-4">
            <div className="text-green-600">
              ✓ Email sent successfully!
            </div>
            <div className="text-sm text-gray-600">
              Please check your email and click the reset link to continue.
            </div>
            <button
              onClick={() => {
                setEmailSent(false);
                setEmail('');
                setMessage({ text: '', type: 'error' });
              }}
              className="w-full p-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Send Another Email
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={() => router.push('/login')}
          className="w-full mt-4 text-sm text-blue-500 hover:text-blue-600"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}