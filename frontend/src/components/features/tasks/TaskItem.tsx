import { Task } from '@/lib/types/task';

interface TaskItemProps {
  task: Task;
  onEdit: (task: Task) => void;
  onAssign: (task: Task) => void;
  onStatusChange: (task: Task, newStatus: Task['status']) => void;
  onArchive: (task: Task) => void;
  canAssign: boolean;
  readOnly?: boolean;
  onClick?: (task: Task) => void;
}

export const TaskItem = ({ 
  task, 
  onEdit, 
  onAssign, 
  onStatusChange, 
  onArchive, 
  canAssign,
  readOnly,
  onClick
}: TaskItemProps) => {
  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'unassigned':
        return 'bg-gray-100 text-gray-800';
      case 'ongoing':
        return 'bg-yellow-100 text-yellow-800';
      case 'under_review':
        return 'bg-purple-100 text-purple-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date() && task.status !== 'completed';
  };

  return (
    <div
      className={`p-6 bg-white border border-gray-200 rounded-lg shadow hover:shadow-md transition-shadow ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick ? () => onClick(task) : undefined}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="flex-1">
        <div className="flex items-center flex-wrap gap-2 mb-2">
          <h3 className="text-lg font-medium">{task.title}</h3>
          <span className={`px-2 py-1 rounded text-sm ${getStatusColor(task.status)}`}>
            {task.status.replace('_', ' ').toUpperCase()}
          </span>
          {isOverdue(task.dueDate) && (
            <span className="px-2 py-1 rounded bg-red-100 text-red-800 text-sm">
              OVERDUE
            </span>
          )}
        </div>

        <p className="text-gray-600 mb-3">{task.description}</p>

        <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
          <span className={isOverdue(task.dueDate) ? 'text-red-600 font-medium' : ''}>
            Due: {formatDate(task.dueDate)}
          </span>
          {task.projectId && (
            <>
              <span>•</span>
              <span>Project: {task.projectId}</span>
            </>
          )}
          {task.collaborators && task.collaborators.length > 0 && (
            <>
              <span>•</span>
              <span>{task.collaborators.length} collaborator{task.collaborators.length > 1 ? 's' : ''}</span>
            </>
          )}
          {task.attachments && task.attachments.length > 0 && (
            <>
              <span>•</span>
              <span>{task.attachments.length} attachment{task.attachments.length > 1 ? 's' : ''}</span>
            </>
          )}
        </div>
      </div>

      {!readOnly && (
        <div className="mt-4 pt-4 border-t flex flex-wrap items-center justify-end gap-3">
          <label className="sr-only" htmlFor={`status-${task.id}`}>Change status</label>
          <select
            id={`status-${task.id}`}
            value={task.status}
            onChange={(e) => onStatusChange(task, e.target.value as Task['status'])}
            className="text-sm border border-gray-300 rounded px-2 py-1"
            onClick={(e) => e.stopPropagation()}
          >
            <option value="unassigned">Unassigned</option>
            <option value="ongoing">Ongoing</option>
            <option value="under_review">Under Review</option>
            <option value="completed">Completed</option>
          </select>

          {canAssign && task.status === 'unassigned' && (
            <button
              onClick={(e) => { e.stopPropagation(); onAssign(task); }}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Assign
            </button>
          )}

          <button
            onClick={(e) => { e.stopPropagation(); onEdit(task); }}
            className="text-gray-400 hover:text-gray-500"
            aria-label="Edit task"
            title="Edit task"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); onArchive(task); }}
            className="text-gray-400 hover:text-red-500"
            aria-label="Archive task"
            title="Archive task"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};
