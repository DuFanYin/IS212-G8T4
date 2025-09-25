import type { Project } from '@/lib/types/project';
import { formatDate } from '@/lib/utils/formatDate';

interface ProjectItemProps {
  project: Project;
  onToggleArchive: (project: Project) => void;
  collabValue: string;
  onChangeCollabValue: (value: string) => void;
  onAddCollaborator: (project: Project, collaboratorId: string) => void;
  onRemoveCollaborator: (project: Project, collaboratorId: string) => void;
  activeTaskCount?: number;
  readOnly?: boolean;
  onClick?: (project: Project) => void;
}

export const ProjectItem = ({
  project,
  onToggleArchive,
  collabValue,
  onChangeCollabValue,
  onAddCollaborator,
  onRemoveCollaborator,
  activeTaskCount,
  readOnly,
  onClick,
}: ProjectItemProps) => {
  return (
    <div
      className={`bg-white rounded-lg shadow hover:shadow-md transition-shadow ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick ? () => onClick(project) : undefined}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <h2 className="text-xl font-semibold text-gray-900 break-words min-w-0">
            {project.name}
          </h2>
          {!readOnly && (
            <button
              onClick={(e) => { e.stopPropagation(); onToggleArchive(project); }}
              className="px-2 py-1 text-sm rounded bg-blue-100 text-blue-800 shrink-0"
              title={!project.isArchived ? 'Set archived' : 'Set active'}
            >
              {!project.isArchived ? 'Active' : 'Archived'}
            </button>
          )}
        </div>

        {/* Description */}
        <p className="text-gray-600 mb-4 break-words">{project.description}</p>

        {/* Meta */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>
              Due: {project.deadline ? formatDate(project.deadline) : '-'}
            </span>
            <span>{typeof activeTaskCount === 'number' ? activeTaskCount : 0} active tasks</span>
          </div>
        </div>

        {/* Footer actions */}
        {!readOnly && (
          <div className="mt-4 pt-4 border-t flex flex-wrap items-center gap-2">
            <label htmlFor={`collab-${project.id || project._id}`} className="sr-only">Collaborator ID</label>
            <input
              id={`collab-${project.id || project._id}`}
              placeholder="User ID"
              className="px-2 py-1 border rounded text-sm grow min-w-[8rem]"
              value={collabValue}
              onChange={(e) => onChangeCollabValue(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={(e) => { e.stopPropagation(); onAddCollaborator(project, collabValue); }}
                className="text-sm px-2 py-1 rounded bg-gray-100 hover:bg-gray-200"
              >
                Add Collaborator
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onRemoveCollaborator(project, collabValue); }}
                className="text-sm px-2 py-1 rounded bg-gray-100 hover:bg-gray-200"
              >
                Remove Collaborator
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


