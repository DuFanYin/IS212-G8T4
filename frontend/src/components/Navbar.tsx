'use client';

import { useUser } from '@/contexts/UserContext';

export default function Navbar() {
  const { user, logout } = useUser();

  if (!user) return null;

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white shadow-sm z-10">
      <div className="max-w-7xl mx-auto px-4 h-14 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <span className="font-medium">IS212-G8T4</span>
          <span className="text-sm text-gray-500">{user.role}</span>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">{user.name}</span>
          <button
            onClick={logout}
            className="px-3 py-1.5 bg-gray-100 text-sm text-gray-700 rounded hover:bg-gray-200"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
