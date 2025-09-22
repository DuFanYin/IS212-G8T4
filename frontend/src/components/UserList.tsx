import React from 'react';
import { useTeamMembers, useDepartmentMembers } from '@/hooks/useUsers';
import { User } from '@/types/user';

interface UserListProps {
  token: string;
  userRole: string;
  userDepartmentId?: string;
  onUserClick?: (user: User) => void;
}

export const UserList: React.FC<UserListProps> = ({
  token,
  userRole,
  userDepartmentId,
  onUserClick,
}) => {
  // Determine which hook to use based on user role
  const shouldUseDepartmentMembers = userRole === 'director' || userRole === 'hr' || userRole === 'sm';
  const shouldUseTeamMembers = userRole === 'manager';

  const teamMembersResult = useTeamMembers(shouldUseTeamMembers ? token : '');
  const departmentMembersResult = useDepartmentMembers(
    shouldUseDepartmentMembers ? token : '', 
    shouldUseDepartmentMembers ? userDepartmentId : undefined
  );

  // Use the appropriate data source
  const { users, loading, error } = shouldUseDepartmentMembers 
    ? departmentMembersResult 
    : teamMembersResult;

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading users: {error}</div>;
  }

  if (users.length === 0) {
    return <div>No users found</div>;
  }

  return (
    <div>
      <div>
        {shouldUseDepartmentMembers 
          ? `Department Members (${users.length})`
          : `Team Members (${users.length})`
        }
      </div>
      
      {users.map((user) => (
        <div
          key={user.id}
          onClick={() => onUserClick?.(user)}
        >
          <div>{user.name}</div>
          <div>{user.email}</div>
          <div>{user.role}</div>
        </div>
      ))}
    </div>
  );
};
