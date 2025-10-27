import { useRouter } from 'next/navigation';
import { Task } from '@/lib/types/task';
import { getStatusColor, getPriorityColor, isTaskOverdue, formatStatusLabel } from '@/lib/utils/taskStatusColors';

interface TaskItemProps {
  task: Task;
  onClick?: (task: Task) => void;
}

export const TaskItem = ({ task, onClick }: TaskItemProps) => {
  const router = useRouter();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/projects-tasks/task/${task.id}`);
  };

  return (
    <div
      className={`bg-white border border-gray-200 rounded-lg shadow hover:shadow-md transition-shadow ${onClick ? 'cursor-pointer' : ''} h-40 flex flex-col`}
      onClick={onClick ? () => onClick(task) : undefined}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="p-4 flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 mb-2 pr-12">
          <div className="flex items-center gap-2 flex-1">
            <h3 className="text-base font-medium line-clamp-1">{task.title}</h3>
            {task.recurringInterval && (
              <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 text-xs font-medium flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
                {task.recurringInterval}d
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <span className={`px-2 py-1 rounded text-xs ${getPriorityColor(task.priority || 5)}`}>
              P{(task.priority || 5)}
            </span>
            <span className={`px-2 py-1 rounded text-xs ${getStatusColor(task.status)}`}>
              {formatStatusLabel(task.status)}
            </span>
            {isTaskOverdue(task.dueDate, task.status) && (
              <span className="px-2 py-1 rounded bg-red-100 text-red-800 text-xs">
                OVERDUE
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 mb-3 line-clamp-2 text-sm flex-1">
          {task.description || 'No description provided'}
        </p>

        {/* Meta Information */}
        <div className="space-y-1 mt-auto">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className={isTaskOverdue(task.dueDate, task.status) ? 'text-red-600 font-medium' : ''}>
              Due: {formatDate(task.dueDate)}
            </span>
            <span>
              Assignee: {task.assigneeName || 'Unassigned'}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>
              Project: {task.projectName || 'No project'}
            </span>
            <span>
              {task.collaboratorNames && task.collaboratorNames.length > 0 
                ? `${task.collaboratorNames.length} collaborator${task.collaboratorNames.length > 1 ? 's' : ''}`
                : 'No collaborators'
              }
            </span>
          </div>

          {task.recurringInterval && (
            <div className="flex items-center justify-between text-xs text-blue-600">
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
                Recurring every {task.recurringInterval} day{task.recurringInterval !== 1 ? 's' : ''}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Created: {formatDate(task.createdAt)}</span>
            <span>
              {task.attachments && task.attachments.length > 0 
                ? `${task.attachments.length} attachment${task.attachments.length > 1 ? 's' : ''}`
                : 'No attachments'
              }
            </span>
          </div>
        </div>
      </div>
      
      {/* View Details Button */}
      <div className="absolute top-4 right-4">
        <button
          onClick={handleViewDetails}
          className="p-1 bg-blue-500 hover:bg-blue-600 text-white rounded shadow-md hover:shadow-lg transition-all duration-200"
          title="View Task Details"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </button>
      </div>
    </div>
  );
};
