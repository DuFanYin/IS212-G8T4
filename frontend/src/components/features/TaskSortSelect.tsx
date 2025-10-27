import type { SortOption } from '@/lib/utils/taskSort';

interface TaskSortSelectProps {
  value: SortOption;
  onChange: (sortBy: SortOption) => void;
  className?: string;
  size?: 'sm' | 'md';
}

export function TaskSortSelect({ value, onChange, className = '', size = 'sm' }: TaskSortSelectProps) {
  const baseClasses = size === 'sm' 
    ? 'px-2 py-1 rounded text-xs bg-gray-100 text-gray-800 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none'
    : 'border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value as SortOption)}
      className={`${baseClasses} ${className}`}
    >
      <option value="priority_high">Priority (High to Low)</option>
      <option value="priority_low">Priority (Low to High)</option>
      <option value="due_asc">Due Date (Earliest First)</option>
      <option value="due_desc">Due Date (Latest First)</option>
    </select>
  );
}

