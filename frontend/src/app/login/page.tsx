'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { authService } from '@/lib/services/api';
import { storage } from '@/lib/utils/storage';

type Errors = {
  email?: string;
  password?: string;
  general?: string;
}

// Combined message component for both error and success
const Message = ({ text, type = 'error' }: { text: string; type?: 'error' | 'success' }) => (
  <div className={`p-2 text-sm rounded ${
    type === 'error' 
      ? 'mb-4 text-red-600 bg-red-50' 
      : 'mt-4 text-green-600 bg-green-50'
  }`}>
    {text}
  </div>
);

// Simplified input component
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
    {error && <div data-testid="input-error" className="text-sm text-red-600 error-message">{error}</div>}
  </div>
);

// Simple validation keeping all checks
const validate = (email: string, password: string) => {
  const errors: Errors = {};
  if (!email || !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
    errors.email = 'Please enter a valid email';
  }
  if (!password || password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }
  return errors;
};


export default function LoginPage() {
  const router = useRouter();
  const { user, refreshUser } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Errors>({});

  useEffect(() => {
    if (user) router.push('/home');
  }, [user, router]);

  if (user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    const validationErrors = validate(email, password);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    try {
      const data = await authService.login(email, password);
      if (data.status === 'success') {
        storage.setToken(data.data.token);
        await refreshUser();
        router.push('/home');
      } else {
        setErrors({ general: 'Invalid email or password' });
      }
    } catch {
      setErrors({ 
        general: 'Unable to connect to the server. Please try again later.'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full max-w-sm p-6 mx-auto pt-10">
        <h1 className="text-xl font-medium text-center mb-6">IS212-G8T4</h1>

        {errors.general && <Message text={errors.general} type="error" />}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              const validationErrors = validate(e.target.value, password);
              setErrors(prev => ({ ...prev, email: validationErrors.email }));
            }}
            error={errors.email}
          />

          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
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
          onClick={() => router.push('/login/reset-password')}
          className="w-full mt-4 text-sm text-blue-500 hover:text-blue-600"
        >
          Forgot Password?
        </button>
      </div>

      {/* Wider credentials section (no horizontal scroll) */}
      <div className="w-full max-w-4xl mx-auto p-6">
        <div className="text-sm text-gray-600">
          <div className="font-medium mb-2 text-gray-800">Seeded Credentials</div>
          <div className="mb-2">
            <span className="font-medium">Password:</span> Password123!
          </div>
          <table className="w-full border border-gray-200 rounded text-left">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-3 py-2 font-medium text-gray-800 border-b">Staff</th>
                <th className="px-3 py-2 font-medium text-gray-800 border-b">Managers</th>
                <th className="px-3 py-2 font-medium text-gray-800 border-b">Directors</th>
                <th className="px-3 py-2 font-medium text-gray-800 border-b">HR</th>
                <th className="px-3 py-2 font-medium text-gray-800 border-b">Senior Management</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-3 py-2 align-top">
                  <ul className="space-y-0.5">
                    <li>staff0@example.com</li>
                    <li>staff1@example.com</li>
                    <li>staff2@example.com</li>
                    <li>staff3@example.com</li>
                    <li>staff4@example.com</li>
                    <li>staff5@example.com</li>
                  </ul>
                </td>
                <td className="px-3 py-2 align-top">
                  <ul className="space-y-0.5">
                    <li>manager0@example.com</li>
                    <li>manager1@example.com</li>
                    <li>manager2@example.com</li>
                  </ul>
                </td>
                <td className="px-3 py-2 align-top">
                  <ul className="space-y-0.5">
                    <li>director0@example.com</li>
                    <li>director1@example.com</li>
                  </ul>
                </td>
                <td className="px-3 py-2 align-top">
                  <ul className="space-y-0.5">
                    <li>hr0@example.com</li>
                    <li>hr1@example.com</li>
                  </ul>
                </td>
                <td className="px-3 py-2 align-top">
                  <ul className="space-y-0.5">
                    <li>sm0@example.com</li>
                    <li>sm1@example.com</li>
                  </ul>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}