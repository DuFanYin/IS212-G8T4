import React, { useState } from 'react';
import { useTeamMembers, useDepartmentMembers } from '@/hooks/useUsers';
import { User } from '@/types/user';

interface UserSelectorProps {
  token: string;
  userRole: string;
  userDepartmentId?: string;
  onUserSelect: (user: User) => void;
  placeholder?: string;
}

export const UserSelector: React.FC<UserSelectorProps> = ({
  token,
  userRole,
  userDepartmentId,
  onUserSelect,
  placeholder = "Select a user..."
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

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

  // Filter users based on search term
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUserSelect = (user: User) => {
    onUserSelect(user);
    setIsOpen(false);
    setSearchTerm('');
  };

  if (error) {
    return <div>Error loading users: {error}</div>;
  }

  return (
    <div>
      <input
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onFocus={() => setIsOpen(true)}
        disabled={loading}
      />
      {loading && <div>Loading...</div>}

      {isOpen && (
        <>
          <div onClick={() => setIsOpen(false)} />
          <div>
            {filteredUsers.length === 0 ? (
              <div>{searchTerm ? 'No users found' : 'No users available'}</div>
            ) : (
              filteredUsers.map((user) => (
                <div
                  key={user.id}
                  onClick={() => handleUserSelect(user)}
                >
                  <div>{user.name}</div>
                  <div>{user.email}</div>
                  <div>{user.role}</div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};
