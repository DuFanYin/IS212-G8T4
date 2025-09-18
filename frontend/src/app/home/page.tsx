'use client';

import { useUser } from '@/contexts/UserContext';
import type { User } from '@/types/user';
import Link from 'next/link';

export default function HomePage() {
  const { user }: { user: User | null } = useUser();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user.name}!</h1>
            <p className="text-gray-600">Heres an overview of your workspace</p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">My Tasks</h3>
                <span className="text-2xl font-bold text-blue-600">5</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>2 ongoing</span>
                <span>3 pending review</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Active Projects</h3>
                <span className="text-2xl font-bold text-green-600">3</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>2 on track</span>
                <span>1 delayed</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Team Tasks</h3>
                <span className="text-2xl font-bold text-purple-600">8</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>5 ongoing</span>
                <span>3 completed</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Due Soon</h3>
                <span className="text-2xl font-bold text-red-600">2</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>This week</span>
                <span>High priority</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Quick Actions */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-medium mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 gap-4">
                  <Link href="/tasks" className="flex items-center p-4 border rounded hover:bg-gray-50">
                    <svg className="h-6 w-6 text-blue-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <div>
                      <h3 className="font-medium">View All Tasks</h3>
                      <p className="text-sm text-gray-500">Manage your tasks</p>
                    </div>
                  </Link>
                  <Link href="/projects" className="flex items-center p-4 border rounded hover:bg-gray-50">
                    <svg className="h-6 w-6 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                    </svg>
                    <div>
                      <h3 className="font-medium">View Projects</h3>
                      <p className="text-sm text-gray-500">Track project progress</p>
                    </div>
                  </Link>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-medium mb-4">Recent Activity</h2>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-600">New task added to <span className="font-medium">Website Redesign</span></p>
                      <p className="text-sm text-gray-400">2 hours ago</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-600">Task <span className="font-medium">Update Privacy Policy</span> marked as complete</p>
                      <p className="text-sm text-gray-400">4 hours ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Team/Department Info */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-medium mb-4">Organization</h2>
                {user?.teamId && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-500">Team</h3>
                    <p className="text-sm mb-2">Frontend Development</p>
                    <div className="flex items-center space-x-2">
                      <span className="inline-block w-2 h-2 rounded-full bg-green-400"></span>
                      <span className="text-sm text-gray-500">5 members active</span>
                    </div>
                  </div>
                )}
                {user?.departmentId && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Department</h3>
                    <p className="text-sm mb-2">Engineering</p>
                    <div className="flex items-center space-x-2">
                      <span className="inline-block w-2 h-2 rounded-full bg-blue-400"></span>
                      <span className="text-sm text-gray-500">3 active projects</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Upcoming Deadlines */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-medium mb-4">Upcoming Deadlines</h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Homepage Design</p>
                      <p className="text-sm text-gray-500">Due in 2 days</p>
                    </div>
                    <span className="px-2 py-1 text-xs rounded bg-red-100 text-red-800">Urgent</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">API Documentation</p>
                      <p className="text-sm text-gray-500">Due next week</p>
                    </div>
                    <span className="px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-800">Medium</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}