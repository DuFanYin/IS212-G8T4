import { API_URL } from './config';
import { CreateTaskRequest, UpdateTaskRequest, AssignTaskRequest, UpdateTaskStatusRequest, TaskResponse, TasksResponse } from '@/lib/types/task';

export const taskService = {
  getUserTasks: async (token: string): Promise<TasksResponse> => {
    const res = await fetch(`${API_URL}/tasks/`, { headers: { Authorization: `Bearer ${token}` } });
    return res.json();
  },
  getTasksByProject: async (token: string, projectId: string): Promise<TasksResponse> => {
    const res = await fetch(`${API_URL}/tasks/project/${projectId}`, { headers: { Authorization: `Bearer ${token}` } });
    return res.json();
  },
  getTasksByTeam: async (token: string, teamId: string): Promise<TasksResponse> => {
    const res = await fetch(`${API_URL}/tasks/team/${teamId}`, { headers: { Authorization: `Bearer ${token}` } });
    return res.json();
  },
  getTasksByDepartment: async (token: string, departmentId: string): Promise<TasksResponse> => {
    const res = await fetch(`${API_URL}/tasks/department/${departmentId}`, { headers: { Authorization: `Bearer ${token}` } });
    return res.json();
  },
  getTaskById: async (token: string, taskId: string): Promise<TaskResponse> => {
    const res = await fetch(`${API_URL}/tasks/${taskId}`, { headers: { Authorization: `Bearer ${token}` } });
    return res.json();
  },
  createTask: async (token: string, taskData: CreateTaskRequest): Promise<TaskResponse> => {
    const res = await fetch(`${API_URL}/tasks/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(taskData),
    });
    return res.json();
  },
  updateTask: async (token: string, taskId: string, taskData: UpdateTaskRequest): Promise<TaskResponse> => {
    const res = await fetch(`${API_URL}/tasks/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(taskData),
    });
    return res.json();
  },
  assignTask: async (token: string, taskId: string, assignData: AssignTaskRequest): Promise<TaskResponse> => {
    const res = await fetch(`${API_URL}/tasks/${taskId}/assign`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(assignData),
    });
    return res.json();
  },
  updateTaskStatus: async (token: string, taskId: string, statusData: UpdateTaskStatusRequest): Promise<TaskResponse> => {
    const res = await fetch(`${API_URL}/tasks/${taskId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(statusData),
    });
    return res.json();
  },
  archiveTask: async (token: string, taskId: string): Promise<TaskResponse> => {
    const res = await fetch(`${API_URL}/tasks/${taskId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    return res.json();
  }
};


