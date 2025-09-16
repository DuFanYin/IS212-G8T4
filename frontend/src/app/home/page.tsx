'use client';

import { useUser } from '@/contexts/UserContext';
import UserProfile from '@/components/UserProfile';

export default function HomePage() {
  const { user } = useUser();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen pt-16 bg-gray-50">
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <h1 className="text-xl font-medium text-center mb-6">Welcome Back</h1>
          <UserProfile user={user} />
        </div>
      </div>
    </main>
  );
}