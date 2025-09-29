'use client';

import React, { useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { UserList } from '@/components/features/users/UserList';
import { UserSelector } from '@/components/features/users/UserSelector';
import { User } from '@/lib/types/user';
import { storage } from '@/lib/utils/storage';

export default function UsersPage() {
  const { user, canAssignTasks, getVisibleUsersScope } = useUser();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const token = storage.getToken();

  if (!user) {
    return (
      <div className="pt-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse h-6 w-24 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  const scope = getVisibleUsersScope();
  const scopeLabels = {
    all: 'All Users (HR/SM)',
    department: 'Department Users (Director)',
    team: 'Team Members (Manager)',
    none: 'No User Access (Staff)'
  };

  return (
    <div className="pt-20 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">Role-based visibility and actions based on your permissions.</p>
        </div>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow border border-gray-200 p-5">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Your Profile</h2>
              <dl className="divide-y divide-gray-100">
                <div className="py-3 grid grid-cols-3 gap-4">
                  <dt className="text-sm font-medium text-gray-500">Name</dt>
                  <dd className="text-sm text-gray-900 col-span-2">{user.name}</dd>
                </div>
                <div className="py-3 grid grid-cols-3 gap-4">
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="text-sm text-gray-900 col-span-2">{user.email}</dd>
                </div>
                <div className="py-3 grid grid-cols-3 gap-4">
                  <dt className="text-sm font-medium text-gray-500">Role</dt>
                  <dd className="text-sm text-gray-900 col-span-2">{user.role}</dd>
                </div>
                <div className="py-3 grid grid-cols-3 gap-4">
                  <dt className="text-sm font-medium text-gray-500">Visibility</dt>
                  <dd className="text-sm text-gray-900 col-span-2">{scopeLabels[scope]}</dd>
                </div>
                <div className="py-3 grid grid-cols-3 gap-4">
                  <dt className="text-sm font-medium text-gray-500">Can Assign</dt>
                  <dd className="text-sm text-gray-900 col-span-2">{canAssignTasks() ? 'Yes' : 'No'}</dd>
                </div>
                <div className="py-3 grid grid-cols-3 gap-4">
                  <dt className="text-sm font-medium text-gray-500">Team</dt>
                  <dd className="text-sm text-gray-900 col-span-2">{user.teamId || 'N/A'}</dd>
                </div>
                <div className="py-3 grid grid-cols-3 gap-4">
                  <dt className="text-sm font-medium text-gray-500">Department</dt>
                  <dd className="text-sm text-gray-900 col-span-2">{user.departmentId || 'N/A'}</dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            {scope !== 'none' && (
              <div className="bg-white rounded-lg shadow border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-medium text-gray-900">{scopeLabels[scope]}</h2>
                </div>
                <UserList
                  token={token || ''}
                  userRole={user.role}
                  userDepartmentId={user.departmentId}
                  onUserClick={(selectedUser) => setSelectedUser(selectedUser)}
                />
              </div>
            )}

            {canAssignTasks() && (
              <div className="bg-white rounded-lg shadow border border-gray-200 p-5">
                <div className="mb-4">
                  <h2 className="text-lg font-medium text-gray-900">Task Assignment</h2>
                  <p className="text-sm text-gray-600">Select a user to assign a task to (based on your role permissions).</p>
                </div>
                <div className="space-y-4">
                  <UserSelector
                    token={token || ''}
                    userRole={user.role}
                    userDepartmentId={user.departmentId}
                    onUserSelect={(user) => setSelectedUser(user)}
                    placeholder="Select a user for task assignment..."
                  />

                  {selectedUser && (
                    <div className="rounded border border-gray-200 bg-gray-50 p-4">
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Selected User</h3>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="text-gray-500">Name</div>
                        <div className="col-span-2 text-gray-900">{selectedUser.name}</div>
                        <div className="text-gray-500">Email</div>
                        <div className="col-span-2 text-gray-900">{selectedUser.email}</div>
                        <div className="text-gray-500">Role</div>
                        <div className="col-span-2 text-gray-900">{selectedUser.role}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

        <section>
          <div className="bg-white rounded-lg shadow border border-gray-200 p-5">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Role-Based Permissions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded border border-gray-200 p-4">
                <h3 className="font-medium text-gray-800 mb-2">Staff</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Can create tasks/projects</li>
                  <li>• Can manage own tasks</li>
                  <li>• Cannot assign tasks</li>
                  <li>• See own tasks only</li>
                </ul>
              </div>
              <div className="rounded border border-gray-200 p-4">
                <h3 className="font-medium text-gray-800 mb-2">Manager</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Can assign tasks downward</li>
                  <li>• Can see team tasks</li>
                  <li>• Can create unassigned tasks</li>
                  <li>• Can update task status</li>
                </ul>
              </div>
              <div className="rounded border border-gray-200 p-4">
                <h3 className="font-medium text-gray-800 mb-2">Director</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Can see department tasks</li>
                  <li>• Can assign tasks downward</li>
                  <li>• Department-wide visibility</li>
                  <li>• Can manage department users</li>
                </ul>
              </div>
              <div className="rounded border border-gray-200 p-4">
                <h3 className="font-medium text-gray-800 mb-2">HR & SM</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Full company visibility</li>
                  <li>• Can see all tasks/projects</li>
                  <li>• Can see all users</li>
                  <li>• Full reporting access</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
