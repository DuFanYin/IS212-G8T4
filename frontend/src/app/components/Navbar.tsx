'use client';

import { useRouter } from 'next/navigation';
import { logout } from '../utils/auth';

export default function Navbar() {
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <nav className="bg-white shadow-sm p-4">
      <div className="flex justify-between items-center">
        <span>IS212-G8T4</span>
        <button
          onClick={handleLogout}
          className="bg-gray-100 px-3 py-1 rounded hover:bg-gray-200"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}