import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTeamMembers, useDepartmentMembers } from '@/lib/hooks/useUsers';
import { User } from '@/lib/types/user';

interface UserSelectorProps {
  token: string;
  userRole: string;
  userDepartmentId?: string;
  onUserSelect: (user: User) => void;
  placeholder?: string;
  resetTrigger?: number | string;
  // Optional overrides: when selecting collaborators for a project,
  // enforce department scope by project's department, regardless of current user role
  forceDepartmentScope?: boolean;
  departmentIdOverride?: string;
}

export const UserSelector: React.FC<UserSelectorProps> = ({
  token,
  userRole,
  userDepartmentId,
  onUserSelect,
  placeholder = "Select a user...",
  resetTrigger,
  forceDepartmentScope = false,
  departmentIdOverride,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  // Determine which hook to use based on user role or enforced department scope
  // Directors use department scope; HR/SM should see all users via team-members endpoint (backend expands to all)
  const shouldUseDepartmentMembers = forceDepartmentScope || userRole === 'director';
  const shouldUseTeamMembers = !forceDepartmentScope && (userRole === 'manager' || userRole === 'hr' || userRole === 'sm');

  const teamMembersResult = useTeamMembers(shouldUseTeamMembers ? token : '');
  const departmentMembersResult = useDepartmentMembers(
    shouldUseDepartmentMembers ? token : '', 
    shouldUseDepartmentMembers ? (departmentIdOverride || userDepartmentId) : undefined
  );

  // Use the appropriate data source
  const { users, loading, error } = shouldUseDepartmentMembers 
    ? departmentMembersResult 
    : teamMembersResult;

  // Debounce search term for smoother filtering
  const debouncedSearch = useDebouncedValue(searchTerm, 150);

  // Filter users based on search term
  const filteredUsers = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    if (!q) return users;
    return users.filter(user =>
      user.name.toLowerCase().includes(q) ||
      user.email.toLowerCase().includes(q)
    );
  }, [users, debouncedSearch]);

  const handleUserSelect = (user: User) => {
    onUserSelect(user);
    setIsOpen(false);
    // Show the selected user's name in the input after selection
    setSearchTerm(user.name);
    setHighlightedIndex(-1);
  };

  // Allow parent to clear the input after an external action (e.g., Assign/Add)
  useEffect(() => {
    if (resetTrigger !== undefined) {
      setSearchTerm('');
    }
  }, [resetTrigger]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    }
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Ensure highlighted item stays in view
  useEffect(() => {
    if (!listRef.current || highlightedIndex < 0) return;
    const list = listRef.current;
    const item = list.querySelector<HTMLButtonElement>(`[data-index='${highlightedIndex}']`);
    if (item) {
      const itemTop = item.offsetTop;
      const itemBottom = itemTop + item.offsetHeight;
      const viewTop = list.scrollTop;
      const viewBottom = viewTop + list.clientHeight;
      if (itemTop < viewTop) list.scrollTop = itemTop;
      else if (itemBottom > viewBottom) list.scrollTop = itemBottom - list.clientHeight;
    }
  }, [highlightedIndex]);

  if (error) {
    return <div>Error loading users: {error}</div>;
  }

  return (
    <div className="relative" ref={containerRef}>
      <div className="relative">
        <input
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => { setSearchTerm(e.target.value); setIsOpen(true); setHighlightedIndex(0); }}
        onFocus={() => { setIsOpen(true); if (filteredUsers.length > 0) setHighlightedIndex(0); }}
        onKeyDown={(e) => {
          if (!isOpen && (e.key === 'ArrowDown' || e.key === 'Enter')) {
            setIsOpen(true);
            setHighlightedIndex(0);
            return;
          }
          if (!isOpen) return;
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            setHighlightedIndex((i) => Math.min((i < 0 ? -1 : i) + 1, filteredUsers.length - 1));
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHighlightedIndex((i) => Math.max((i < 0 ? 0 : i) - 1, 0));
          } else if (e.key === 'Enter') {
            e.preventDefault();
            const user = filteredUsers[highlightedIndex];
            if (user) handleUserSelect(user);
          } else if (e.key === 'Escape') {
            setIsOpen(false);
            setHighlightedIndex(-1);
          }
        }}
        disabled={loading}
        className="w-full pl-3 pr-9 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls="user-selector-list"
        role="combobox"
      />
      {/* Clear button */}
      {searchTerm && (
        <button
          type="button"
          aria-label="Clear"
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          onClick={() => { setSearchTerm(''); setHighlightedIndex(0); }}
        >
          ×
        </button>
      )}
      </div>
      {loading && <div className="mt-1 text-sm text-gray-500">Loading users…</div>}

      {isOpen && (
        <div
          id="user-selector-list"
          role="listbox"
          ref={listRef}
          className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-72 overflow-auto"
        >
          <div className="sticky top-0 z-[1] bg-white border-b border-gray-100 px-3 py-2 text-xs text-gray-500 flex items-center justify-between">
            <span>{filteredUsers.length} {filteredUsers.length === 1 ? 'result' : 'results'}</span>
            {error && <span className="text-red-500">{error}</span>}
          </div>
          {filteredUsers.length === 0 ? (
            <div className="p-3 text-sm text-gray-500">{debouncedSearch ? 'No users found' : 'No users available'}</div>
          ) : (
            filteredUsers.map((user, index) => {
              const isActive = index === highlightedIndex;
              return (
                <button
                  key={user.id}
                  data-index={index}
                  role="option"
                  aria-selected={isActive}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleUserSelect(user)}
                  className={`w-full text-left px-3 py-2 flex items-center justify-between ${isActive ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                  type="button"
                >
                  <div className="min-w-0 mr-3">
                    <div className="text-gray-900 truncate">{user.name}</div>
                    <div className="text-xs text-gray-500 truncate">{user.email}</div>
                  </div>
                  <span className="ml-auto text-[10px] uppercase tracking-wide px-2 py-0.5 rounded bg-gray-100 text-gray-700">{user.role}</span>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

// Small debounce hook to smooth search typing
function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState<T>(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}
