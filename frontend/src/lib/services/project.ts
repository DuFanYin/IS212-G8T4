import { API_URL } from './config';
import type { ProjectResponse, ProjectsResponse } from '@/lib/types/project';

export const projectService = {
  getProjects: async (token: string): Promise<ProjectsResponse> => {
    const res = await fetch(`${API_URL}/projects/`, { headers: { Authorization: `Bearer ${token}` } });
    return res.json();
  },
  getProjectsByDepartment: async (token: string, departmentId: string): Promise<ProjectsResponse> => {
    const res = await fetch(`${API_URL}/projects/departments/${departmentId}`, { headers: { Authorization: `Bearer ${token}` } });
    return res.json();
  },
  createProject: async (token: string, data: { name: string; description?: string; deadline?: string; collaborators?: string[] }): Promise<ProjectResponse> => {
    const res = await fetch(`${API_URL}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  updateProject: async (
    token: string,
    projectId: string,
    data: Partial<{ name: string; description: string; deadline: string; collaborators: string[]; isArchived: boolean }>
  ): Promise<ProjectResponse> => {
    const res = await fetch(`${API_URL}/projects/${projectId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  setArchived: async (token: string, projectId: string, isArchived: boolean): Promise<ProjectResponse> => {
    const res = await fetch(`${API_URL}/projects/${projectId}/archive`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ isArchived })
    });
    return res.json();
  },
  addCollaborator: async (token: string, projectId: string, collaboratorId: string): Promise<ProjectResponse> => {
    const res = await fetch(`${API_URL}/projects/${projectId}/collaborators`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ collaboratorId })
    });
    return res.json();
  },
  removeCollaborator: async (token: string, projectId: string, collaboratorId: string): Promise<ProjectResponse> => {
    const res = await fetch(`${API_URL}/projects/${projectId}/collaborators`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ collaboratorId })
    });
    return res.json();
  },
  // NEW: get project progress (manager/owner roles)
  getProjectProgress: async (
    token: string,
    projectId: string
  ): Promise<{ status: string; data: { total: number; unassigned: number; ongoing: number; under_review: number; completed: number; percent: number } }> => {
    const res = await fetch(`${API_URL}/projects/${projectId}/progress`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.json();
  }
};


