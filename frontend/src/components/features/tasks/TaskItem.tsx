import { Task } from '@/lib/types/task';

interface TaskItemProps {
  task: Task;
  onClick?: (task: Task) => void;
}

export const TaskItem = ({ task, onClick }: TaskItemProps) => {
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
      className={`p-6 bg-white border border-gray-200 rounded-lg shadow hover:shadow-md transition-shadow ${onClick ? 'cursor-pointer' : ''} h-full flex flex-col`}
      onClick={onClick ? () => onClick(task) : undefined}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="flex-1 flex flex-col">
        <div className="flex items-center flex-wrap gap-2 mb-2 min-h-[2.25rem]">
          <h3 className="text-lg font-medium line-clamp-2">{task.title}</h3>
          <span className={`px-2 py-1 rounded text-sm ${getStatusColor(task.status)}`}>
            {task.status.replace('_', ' ').toUpperCase()}
          </span>
          {isOverdue(task.dueDate) && (
            <span className="px-2 py-1 rounded bg-red-100 text-red-800 text-sm">
              OVERDUE
            </span>
          )}
        </div>

        <p className="text-gray-600 mb-3 line-clamp-2 min-h-[3.25rem]">{task.description}</p>

        <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 min-h-[1.25rem]">
          <span className={isOverdue(task.dueDate) ? 'text-red-600 font-medium' : ''}>
            Due: {formatDate(task.dueDate)}
          </span>
          <span className={task.projectName ? '' : 'invisible'}>•</span>
          <span className={task.projectName ? '' : 'invisible'}>
            Project: {task.projectName || ''}
          </span>
          <span className={task.collaboratorNames && task.collaboratorNames.length > 0 ? '' : 'invisible'}>•</span>
          <span className={task.collaboratorNames && task.collaboratorNames.length > 0 ? '' : 'invisible'}>
            {task.collaboratorNames ? `${task.collaboratorNames.length} collaborator${task.collaboratorNames.length > 1 ? 's' : ''}` : ''}
          </span>
          {task.attachments && task.attachments.length > 0 && (
            <>
              <span>•</span>
              <span>{task.attachments.length} attachment{task.attachments.length > 1 ? 's' : ''}</span>
            </>
          )}
        </div>
      </div>

      {/* No inline actions - operations moved to detail page */}
    </div>
  );
};
