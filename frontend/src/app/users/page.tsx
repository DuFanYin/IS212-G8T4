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
    return <div>Loading...</div>;
  }

  const scope = getVisibleUsersScope();
  const scopeLabels = {
    all: 'All Users (HR/SM)',
    department: 'Department Users (Director)',
    team: 'Team Members (Manager)',
    none: 'No User Access (Staff)'
  };

  return (
    <div>
      <h1>User Management</h1>
      <p>Role-based user visibility and management based on your permissions</p>

      {/* User Info */}
      <div>
        <h2>Your Profile</h2>
        <div>
          <div>Name: {user.name}</div>
          <div>Email: {user.email}</div>
          <div>Role: {user.role}</div>
          <div>Visibility Scope: {scopeLabels[scope]}</div>
          <div>Can Assign Tasks: {canAssignTasks() ? 'Yes' : 'No'}</div>
          <div>Team ID: {user.teamId || 'N/A'}</div>
          <div>Department ID: {user.departmentId || 'N/A'}</div>
        </div>
      </div>

      {/* User List */}
      {scope !== 'none' && (
        <div>
          <h2>{scopeLabels[scope]}</h2>
          <UserList
            token={token || ''}
            userRole={user.role}
            userDepartmentId={user.departmentId}
            onUserClick={(selectedUser) => setSelectedUser(selectedUser)}
          />
        </div>
      )}

      {/* User Selector Demo */}
      {canAssignTasks() && (
        <div>
          <h2>Task Assignment Demo</h2>
          <p>Select a user to assign a task to (based on your role permissions):</p>
          
          <UserSelector
            token={token || ''}
            userRole={user.role}
            userDepartmentId={user.departmentId}
            onUserSelect={(user) => setSelectedUser(user)}
            placeholder="Select a user for task assignment..."
          />

          {selectedUser && (
            <div>
              <h3>Selected User:</h3>
              <div>
                <div>Name: {selectedUser.name}</div>
                <div>Email: {selectedUser.email}</div>
                <div>Role: {selectedUser.role}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Permission Info */}
      <div>
        <h2>Role-Based Permissions</h2>
        <div>
          <div>
            <h3>Staff</h3>
            <ul>
              <li>• Can create tasks/projects</li>
              <li>• Can manage own tasks</li>
              <li>• Cannot assign tasks</li>
              <li>• See own tasks only</li>
            </ul>
          </div>
          <div>
            <h3>Manager</h3>
            <ul>
              <li>• Can assign tasks downward</li>
              <li>• Can see team tasks</li>
              <li>• Can create unassigned tasks</li>
              <li>• Can update task status</li>
            </ul>
          </div>
          <div>
            <h3>Director</h3>
            <ul>
              <li>• Can see department tasks</li>
              <li>• Can assign tasks downward</li>
              <li>• Department-wide visibility</li>
              <li>• Can manage department users</li>
            </ul>
          </div>
          <div>
            <h3>HR</h3>
            <ul>
              <li>• Full company visibility</li>
              <li>• Can see all tasks/projects</li>
              <li>• Can see all users</li>
              <li>• Full reporting access</li>
            </ul>
          </div>
          <div>
            <h3>Senior Management</h3>
            <ul>
              <li>• Full company visibility</li>
              <li>• Can see all tasks/projects</li>
              <li>• Can see all users</li>
              <li>• Organization-wide access</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
