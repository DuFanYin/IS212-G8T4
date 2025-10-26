import { API_URL } from './config';
import type { UsersResponse } from '@/lib/types/user';

interface InvitationResult {
  email: string;
  status: string;
  message?: string;
}

interface InvitationSummary {
  total: number;
  success: number;
  failed: number;
}

interface InvitationResponse {
  status: string;
  message: string;
  data: {
    results: InvitationResult[];
    summary: InvitationSummary;
  };
}

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
  },

  sendBulkInvitations: async (
    token: string, 
    invitationData: {
      emails: string[];
      role?: string;
      teamId?: string;
      departmentId?: string;
    }
  ): Promise<InvitationResponse> => {
    const res = await fetch(`${API_URL}/users/invite`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json', 
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify(invitationData)
    });
    return res.json();
  }
};


