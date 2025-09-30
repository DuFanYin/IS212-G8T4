'use client';

import React from 'react';
import { useUser } from '@/contexts/UserContext';
// Removed UserList and UserSelector usage from this page per requirements
// Removed unused imports after removing user list & assignment UI

export default function UsersPage() {
  const { user } = useUser();
  // const [selectedUser, setSelectedUser] = useState<User | null>(null);
  // const token = storage.getToken();

  if (!user) {
    return (
      <div className="pt-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse h-6 w-24 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  // Removed scope labels here; the detailed matrix below summarizes privileges clearly.

  return (
    <div className="pt-20 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">Role-based visibility and actions based on your permissions.</p>
        </div>

        {/* Profile card (top) */}
        <section>
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
                  <dt className="text-sm font-medium text-gray-500">Team</dt>
                  <dd className="text-sm text-gray-900 col-span-2">{user.teamName || user.teamId || 'N/A'}</dd>
                </div>
                <div className="py-3 grid grid-cols-3 gap-4">
                  <dt className="text-sm font-medium text-gray-500">Department</dt>
                  <dd className="text-sm text-gray-900 col-span-2">{user.departmentName || user.departmentId || 'N/A'}</dd>
                </div>
              </dl>
              {/* Removed duplicate badges; details are shown in the matrix */}
            </div>
        </section>

        {/* Role matrix (full width) */}
        <section>
          <div className="bg-white rounded-lg shadow border border-gray-200 p-5">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Role-Based Permissions</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-gray-600">
                      <th className="px-3 py-2 text-left font-medium">Role</th>
                      <th className="px-3 py-2 text-left font-medium">Visibility</th>
                      <th className="px-3 py-2 text-left font-medium">Assign</th>
                      <th className="px-3 py-2 text-left font-medium">Assign Scope</th>
                      <th className="px-3 py-2 text-left font-medium">Add Collaborators</th>
                      <th className="px-3 py-2 text-left font-medium">Project Collab Scope</th>
                      <th className="px-3 py-2 text-left font-medium">Update Status</th>
                      <th className="px-3 py-2 text-left font-medium">Edit Task</th>
                      <th className="px-3 py-2 text-left font-medium">Create Task</th>
                      <th className="px-3 py-2 text-left font-medium">Create Project</th>
                      <th className="px-3 py-2 text-left font-medium">Subtasks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {[
                    { key: 'staff', label: 'Staff', visibility: 'Own tasks; project collaborators', assign: false, assignScope: '-', addCollab: 'Limited', projectCollabScope: 'Within project only', updateStatus: 'If collaborator', editTask: 'Own/allowed', createTask: true, createProject: true, subtasks: 'Create/Edit if collaborator' },
                    { key: 'manager', label: 'Manager', visibility: 'Team-wide tasks', assign: true, assignScope: 'To team/staff', addCollab: 'Yes', projectCollabScope: 'Within department', updateStatus: 'If collaborator', editTask: 'If collaborator', createTask: true, createProject: true, subtasks: 'Create/Edit if collaborator' },
                    { key: 'director', label: 'Director', visibility: 'Department-wide tasks', assign: true, assignScope: 'Within department', addCollab: 'Yes', projectCollabScope: 'Within department', updateStatus: 'If collaborator', editTask: 'If collaborator', createTask: true, createProject: true, subtasks: 'Create/Edit if collaborator' },
                    { key: 'hr', label: 'HR', visibility: 'Company-wide tasks/projects/users', assign: false, assignScope: '-', addCollab: 'No', projectCollabScope: '-', updateStatus: 'No', editTask: 'No', createTask: false, createProject: false, subtasks: 'No' },
                    { key: 'sm', label: 'Senior Management', visibility: 'Company-wide tasks/projects/users', assign: true, assignScope: 'Org-wide (downward)', addCollab: 'Yes', projectCollabScope: 'Within department', updateStatus: 'If collaborator', editTask: 'If collaborator', createTask: false, createProject: false, subtasks: 'Create/Edit if collaborator' },
                    ].map((r) => (
                      <tr key={r.key} className={`${user.role === r.key ? 'bg-blue-50/50' : ''}`} title={user.role === r.key ? 'Your role' : undefined}>
                        <td className="px-3 py-2 font-medium text-gray-800">{r.label}</td>
                        <td className="px-3 py-2 text-gray-700">{r.visibility}</td>
                        <td className="px-3 py-2">{r.assign ? <span className="px-2 py-0.5 rounded bg-green-100 text-green-800">Yes</span> : <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700">No</span>}</td>
                        <td className="px-3 py-2 text-gray-700">{r.assignScope}</td>
                        <td className="px-3 py-2">
                          {r.addCollab === 'Yes' && <span className="px-2 py-0.5 rounded bg-green-100 text-green-800">Yes</span>}
                          {r.addCollab === 'No' && <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700">No</span>}
                          {r.addCollab === 'Limited' && <span className="px-2 py-0.5 rounded bg-yellow-100 text-yellow-800">Limited</span>}
                        </td>
                        <td className="px-3 py-2 text-gray-700">{r.projectCollabScope}</td>
                        <td className="px-3 py-2">
                          {r.updateStatus === 'If collaborator' && <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800">If collaborator</span>}
                          {r.updateStatus === 'No' && <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700">No</span>}
                        </td>
                        <td className="px-3 py-2">
                          {r.editTask === 'Own/allowed' && <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800">Own</span>}
                          {r.editTask === 'If collaborator' && <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800">If collaborator</span>}
                          {r.editTask === 'No' && <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700">No</span>}
                        </td>
                        <td className="px-3 py-2">{r.createTask ? <span className="px-2 py-0.5 rounded bg-green-100 text-green-800">Yes</span> : <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700">No</span>}</td>
                        <td className="px-3 py-2">{r.createProject ? <span className="px-2 py-0.5 rounded bg-green-100 text-green-800">Yes</span> : <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700">No</span>}</td>
                        <td className="px-3 py-2">
                          {r.subtasks === 'No' && <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700">No</span>}
                          {r.subtasks === 'Create/Edit if collaborator' && <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800">If collaborator</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
        </section>
      </div>
    </div>
  );
}
