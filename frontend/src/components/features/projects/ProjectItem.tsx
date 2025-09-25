import type { Project } from '@/lib/types/project';
import { formatDate } from '@/lib/utils/formatDate';

interface ProjectItemProps {
  project: Project;
  activeTaskCount?: number;
  onClick?: (project: Project) => void;
}

export const ProjectItem = ({
  project,
  activeTaskCount,
  onClick,
}: ProjectItemProps) => {
  return (
    <div
      className={`bg-white rounded-lg shadow hover:shadow-md transition-shadow ${onClick ? 'cursor-pointer' : ''} h-full flex flex-col`}
      onClick={onClick ? () => onClick(project) : undefined}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="p-6 flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <h2 className="text-xl font-semibold text-gray-900 break-words min-w-0">
            {project.name}
          </h2>
          <span className="px-2 py-1 text-sm rounded bg-blue-100 text-blue-800 shrink-0">
            {!project.isArchived ? 'Active' : 'Archived'}
          </span>
        </div>

        {/* Description */}
        <p className="text-gray-600 mb-4 break-words line-clamp-2 min-h-[3.25rem]">{project.description}</p>

        {/* Meta */}
        <div className="space-y-3 mt-auto">
          <div className="flex items-center justify-between text-sm text-gray-500 min-h-[1.25rem]">
            <span>
              Due: {project.deadline ? formatDate(project.deadline) : '-'}
            </span>
            <span className={project.isOverdue ? 'text-red-600 font-medium' : ''}>
              {project.isOverdue ? 'Overdue' : ''}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm text-gray-500 min-h-[1.25rem]">
            <span>{typeof activeTaskCount === 'number' ? `${activeTaskCount} active tasks` : '0 active tasks'}</span>
            <span>{project.collaborators && project.collaborators.length > 0 ? `${project.collaborators.length} collaborators` : ''}</span>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Owner: {project.ownerName || '-'}</span>
            <span>Updated: {project.updatedAt ? formatDate(project.updatedAt) : '-'}</span>
          </div>
        </div>

        {/* No inline actions - operations moved to detail page */
        }
      </div>
    </div>
  );
};


