import { useState, useEffect, useCallback } from 'react';
import { taskService, projectService } from '@/lib/services/api';
import { subtaskService } from '@/lib/services/subtask';
import { Task } from '@/lib/types/task';
import type { Subtask } from '@/lib/types/subtask';
import { useUser } from '@/contexts/UserContext';
import type { Project } from '@/lib/types/project';
import { getProjectDates } from '@/lib/utils/timeline';

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
  const [visibleProjects, setVisibleProjects] = useState<Project[]>([]);
  const [projectSpans, setProjectSpans] = useState<Map<string, { start: Date; end: Date }>>(new Map());

  const fetchTimelineData = useCallback(async () => {
    if (!user?.token) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Fetch projects and tasks in parallel
      const [projectsResponse, tasksResponse] = await Promise.all([
        projectService.getProjects(user.token),
        taskService.getUserTasks(user.token),
      ]);

      if (projectsResponse.status === 'success' && Array.isArray(projectsResponse.data)) {
        const projects = projectsResponse.data as Project[];
        setVisibleProjects(projects);
        const spanMap = new Map<string, { start: Date; end: Date }>();
        projects.forEach(p => {
          const name = p.name || 'No Project';
          const { start, end } = getProjectDates(p);
          spanMap.set(name, { start, end });
        });
        setProjectSpans(spanMap);
      }

      if (tasksResponse.status !== 'success') {
        throw new Error('Failed to fetch tasks');
      }

      const tasks = tasksResponse.data as Task[];
      
      // Fetch subtasks for each task
      const items: TimelineItem[] = [];
      
      // Add tasks to timeline
      for (const task of tasks) {
        items.push({
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
              items.push({
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
      
      setTimelineItems(items);
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
    visibleProjects,
    projectSpans,
    refetch: fetchTimelineData,
  };
};
