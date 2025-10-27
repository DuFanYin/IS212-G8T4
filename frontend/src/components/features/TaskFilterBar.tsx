import { TaskSortSelect } from './TaskSortSelect';
import { TaskStatusFilter } from './TaskStatusFilter';
import { getTaskCounts, type SortOption, type StatusFilter } from '@/lib/utils/taskSort';
import type { Task } from '@/lib/types/task';

interface TaskFilterBarProps {
  tasks: Task[];
  statusFilter: StatusFilter;
  onStatusFilterChange: (status: StatusFilter) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  statusFilterVariant?: 'buttons' | 'dropdown';
  showOverdue?: boolean;
  className?: string;
}

/**
 * Combined filter and sort bar for tasks
 * Provides status filtering and sorting options
 */
export function TaskFilterBar({
  tasks,
  statusFilter,
  onStatusFilterChange,
  sortBy,
  onSortChange,
  statusFilterVariant = 'dropdown',
  showOverdue = false,
  className = ''
}: TaskFilterBarProps) {
  // Compute counts using centralized utility
  const taskCounts = getTaskCounts(tasks);

  return (
    <div className={`flex flex-col md:flex-row md:items-center gap-4 ${className}`}>
      <div className="flex items-center space-x-2">
        <label htmlFor="status-filter" className="text-xs text-gray-700 font-medium">
          Filter:
        </label>
        <TaskStatusFilter
          value={statusFilter}
          onChange={onStatusFilterChange}
          counts={taskCounts}
          variant={statusFilterVariant}
          showOverdue={showOverdue}
          overdueCount={taskCounts.overdue}
        />
      </div>
      
      <div className="flex items-center space-x-2">
        <label htmlFor="sort" className="text-xs text-gray-700 font-medium">
          Sort:
        </label>
        <TaskSortSelect
          value={sortBy}
          onChange={onSortChange}
        />
      </div>
    </div>
  );
}

