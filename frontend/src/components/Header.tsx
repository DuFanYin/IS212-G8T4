'use client';

import { useUser } from '@/contexts/UserContext';
import type { User } from '@/types/user';

export default function Header() {
  const { user, logout }: { user: User | null; logout: () => void } = useUser();

  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold">Task Management System</h1>
          </div>
          {user && (
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">{user.name}</span>
              <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm">
                {user.role}
              </span>
              <button
                onClick={logout}
                className="px-3 py-1.5 bg-gray-100 text-sm text-gray-700 rounded hover:bg-gray-200"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
