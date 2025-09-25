import React, { useEffect, useState } from 'react';
import { useTeamMembers, useDepartmentMembers } from '@/lib/hooks/useUsers';
import { User } from '@/lib/types/user';

interface UserSelectorProps {
  token: string;
  userRole: string;
  userDepartmentId?: string;
  onUserSelect: (user: User) => void;
  placeholder?: string;
  resetTrigger?: number | string;
}

export const UserSelector: React.FC<UserSelectorProps> = ({
  token,
  userRole,
  userDepartmentId,
  onUserSelect,
  placeholder = "Select a user...",
  resetTrigger
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
    // Show the selected user's name in the input after selection
    setSearchTerm(user.name);
  };

  // Allow parent to clear the input after an external action (e.g., Assign/Add)
  useEffect(() => {
    if (resetTrigger !== undefined) {
      setSearchTerm('');
    }
  }, [resetTrigger]);

  if (error) {
    return <div>Error loading users: {error}</div>;
  }

  return (
    <div className="relative">
      <input
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onFocus={() => setIsOpen(true)}
        disabled={loading}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {loading && <div className="mt-1 text-sm text-gray-500">Loading...</div>}

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredUsers.length === 0 ? (
            <div className="p-3 text-sm text-gray-500">{searchTerm ? 'No users found' : 'No users available'}</div>
          ) : (
            filteredUsers.map((user) => (
              <button
                key={user.id}
                onClick={() => handleUserSelect(user)}
                className="w-full text-left px-3 py-2 hover:bg-gray-50"
                type="button"
              >
                <div className="text-gray-900">{user.name}</div>
                <div className="text-xs text-gray-500">{user.email} • {user.role}</div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};
