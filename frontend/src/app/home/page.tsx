'use client';

import { useUser } from '@/contexts/UserContext';
import type { User } from '@/types/user';

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
      {/* Main Content */}
      <main>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Tasks Overview */}
            <div className="lg:col-span-2 space-y-6">
              {/* Quick Actions */}
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium">Quick Actions</h2>
                  <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                    Create New Task
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <button className="p-3 border rounded text-center hover:bg-gray-50">
                    My Tasks
                  </button>
                  <button className="p-3 border rounded text-center hover:bg-gray-50">
                    Team Tasks
                  </button>
                  <button className="p-3 border rounded text-center hover:bg-gray-50">
                    Under Review
                  </button>
                  <button className="p-3 border rounded text-center hover:bg-gray-50">
                    Completed
                  </button>
                </div>
              </div>

              {/* Tasks List */}
              <div className="bg-white p-4 rounded-lg shadow">
                <h2 className="text-lg font-medium mb-4">My Tasks</h2>
                <div className="space-y-4">
                  {/* Sample Task Items */}
                  <div className="border p-4 rounded hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">Implement New Homepage</h3>
                        <p className="text-sm text-gray-500">Due: Dec 31, 2023</p>
                        <div className="mt-2 flex items-center space-x-2">
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded">2 subtasks</span>
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded">3 comments</span>
                        </div>
                      </div>
                      <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-800 text-sm">
                        Ongoing
                      </span>
                    </div>
                  </div>
                  <div className="border p-4 rounded hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">Update Privacy Policy</h3>
                        <p className="text-sm text-gray-500">Due: Dec 25, 2023</p>
                        <div className="mt-2 flex items-center space-x-2">
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded">1 attachment</span>
                        </div>
                      </div>
                      <span className="px-2 py-1 rounded bg-purple-100 text-purple-800 text-sm">
                        Under Review
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Projects & Activity */}
            <div className="space-y-6">
              {/* Projects Overview */}
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium">Projects</h2>
                  <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
                    New Project
                  </button>
                </div>
                <div className="space-y-3">
                  <div className="border p-3 rounded hover:bg-gray-50">
                    <h3 className="font-medium">Website Redesign</h3>
                    <p className="text-sm text-gray-500">5 active tasks</p>
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                      </div>
                    </div>
                  </div>
                  <div className="border p-3 rounded hover:bg-gray-50">
                    <h3 className="font-medium">Mobile App Launch</h3>
                    <p className="text-sm text-gray-500">3 active tasks</p>
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: '30%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white p-4 rounded-lg shadow">
                <h2 className="text-lg font-medium mb-4">Recent Activity</h2>
                <div className="space-y-3">
                  <div className="text-sm border-l-2 border-blue-500 pl-3">
                    <p className="text-gray-600">Task status updated to &quot;Under Review&quot;</p>
                    <p className="text-gray-400">2 hours ago</p>
                  </div>
                  <div className="text-sm border-l-2 border-green-500 pl-3">
                    <p className="text-gray-600">New comment on &quot;Homepage Design&quot;</p>
                    <p className="text-gray-400">4 hours ago</p>
                  </div>
                  <div className="text-sm border-l-2 border-purple-500 pl-3">
                    <p className="text-gray-600">Subtask &quot;Design Hero Section&quot; completed</p>
                    <p className="text-gray-400">5 hours ago</p>
                  </div>
                </div>
              </div>

              {/* Team/Department Info */}
              <div className="bg-white p-4 rounded-lg shadow">
                <h2 className="text-lg font-medium mb-4">Organization</h2>
                {user?.teamId && (
                  <div className="mb-3">
                    <h3 className="text-sm font-medium text-gray-500">Team</h3>
                    <p className="text-sm">Frontend Development</p>
                  </div>
                )}
                {user?.departmentId && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Department</h3>
                    <p className="text-sm">Engineering</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}