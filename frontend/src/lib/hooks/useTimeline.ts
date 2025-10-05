import { useState, useEffect, useCallback, useRef } from 'react';
import { projectService } from '@/lib/services/api';
import { subtaskService } from '@/lib/services/subtask';
import { Task } from '@/lib/types/task';
import type { Subtask } from '@/lib/types/subtask';
import { useUser } from '@/contexts/UserContext';
import type { Project } from '@/lib/types/project';
import type { Team } from '@/lib/services/organization';
import { getProjectDates } from '@/lib/utils/timeline';
import { getVisibleTasks } from '@/lib/utils/orgAccess';

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
  assigneeId?: string;
  collaborators?: string[];
}

interface UseTimelineParams {
  // Optional selectors depending on scope
  selectedTeamId?: string | null;
  selectedDepartmentId?: string | null;
  teams?: Team[];
}

export const useTimeline = (params: UseTimelineParams) => {
  const { user } = useUser();
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleProjects, setVisibleProjects] = useState<Project[]>([]);
  const [projectSpans, setProjectSpans] = useState<Map<string, { start: Date; end: Date }>>(new Map());
  const fetchedSubtaskForTaskIdsRef = useRef<Set<string>>(new Set());
  // Destructure params so dependencies are stable primitives
  const { selectedTeamId, selectedDepartmentId, teams } = params;

  const fetchTimelineData = useCallback(async () => {
    if (!user?.token) return;
    // use destructured vars above
    
    try {
      setLoading(true);
      setError(null);
      
      // Decide which tasks API to call based on scope (reuse org filtering logic)
      let tasks: Task[] = [];
      const resp = await getVisibleTasks(
        user.token,
        selectedDepartmentId ?? null,
        selectedTeamId ?? null,
        teams ?? []
      );
      if (resp.status !== 'success') throw new Error(resp.message || 'Failed to fetch tasks');
      tasks = resp.data as Task[];

      // Build base items for tasks first
      const baseItems: TimelineItem[] = tasks.map(task => ({
        id: task.id,
        type: 'task',
        title: task.title,
        description: task.description,
        dueDate: task.dueDate,
        createdAt: task.createdAt,
        status: task.status,
        projectName: task.projectName,
        assigneeId: task.assigneeId,
        collaborators: task.collaborators,
      }));

      // Fetch subtasks in parallel only for tasks we haven't fetched before
      const fetchPromises: Array<Promise<TimelineItem[]>> = tasks.map(async (task) => {
        if (!task.id) return [];
        const taskId: string = task.id as string;
        if (fetchedSubtaskForTaskIdsRef.current.has(taskId)) return [];
        try {
          const res = await subtaskService.getByParentTask(user.token as string, taskId);
          if (res.status === 'success' && res.data) {
            fetchedSubtaskForTaskIdsRef.current.add(taskId);
            const subs = res.data as Subtask[];
            return subs.map(subtask => ({
              id: subtask.id,
              type: 'subtask' as const,
              title: subtask.title,
              description: subtask.description,
              dueDate: subtask.dueDate,
              createdAt: subtask.createdAt || new Date().toISOString(),
              status: subtask.status,
              parentTaskId: taskId,
              parentTaskTitle: task.title,
              projectName: task.projectName,
              assigneeId: subtask.assigneeId,
              collaborators: subtask.collaborators,
            }));
          }
        } catch (err) {
          console.warn(`Failed to fetch subtasks for task ${taskId}:`, err);
        }
        return [];
      });

      const subtaskItemsArrays = await Promise.all(fetchPromises);
      const subtaskItems = subtaskItemsArrays.flat();
      setTimelineItems([...baseItems, ...subtaskItems]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching timeline data');
    } finally {
      setLoading(false);
    }
  }, [user?.token, selectedTeamId, selectedDepartmentId, teams]);

  // Fetch projects only once per token (not on every timeline refetch)
  useEffect(() => {
    const loadProjects = async () => {
      if (!user?.token) return;
      try {
        const projectsResponse = await projectService.getProjects(user.token);
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
      } catch {
        // ignore project loading errors here; tasks still load
      }
    };
    loadProjects();
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
