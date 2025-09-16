'use client';

import { useUser } from './contexts/UserContext';

export default function Home() {
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
          
          <div className="bg-white p-6 rounded shadow-sm space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Name:</span> {user.name}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Email:</span> {user.email}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Role:</span> {user.role}
              </p>
            </div>
            
            <div className="text-sm text-gray-500 pt-4 border-t">
              Task Management System
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}