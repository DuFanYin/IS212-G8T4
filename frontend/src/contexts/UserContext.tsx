'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/lib/types/user';
import { authService } from '@/lib/services/auth';
import { storage } from '@/lib/utils/storage';
import { setupInactivityTracker } from '@/lib/utils/inactivityTracker';

interface UserContextType {
  user: User | null;
  logout: () => void;
  refreshUser: () => Promise<void>;
  canAssignTasks: () => boolean;
  canSeeAllTasks: () => boolean;
  canSeeDepartmentTasks: () => boolean;
  canSeeTeamTasks: () => boolean;
  getVisibleUsersScope: () => 'all' | 'department' | 'team' | 'none';
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  const logout = useCallback(() => {
    storage.removeToken();
    setUser(null);
    router.push('/login');
  }, [router]);

  const refreshUser = useCallback(async () => {
    const token = storage.getToken();
    if (!token) {
      logout();
      return;
    }

    try {
      const data = await authService.getProfile(token);
      if (data.status === 'success') {
        // Attach token so hooks relying on user.token can function
        setUser({ ...data.data, token });
      } else {
        logout();
      }
    } catch {
      logout();
    }
  }, [logout]);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  // Set up inactivity tracking
  useEffect(() => {
    if (user) {
      const cleanup = setupInactivityTracker(() => {
        logout();
      });
      return cleanup;
    }
  }, [user, logout]);

  // Role-based permission helpers
  const canAssignTasks = useCallback(() => {
    if (!user) return false;
    return ['manager', 'director', 'sm'].includes(user.role);
  }, [user]);

  const canSeeAllTasks = useCallback(() => {
    if (!user) return false;
    return ['hr', 'sm'].includes(user.role);
  }, [user]);

  const canSeeDepartmentTasks = useCallback(() => {
    if (!user) return false;
    return user.role === 'director';
  }, [user]);

  const canSeeTeamTasks = useCallback(() => {
    if (!user) return false;
    return user.role === 'manager';
  }, [user]);

  const getVisibleUsersScope = useCallback(() => {
    if (!user) return 'none';
    if (canSeeAllTasks()) return 'all';
    if (canSeeDepartmentTasks()) return 'department';
    if (canSeeTeamTasks()) return 'team';
    return 'none';
  }, [user, canSeeAllTasks, canSeeDepartmentTasks, canSeeTeamTasks]);

  return (
    <UserContext.Provider value={{ 
      user, 
      logout, 
      refreshUser,
      canAssignTasks,
      canSeeAllTasks,
      canSeeDepartmentTasks,
      canSeeTeamTasks,
      getVisibleUsersScope
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
