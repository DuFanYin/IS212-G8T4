import type { StatusFilter } from '@/lib/utils/taskSort';

interface TaskStatusFilterProps {
  value: StatusFilter;
  onChange: (status: StatusFilter) => void;
  counts: {
    all: number;
    unassigned: number;
    ongoing: number;
    under_review: number;
    completed: number;
  };
  variant?: 'buttons' | 'dropdown';
  showOverdue?: boolean;
  overdueCount?: number;
  className?: string;
}

export function TaskStatusFilter({ 
  value, 
  onChange, 
  counts, 
  variant = 'dropdown',
  showOverdue = false,
  overdueCount = 0,
  className = ''
}: TaskStatusFilterProps) {
  if (variant === 'buttons') {
    return (
      <div className={`grid grid-cols-6 gap-3 ${className}`}>
        <button 
          onClick={() => onChange('all')} 
          className={`bg-white rounded shadow p-3 text-left border ${value === 'all' ? 'border-blue-400' : 'border-slate-200 hover:border-blue-200'}`}
        >
          <div className="text-xs text-gray-500">All</div>
          <div className="text-xl font-semibold">{counts.all}</div>
        </button>
        <button 
          onClick={() => onChange('unassigned')} 
          className={`bg-white rounded shadow p-3 text-left border ${value === 'unassigned' ? 'border-blue-400' : 'border-slate-200 hover:border-blue-200'}`}
        >
          <div className="text-xs text-gray-500">Unassigned</div>
          <div className="text-xl font-semibold">{counts.unassigned}</div>
        </button>
        <button 
          onClick={() => onChange('ongoing')} 
          className={`bg-white rounded shadow p-3 text-left border ${value === 'ongoing' ? 'border-blue-400' : 'border-slate-200 hover:border-blue-200'}`}
        >
          <div className="text-xs text-gray-500">Ongoing</div>
          <div className="text-xl font-semibold">{counts.ongoing}</div>
        </button>
        <button 
          onClick={() => onChange('under_review')} 
          className={`bg-white rounded shadow p-3 text-left border ${value === 'under_review' ? 'border-blue-400' : 'border-slate-200 hover:border-blue-200'}`}
        >
          <div className="text-xs text-gray-500">Under Review</div>
          <div className="text-xl font-semibold">{counts.under_review}</div>
        </button>
        <button 
          onClick={() => onChange('completed')} 
          className={`bg-white rounded shadow p-3 text-left border ${value === 'completed' ? 'border-blue-400' : 'border-slate-200 hover:border-blue-200'}`}
        >
          <div className="text-xs text-gray-500">Completed</div>
          <div className="text-xl font-semibold">{counts.completed}</div>
        </button>
        {showOverdue && (
          <button 
            onClick={() => onChange('overdue')} 
            className={`bg-white rounded shadow p-3 text-left border ${value === 'overdue' ? 'border-blue-400' : 'border-slate-200 hover:border-blue-200'}`}
          >
            <div className="text-xs text-gray-500">Overdue</div>
            <div className="text-xl font-semibold">{overdueCount}</div>
          </button>
        )}
      </div>
    );
  }

  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value as StatusFilter)}
      className={`px-2 py-1 rounded text-xs bg-gray-100 text-gray-800 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none ${className}`}
    >
      <option value="all">All ({counts.all})</option>
      <option value="unassigned">Unassigned ({counts.unassigned})</option>
      <option value="ongoing">Ongoing ({counts.ongoing})</option>
      <option value="under_review">Under Review ({counts.under_review})</option>
      <option value="completed">Completed ({counts.completed})</option>
      {showOverdue && <option value="overdue">Overdue ({overdueCount})</option>}
    </select>
  );
}

