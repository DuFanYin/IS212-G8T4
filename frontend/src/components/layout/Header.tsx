'use client';

import { useUser } from '@/contexts/UserContext';
import type { User } from '@/lib/types/user';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { canViewTeam, canViewDepartment } from '@/lib/utils/access';
import Dropdown from './Dropdown';
import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';

type Notification = {
  _id?: string;
  id?: string;
  message: string;
  link?: string;
};

export default function Header() {
  const { user, logout }: { user: User | null; logout: () => void } = useUser();
  const pathname = usePathname();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loadingNoti, setLoadingNoti] = useState(true);

  const fetchNotifications = async (userId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('⚠️ No token found in localStorage');
        return;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      console.log('📬 Notifications from backend:', data);
      setNotifications(data.data || []);
    } catch (err) {
      console.error('❌ Failed to fetch notifications:', err);
    } finally {
      setLoadingNoti(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchNotifications(user.id);
    }
  }, [user]);

  useEffect(() => {
    const handleRefresh = () => {
      console.log('🔁 Refreshing notifications after task update...');
      if (user?.id) {
        fetchNotifications(user.id);
      }
    };

    window.addEventListener('refreshNotifications', handleRefresh);
    return () => {
      window.removeEventListener('refreshNotifications', handleRefresh);
    };
  }, [user]);

  const isActive = (path: string) => {
    return pathname === path ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900';
  };

  const canTeam = canViewTeam(user?.role);
  const canDept = canViewDepartment(user?.role);

  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/projects-tasks" className="text-xl font-semibold">
              Task Management System
            </Link>
            {user && (
              <nav className="hidden md:flex space-x-6">
                <Link href="/home" className={`${isActive('/home')} flex items-center px-1 py-2 text-sm font-medium`}>
                  Dashboard
                </Link>
                <Link
                  href="/projects-tasks"
                  className={`${isActive('/projects-tasks')} flex items-center px-1 py-2 text-sm font-medium`}
                >
                  Projects & Tasks
                </Link>
                {(canTeam || canDept) && (
                  <Link
                    href="/orgnisation"
                    className={`${isActive('/orgnisation')} flex items-center px-1 py-2 text-sm font-medium`}
                  >
                    Organization
                  </Link>
                )}
                <Dropdown label="Report" options={['Personal', 'Team', 'Department', 'Company']} />
              </nav>
            )}
          </div>
          {user && (
            <div className="flex items-center space-x-4 relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-full hover:bg-gray-100"
              >
                <Bell className="w-5 h-5 text-gray-700" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                  {notifications.length}
                </span>
              </button>

              <Link href="/users" className="text-sm text-gray-600 hover:text-gray-900 underline">
                {user.name}
              </Link>
              <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm">{user.role}</span>
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

      {showNotifications && (
        <div className="fixed top-16 right-20 z-50 w-80 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
          <div className="p-3 text-sm font-medium text-gray-700 border-b">Notifications</div>
          {loadingNoti ? (
            <div className="p-4 text-sm text-gray-500 text-center">Loading...</div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-sm text-gray-500 text-center">No notifications</div>
          ) : (

            notifications.map((n, index) => (
              <Link
                key={n._id || n.id || `notif-${index}`}
                href={n.link || '#'} // Use the link from the notification
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                onClick={() => setShowNotifications(false)} // This closes the dropdown on click
              >
                {n.message}
              </Link>
            ))
          )}
        </div>
      )}
    </header>
  );
}
