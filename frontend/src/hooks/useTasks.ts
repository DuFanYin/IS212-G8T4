import { useState, useEffect, useCallback } from 'react';
import { taskService } from '@/services/api';
import { Task, CreateTaskRequest, UpdateTaskRequest, AssignTaskRequest, UpdateTaskStatusRequest } from '@/types/task';
import { useUser } from '@/contexts/UserContext';

export const useTasks = () => {
  const { user } = useUser();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    if (!user?.token) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await taskService.getUserTasks(user.token);
      if (response.status === 'success') {
        setTasks(response.data);
      } else {
        setError('Failed to fetch tasks');
      }
    } catch {
      setError('Error fetching tasks');
    } finally {
      setLoading(false);
    }
  }, [user?.token]);

  const createTask = async (taskData: CreateTaskRequest) => {
    if (!user?.token) throw new Error('No authentication token');
    
    try {
      const response = await taskService.createTask(user.token, taskData);
      if (response.status === 'success') {
        setTasks(prev => [response.data, ...prev]);
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to create task');
      }
    } catch (err) {
      throw err;
    }
  };

  const updateTask = async (taskId: string, taskData: UpdateTaskRequest) => {
    if (!user?.token) throw new Error('No authentication token');
    
    try {
      const response = await taskService.updateTask(user.token, taskId, taskData);
      if (response.status === 'success') {
        setTasks(prev => prev.map(task => 
          task.id === taskId ? response.data : task
        ));
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to update task');
      }
    } catch (err) {
      throw err;
    }
  };

  const assignTask = async (taskId: string, assignData: AssignTaskRequest) => {
    if (!user?.token) throw new Error('No authentication token');
    
    try {
      const response = await taskService.assignTask(user.token, taskId, assignData);
      if (response.status === 'success') {
        setTasks(prev => prev.map(task => 
          task.id === taskId ? response.data : task
        ));
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to assign task');
      }
    } catch (err) {
      throw err;
    }
  };

  const updateTaskStatus = async (taskId: string, statusData: UpdateTaskStatusRequest) => {
    if (!user?.token) throw new Error('No authentication token');
    
    try {
      const response = await taskService.updateTaskStatus(user.token, taskId, statusData);
      if (response.status === 'success') {
        setTasks(prev => prev.map(task => 
          task.id === taskId ? response.data : task
        ));
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to update task status');
      }
    } catch (err) {
      throw err;
    }
  };

  const archiveTask = async (taskId: string) => {
    if (!user?.token) throw new Error('No authentication token');
    
    try {
      const response = await taskService.archiveTask(user.token, taskId);
      if (response.status === 'success') {
        setTasks(prev => prev.filter(task => task.id !== taskId));
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to archive task');
      }
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    assignTask,
    updateTaskStatus,
    archiveTask
  };
};
