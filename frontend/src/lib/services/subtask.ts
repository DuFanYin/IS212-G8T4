import { API_URL } from './config';
import type { SubtaskResponse, SubtasksResponse, SubtaskStatus } from '@/lib/types/subtask';

export const subtaskService = {
  getByParentTask: async (token: string, parentTaskId: string): Promise<SubtasksResponse> => {
    const res = await fetch(`${API_URL}/tasks/${parentTaskId}/subtasks`, { headers: { Authorization: `Bearer ${token}` } });
    return res.json();
  },
  getById: async (token: string, subtaskId: string): Promise<SubtaskResponse> => {
    const res = await fetch(`${API_URL}/tasks/subtasks/${subtaskId}`, { headers: { Authorization: `Bearer ${token}` } });
    return res.json();
  },
  create: async (
    token: string,
    parentTaskId: string,
    data: { title: string; description?: string; dueDate: string; status?: SubtaskStatus; assigneeId?: string; collaborators?: string[] }
  ): Promise<SubtaskResponse> => {
    const res = await fetch(`${API_URL}/tasks/${parentTaskId}/subtasks`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(data)
    });
    return res.json();
  },
  update: async (
    token: string,
    subtaskId: string,
    data: Partial<{ title: string; description: string; dueDate: string; status: SubtaskStatus; assigneeId: string; collaborators: string[] }>
  ): Promise<SubtaskResponse> => {
    const res = await fetch(`${API_URL}/tasks/subtasks/${subtaskId}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(data)
    });
    return res.json();
  },
  updateStatus: async (token: string, subtaskId: string, status: SubtaskStatus): Promise<SubtaskResponse> => {
    const res = await fetch(`${API_URL}/tasks/subtasks/${subtaskId}/status`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ status })
    });
    return res.json();
  },
  remove: async (token: string, subtaskId: string): Promise<SubtaskResponse> => {
    const res = await fetch(`${API_URL}/tasks/subtasks/${subtaskId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    return res.json();
  }
};


