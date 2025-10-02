import { useState, useEffect, useCallback } from 'react';
import { taskService } from '@/lib/services/api';
import { subtaskService } from '@/lib/services/subtask';
import { Task } from '@/lib/types/task';
import type { Subtask } from '@/lib/types/subtask';
import { useUser } from '@/contexts/UserContext';

export interface TimelineItem {
  id: string;
  type: 'task' | 'subtask';
  title: string;
  description?: string;
  dueDate: string;
  createdAt: string;
  status: string;
  parentTaskId?: string;
  parentTaskTitle?: string;
  projectName?: string;
}

export const useTimeline = () => {
  const { user } = useUser();
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTimelineData = useCallback(async () => {
    if (!user?.token) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Fetch user tasks
      const tasksResponse = await taskService.getUserTasks(user.token);
      if (tasksResponse.status !== 'success') {
        throw new Error('Failed to fetch tasks');
      }

      const tasks = tasksResponse.data as Task[];
      
      // Fetch subtasks for each task
      const timelineItems: TimelineItem[] = [];
      
      // Add tasks to timeline
      for (const task of tasks) {
        timelineItems.push({
          id: task.id,
          type: 'task',
          title: task.title,
          description: task.description,
          dueDate: task.dueDate,
          createdAt: task.createdAt,
          status: task.status,
          projectName: task.projectName,
        });

        // Fetch subtasks for this task
        try {
          const subtasksResponse = await subtaskService.getByParentTask(user.token, task.id);
          if (subtasksResponse.status === 'success' && subtasksResponse.data) {
            const subtasks = subtasksResponse.data as Subtask[];
            subtasks.forEach(subtask => {
              timelineItems.push({
                id: subtask.id,
                type: 'subtask',
                title: subtask.title,
                description: subtask.description,
                dueDate: subtask.dueDate,
                createdAt: subtask.createdAt || new Date().toISOString(),
                status: subtask.status,
                parentTaskId: task.id,
                parentTaskTitle: task.title,
                projectName: task.projectName,
              });
            });
          }
        } catch (subtaskError) {
          console.warn(`Failed to fetch subtasks for task ${task.id}:`, subtaskError);
        }
      }
      
      setTimelineItems(timelineItems);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching timeline data');
    } finally {
      setLoading(false);
    }
  }, [user?.token]);

  useEffect(() => {
    fetchTimelineData();
  }, [fetchTimelineData]);

  return {
    timelineItems,
    loading,
    error,
    refetch: fetchTimelineData,
  };
};
