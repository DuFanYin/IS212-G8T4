'use client';

import { useState } from 'react';
import { authService } from '@/lib/services/api';
import { useRouter } from 'next/navigation';

// No local mock; use real endpoints

type Errors = {
  email?: string;
  password?: string;
  general?: string;
}

const Message = ({ text, type = 'error' }: { text: string; type?: 'error' | 'success' }) => (
  <div className={`p-2 text-sm rounded ${
    type === 'error' 
      ? 'mb-4 text-red-600 bg-red-50' 
      : 'mt-4 text-green-600 bg-green-50'
  }`}>
    {text}
  </div>
);

const Input = ({ 
  type, 
  value, 
  onChange, 
  error, 
  placeholder 
}: { 
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  placeholder: string;
}) => (
  <div className="space-y-1">
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full p-2 border rounded focus:ring-1 focus:ring-blue-500 ${error ? 'border-red-500' : ''}`}
    />
    {error && <p className="text-sm text-red-600">{error}</p>}
  </div>
);

export default function ResetPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [message, setMessage] = useState({ text: '', type: 'error' as 'error' | 'success' });

  const handleEmailCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setMessage({ text: '', type: 'error' });

    try {
      const res = await authService.requestPasswordReset(email);
      if (res.status === 'success' && res.data?.resetToken) {
        localStorage.setItem('resetToken', res.data.resetToken);
        setEmailVerified(true);
        setMessage({ text: 'Email verified! Please set your new password.', type: 'success' });
      } else {
        setErrors({ general: res.message || 'Unable to verify email' });
      }
    } catch {
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

    const token = localStorage.getItem('resetToken') || '';
    try {
      const res = await authService.resetPassword(token, newPassword);
      if (res.status === 'success') {
        setMessage({ text: 'Password updated successfully! Redirecting to login...', type: 'success' });
        setTimeout(() => router.push('/login'), 2000);
      } else {
        setErrors({ general: res.message || 'Failed to reset password' });
      }
    } catch {
      setErrors({ general: 'Reset failed. Please try again.' });
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm p-6">
        <h1 className="text-xl font-medium text-center mb-6">Reset Password</h1>

        {errors.general && <Message text={errors.general} type="error" />}
        {message.text && <Message text={message.text} type={message.type} />}

        {!emailVerified ? (
          <form onSubmit={handleEmailCheck} className="space-y-4">
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
              Verify Email
            </button>
          </form>
        ) : (
          <form onSubmit={handlePasswordReset} className="space-y-4">
            <div className="mb-4 text-sm text-gray-600">
              Setting new password for: {email}
            </div>
            <Input
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              error={errors.password}
            />
            <button
              type="submit"
              className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Update Password
            </button>
          </form>
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
