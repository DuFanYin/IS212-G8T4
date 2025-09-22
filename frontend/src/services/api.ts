import { AuthResponse } from '@/types/user';
import { 
  Task, 
  CreateTaskRequest, 
  UpdateTaskRequest, 
  AssignTaskRequest, 
  UpdateTaskStatusRequest,
  TaskResponse,
  TasksResponse 
} from '@/types/task';

const API_URL = 'http://localhost:3000/api';

export const authService = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return res.json();
  },

  getProfile: async (token: string) => {
    const res = await fetch(`${API_URL}/users/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.json();
  },

  requestPasswordReset: async (email: string) => {
    const res = await fetch(`${API_URL}/auth/request-reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return res.json();
  },

  resetPassword: async (token: string, newPassword: string) => {
    const res = await fetch(`${API_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword }),
    });
    return res.json();
  }
};

export const userService = {
  getTeamMembers: async (token: string) => {
    const res = await fetch(`${API_URL}/users/team-members`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.json();
  },

  getDepartmentMembers: async (token: string, departmentId?: string) => {
    const url = departmentId 
      ? `${API_URL}/users/department-members/${departmentId}`
      : `${API_URL}/users/department-members`;
    
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.json();
  }
};

export const taskService = {
  // Get user's tasks (role-based visibility)
  getUserTasks: async (token: string): Promise<TasksResponse> => {
    const res = await fetch(`${API_URL}/tasks/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.json();
  },

  // Get tasks by project
  getTasksByProject: async (token: string, projectId: string): Promise<TasksResponse> => {
    const res = await fetch(`${API_URL}/tasks/project/${projectId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.json();
  },

  // Get task by ID
  getTaskById: async (token: string, taskId: string): Promise<TaskResponse> => {
    const res = await fetch(`${API_URL}/tasks/${taskId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.json();
  },

  // Create new task
  createTask: async (token: string, taskData: CreateTaskRequest): Promise<TaskResponse> => {
    const res = await fetch(`${API_URL}/tasks/`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify(taskData),
    });
    return res.json();
  },

  // Update task
  updateTask: async (token: string, taskId: string, taskData: UpdateTaskRequest): Promise<TaskResponse> => {
    const res = await fetch(`${API_URL}/tasks/${taskId}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify(taskData),
    });
    return res.json();
  },

  // Assign task to user
  assignTask: async (token: string, taskId: string, assignData: AssignTaskRequest): Promise<TaskResponse> => {
    const res = await fetch(`${API_URL}/tasks/${taskId}/assign`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify(assignData),
    });
    return res.json();
  },

  // Update task status
  updateTaskStatus: async (token: string, taskId: string, statusData: UpdateTaskStatusRequest): Promise<TaskResponse> => {
    const res = await fetch(`${API_URL}/tasks/${taskId}/status`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify(statusData),
    });
    return res.json();
  },

  // Archive task (soft delete)
  archiveTask: async (token: string, taskId: string): Promise<TaskResponse> => {
    const res = await fetch(`${API_URL}/tasks/${taskId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.json();
  }
};
