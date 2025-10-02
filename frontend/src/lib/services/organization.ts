import { API_URL } from './config';

export interface Department {
  id: string;
  name: string;
  description?: string;
  directorId?: string;
  directorName?: string;
  teamCount: number;
  userCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  departmentId: string;
  departmentName?: string;
  managerId?: string;
  managerName?: string;
  userCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface DepartmentsResponse {
  status: string;
  data: Department[];
}

export interface TeamsResponse {
  status: string;
  data: Team[];
}

export const organizationService = {
  getAllDepartments: async (token: string): Promise<DepartmentsResponse> => {
    const res = await fetch(`${API_URL}/organization/departments`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.json();
  },

  getTeamsByDepartment: async (token: string, departmentId: string): Promise<TeamsResponse> => {
    const res = await fetch(`${API_URL}/organization/departments/${departmentId}/teams`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.json();
  },

  getAllTeams: async (token: string): Promise<TeamsResponse> => {
    const res = await fetch(`${API_URL}/organization/teams`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.json();
  }
};
