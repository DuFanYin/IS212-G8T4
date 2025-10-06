import { useRouter } from 'next/navigation';
import { Task } from '@/lib/types/task';

interface TaskItemProps {
  task: Task;
  onClick?: (task: Task) => void;
}

export const TaskItem = ({ task, onClick }: TaskItemProps) => {
  const router = useRouter();
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
    // Compare by day; consider due date as end-of-day to avoid timezone false positives
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(23, 59, 59, 999);
    return due < today && task.status !== 'completed';
  };

  const getPriorityColor = (priority: number) => {
    if (priority >= 8) return 'bg-red-100 text-red-800'; // High priority
    if (priority >= 6) return 'bg-orange-100 text-orange-800'; // Medium-high
    if (priority >= 4) return 'bg-yellow-100 text-yellow-800'; // Medium
    return 'bg-green-100 text-green-800'; // Low priority
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
          <h3 className="text-base font-medium line-clamp-1 flex-1">{task.title}</h3>
          <div className="flex items-center gap-1 shrink-0">
            <span className={`px-2 py-1 rounded text-xs ${getPriorityColor(task.priority || 5)}`}>
              P{(task.priority || 5)}
            </span>
            <span className={`px-2 py-1 rounded text-xs ${getStatusColor(task.status)}`}>
              {task.status.replace('_', ' ').toUpperCase()}
            </span>
            {isOverdue(task.dueDate) && (
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
            <span className={isOverdue(task.dueDate) ? 'text-red-600 font-medium' : ''}>
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
