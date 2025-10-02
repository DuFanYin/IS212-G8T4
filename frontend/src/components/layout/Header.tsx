'use client';

import { useUser } from '@/contexts/UserContext';
import type { User } from '@/lib/types/user';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const { user, logout }: { user: User | null; logout: () => void } = useUser();
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900';
  };

  // Basic role helpers aligned with project visibility rules
  const normalizeRole = (role?: string) => (role || '').toLowerCase();
  const roleRank: Record<string, number> = {
    'staff': 1,
    'manager': 2,
    'director': 3,
    'hr': 4,
    'senior management': 5,
    'sm': 5
  };
  const getRank = (role?: string) => roleRank[normalizeRole(role)] || 0;
  const canViewTeam = getRank(user?.role) >= 2; // Manager+
  const canViewDepartment = getRank(user?.role) >= 3; // Director+

  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/projects-tasks" className="text-xl font-semibold">
              Task Management System
            </Link>
            {user && (
              <nav className="hidden md:flex space-x-6">
                <Link
                  href="/home"
                  className={`${isActive('/home')} flex items-center px-1 py-2 text-sm font-medium`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/projects-tasks"
                  className={`${isActive('/projects-tasks')} flex items-center px-1 py-2 text-sm font-medium`}
                >
                  Projects & Tasks
                </Link>
                {(canViewTeam || canViewDepartment) && (
                  <Link
                    href="/orgnisation"
                    className={`${isActive('/orgnisation')} flex items-center px-1 py-2 text-sm font-medium`}
                  >
                    Organization
                  </Link>
                )}
              </nav>
            )}
          </div>
          {user && (
            <div className="flex items-center space-x-4">
              <Link href="/users" className="text-sm text-gray-600 hover:text-gray-900 underline">
                {user.name}
              </Link>
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