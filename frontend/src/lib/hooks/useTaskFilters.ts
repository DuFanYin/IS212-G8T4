import { useState, useMemo } from 'react';
import { sortTasks, filterTasksByStatus, getTaskCounts, type SortOption, type StatusFilter } from '@/lib/utils/taskSort';
import type { Task } from '@/lib/types/task';

interface UseTaskFiltersProps {
  tasks: Task[];
  initialFilter?: StatusFilter;
  initialSort?: SortOption;
}

interface UseTaskFiltersReturn {
  // State
  statusFilter: StatusFilter;
  sortBy: SortOption;
  
  // Actions
  setStatusFilter: (filter: StatusFilter) => void;
  setSortBy: (sort: SortOption) => void;
  
  // Computed
  filteredAndSortedTasks: Task[];
  taskCounts: ReturnType<typeof getTaskCounts>;
}

/**
 * Custom hook for managing task filtering and sorting
 * Consolidates the pattern of managing filter state, sort state, and their effects
 * Used across multiple pages: projects-tasks, organisation, project detail
 * 
 * High impact: Reduces ~50-100 lines per page by eliminating repeated state management
 */
export function useTaskFilters({ 
  tasks, 
  initialFilter = 'all',
  initialSort = 'priority_high'
}: UseTaskFiltersProps): UseTaskFiltersReturn {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(initialFilter);
  const [sortBy, setSortBy] = useState<SortOption>(initialSort);

  // Compute filtered and sorted tasks
  const filteredAndSortedTasks = useMemo(() => {
    const filtered = filterTasksByStatus(tasks, statusFilter);
    return sortTasks(filtered, sortBy);
  }, [tasks, statusFilter, sortBy]);

  // Compute task counts for UI display
  const taskCounts = useMemo(() => {
    return getTaskCounts(tasks);
  }, [tasks]);

  return {
    statusFilter,
    sortBy,
    setStatusFilter,
    setSortBy,
    filteredAndSortedTasks,
    taskCounts
  };
}
