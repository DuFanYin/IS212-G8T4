import { API_URL } from './config';
import type { UsersResponse } from '@/lib/types/user';

export const userService = {
  getTeamMembers: async (token: string): Promise<UsersResponse> => {
    const res = await fetch(`${API_URL}/users/team-members`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.json();
  },

  getDepartmentMembers: async (token: string, departmentId?: string): Promise<UsersResponse> => {
    const url = departmentId 
      ? `${API_URL}/users/department-members/${departmentId}`
      : `${API_URL}/users/department-members`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.json();
  }
};


