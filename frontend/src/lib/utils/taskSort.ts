import type { Task } from '@/lib/types/task';

export type SortOption = 'priority_high' | 'priority_low' | 'due_asc' | 'due_desc';

export type StatusFilter = 'all' | 'unassigned' | 'ongoing' | 'under_review' | 'completed' | 'overdue';

/**
 * Sorts an array of tasks based on the provided sort option
 * @param tasks - Array of tasks to sort
 * @param sortBy - Sort option (priority or due date)
 * @returns Sorted array of tasks (new array, does not mutate original)
 */
export function sortTasks(tasks: Task[], sortBy: SortOption): Task[] {
  const sorted = [...tasks];
  
  switch (sortBy) {
    case 'priority_high':
      return sorted.sort((a, b) => (b.priority || 0) - (a.priority || 0));
    
    case 'priority_low':
      return sorted.sort((a, b) => (a.priority || 0) - (b.priority || 0));
    
    case 'due_asc':
      return sorted.sort((a, b) => {
        const dateA = a.dueDate ? new Date(a.dueDate).getTime() : 0;
        const dateB = b.dueDate ? new Date(b.dueDate).getTime() : 0;
        return dateA - dateB;
      });
    
    case 'due_desc':
      return sorted.sort((a, b) => {
        const dateA = a.dueDate ? new Date(a.dueDate).getTime() : 0;
        const dateB = b.dueDate ? new Date(b.dueDate).getTime() : 0;
        return dateB - dateA;
      });
    
    default:
      return sorted;
  }
}

/**
 * Filters tasks by status
 * @param tasks - Array of tasks to filter
 * @param statusFilter - Status to filter by ('all' shows all tasks)
 * @returns Filtered array of tasks
 */
export function filterTasksByStatus(tasks: Task[], statusFilter: StatusFilter): Task[] {
  if (statusFilter === 'all') return tasks;
  if (statusFilter === 'overdue') {
    const now = new Date();
    return tasks.filter(t => t.dueDate && new Date(t.dueDate) < now && t.status !== 'completed');
  }
  return tasks.filter(task => task.status === statusFilter);
}

/**
 * Computes task counts by status
 * @param tasks - Array of tasks
 * @returns Object with counts for each status
 */
export function getTaskCounts(tasks: Task[]) {
  const now = new Date();
  return {
    all: tasks.length,
    unassigned: tasks.filter(t => t.status === 'unassigned').length,
    ongoing: tasks.filter(t => t.status === 'ongoing').length,
    under_review: tasks.filter(t => t.status === 'under_review').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    overdue: tasks.filter(t => t.dueDate && new Date(t.dueDate) < now && t.status !== 'completed').length,
  };
}

