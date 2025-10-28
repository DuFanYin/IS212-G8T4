import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Project } from '@/lib/types/project';
import { formatDate } from '@/lib/utils/formatDate';
import { taskService } from '@/lib/services/task';
import { storage } from '@/lib/utils/storage';

interface ProjectItemProps {
  project: Project;
  onClick?: (project: Project) => void;
}

export const ProjectItem = ({
  project,
  onClick,
}: ProjectItemProps) => {
  const router = useRouter();
  const [activeTaskCount, setActiveTaskCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const token = storage.getToken();

  // Fetch active task count for this project
  useEffect(() => {
    async function fetchActiveTaskCount() {
      if (!token) {
        setLoading(false);
        return;
      }

      const projectId = project.id || project._id;
      if (!projectId) {
        setLoading(false);
        return;
      }

      try {
        const response = await taskService.getTasksByProject(token, projectId);
        const tasks = response.data || [];
        // Count active tasks (exclude completed and deleted tasks)
        const activeTasks = tasks.filter(task => 
          task.status !== 'completed' && !task.isDeleted
        );
        setActiveTaskCount(activeTasks.length);
      } catch (err) {
        console.error(`Failed to fetch tasks for project ${projectId}:`, err);
        setActiveTaskCount(0);
      } finally {
        setLoading(false);
      }
    }

    fetchActiveTaskCount();
  }, [project.id, project._id, token]);

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    const projectId = project.id || project._id;
    if (projectId) {
      router.push(`/projects-tasks/project/${projectId}`);
    }
  };

  const getStatusColor = (isArchived?: boolean) => {
    return isArchived ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800';
  };

  const getStatusText = (isArchived?: boolean) => {
    return isArchived ? 'Archived' : 'Active';
  };

  return (
    <div
      className={`bg-white rounded-lg shadow hover:shadow-md transition-shadow ${onClick ? 'cursor-pointer' : ''} h-40 flex flex-col`}
      onClick={onClick ? () => onClick(project) : undefined}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="p-4 flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 mb-2 pr-12">
          <h2 className="text-base font-semibold text-gray-900 break-words min-w-0 line-clamp-1">
            {project.name}
          </h2>
          <span className={`px-2 py-1 text-xs rounded ${getStatusColor(project.isArchived)} shrink-0`}>
            {getStatusText(project.isArchived)}
          </span>
        </div>

        {/* Description */}
        <p className="text-gray-600 mb-3 break-words line-clamp-2 text-sm flex-1">
          {project.description || 'No description provided'}
        </p>

        {/* Meta Information */}
        <div className="space-y-0.5 mt-auto">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Created: {project.createdAt ? formatDate(project.createdAt) : 'Unknown'}</span>
            <span>
              Due: {project.deadline ? formatDate(project.deadline) : 'No deadline'}
            </span>
          </div>
          
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>
              {loading ? 'Loading...' : `${activeTaskCount} active tasks`}
            </span>
            <span>
              {(() => {
                const count = Array.isArray(project.collaborators) && project.collaborators.length > 0
                  ? project.collaborators.length
                  : (project.collaboratorNames?.length ?? 0);
                return count > 0 ? `${count} collaborator${count > 1 ? 's' : ''}` : 'No collaborators';
              })()}
            </span>
          </div>
          
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Department: {project.departmentName || 'Unknown'}</span>
            <span>Owner: {project.ownerName || 'Unknown'}</span>
          </div>
          
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Updated: {project.updatedAt ? formatDate(project.updatedAt) : 'Never'}</span>
            {project.isOverdue && (
              <span className="text-red-600 font-medium">Overdue</span>
            )}
          </div>
        </div>
      </div>
      
      {/* View Details Button */}
      <div className="absolute top-4 right-4">
        <button
          onClick={handleViewDetails}
          className="p-1 bg-blue-500 hover:bg-blue-600 text-white rounded shadow-md hover:shadow-lg transition-all duration-200"
          title="View Project Details"
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


