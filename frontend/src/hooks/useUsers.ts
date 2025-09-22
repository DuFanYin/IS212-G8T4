import { useState, useEffect, useCallback } from 'react';
import { userService } from '@/services/api';
import { User } from '@/types/user';

interface UseUsersResult {
  users: User[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useTeamMembers = (token: string): UseUsersResult => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    if (!token) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await userService.getTeamMembers(token);
      if (response.status === 'success') {
        setUsers(response.data);
      } else {
        setError(response.message || 'Failed to fetch team members');
      }
    } catch {
      setError('Failed to fetch team members');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    loading,
    error,
    refetch: fetchUsers
  };
};

export const useDepartmentMembers = (token: string, departmentId?: string): UseUsersResult => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    if (!token) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await userService.getDepartmentMembers(token, departmentId);
      if (response.status === 'success') {
        setUsers(response.data);
      } else {
        setError(response.message || 'Failed to fetch department members');
      }
    } catch {
      setError('Failed to fetch department members');
    } finally {
      setLoading(false);
    }
  }, [token, departmentId]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    loading,
    error,
    refetch: fetchUsers
  };
};
