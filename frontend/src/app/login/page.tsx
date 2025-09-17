'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { authService } from '@/services/api';
import { storage } from '@/utils/storage';

export default function LoginPage() {
  const router = useRouter();
  const { user, refreshUser } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetMessage, setResetMessage] = useState('');

  useEffect(() => {
    if (user) {
      router.push('/home');
    }
  }, [user, router]);

  if (user) {
    return null;
  }

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResetMessage('');
    
    try {
      const response = await authService.requestPasswordReset(resetEmail);
      if (response.status === 'success') {
        setResetMessage('Reset token sent! Please check your email.');
        setResetToken(response.data.resetToken);
      } else {
        setError(response.message || 'Failed to request password reset');
      }
    } catch {
      setError('Connection error');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResetMessage('');

    try {
      const response = await authService.resetPassword(resetToken, newPassword);
      if (response.status === 'success') {
        setResetMessage('Password reset successful! Please login.');
        setIsResetting(false);
        setResetToken('');
        setNewPassword('');
      } else {
        setError(response.message || 'Failed to reset password');
      }
    } catch {
      setError('Connection error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await authService.login(email, password);
      
      if (data.status === 'success') {
        storage.setToken(data.data.token);
        await refreshUser();
        router.push('/home');
      } else {
        setError('Invalid credentials');
      }
    } catch {
      setError('Connection error');
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm p-6">
        <h1 className="text-xl font-medium text-center mb-6">IS212-G8T4</h1>

        {error && (
          <div className="mb-4 p-2 text-sm text-red-600 bg-red-50 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded focus:ring-1 focus:ring-blue-500"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded focus:ring-1 focus:ring-blue-500"
            required
          />

          <button
            type="submit"
            className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Login
          </button>
        </form>

        <button
            type="button"
            onClick={() => setIsResetting(!isResetting)}
            className="w-full mt-4 text-sm text-blue-500 hover:text-blue-600"
          >
            {isResetting ? 'Back to Login' : 'Forgot Password?'}
          </button>

        {isResetting && (
          <div className="mt-6">
            <h2 className="text-lg font-medium mb-4">Reset Password</h2>
            {!resetToken ? (
              <form onSubmit={handleResetRequest} className="space-y-4">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full p-2 border rounded focus:ring-1 focus:ring-blue-500"
                  required
                />
                <button
                  type="submit"
                  className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Request Reset
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <input
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-2 border rounded focus:ring-1 focus:ring-blue-500"
                  required
                />
                <button
                  type="submit"
                  className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Reset Password
                </button>
              </form>
            )}
          </div>
        )}

        {resetMessage && (
          <div className="mt-4 p-2 text-sm text-green-600 bg-green-50 rounded">
            {resetMessage}
          </div>
        )}

        <div className="mt-4 text-center text-sm text-gray-500">
          test123@example.com / 123456
        </div>
      </div>
    </div>
  );
}