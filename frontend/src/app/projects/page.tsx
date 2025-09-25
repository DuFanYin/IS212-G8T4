'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import type { User } from '@/lib/types/user';
import { formatDate } from '@/lib/utils/formatDate';
import { ProjectItem } from '@/components/features/projects/ProjectItem';
import { projectService } from '@/lib/services/project';
import { taskService } from '@/lib/services/task';
import type { Project } from '@/lib/types/project';
import { storage } from '@/lib/utils/storage';
import { CreateProjectModal } from '@/components/forms/CreateProjectModal';
import { EditProjectModal } from '@/components/forms/EditProjectModal';

export default function ProjectsPage() {
  const { user }: { user: User | null } = useUser();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState('grid');
  const token = storage.getToken();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [collabInputs, setCollabInputs] = useState<Record<string, string>>({});
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [taskCounts, setTaskCounts] = useState<Record<string, number>>({});

  const handleArchiveToggle = async (project: Project) => {
    if (!token || !project.id && !project._id) return;
    const id = (project.id || project._id) as string;
    try {
      const res = await projectService.setArchived(token, id, !project.isArchived);
      if (res.status === 'success' && res.data) {
        setProjects(prev => prev.map(p => (p.id === id || p._id === id) ? res.data! : p));
      }
    } catch {}
  };

  const handleAddCollaborator = async (project: Project, collaboratorId: string) => {
    if (!token || !project.id && !project._id) return;
    const id = (project.id || project._id) as string;
    try {
      await projectService.addCollaborator(token, id, collaboratorId);
    } catch {}
  };

  const handleRemoveCollaborator = async (project: Project, collaboratorId: string) => {
    if (!token || !project.id && !project._id) return;
    const id = (project.id || project._id) as string;
    try {
      await projectService.removeCollaborator(token, id, collaboratorId);
    } catch {}
  };

  useEffect(() => {
    if (!user?.token) return;
    
    async function fetchProjects() {
      try {
        const token = user?.token;
        if (!token) return;
        const json = await projectService.getProjects(token);
        const fetchedProjects = (json.data as Project[]) || [];
        setProjects(fetchedProjects);

        // Fetch task counts per project
        const entries = await Promise.all(
          fetchedProjects.map(async (p) => {
            const id = (p.id || p._id) as string;
            if (!id) return [id, 0] as const;
            try {
              const tasksRes = await taskService.getTasksByProject(token, id);
              const tasks = tasksRes.data || [];
              const activeCount = tasks.filter(t => t.status !== 'completed').length;
              return [id, activeCount] as const;
            } catch {
              return [id, 0] as const;
            }
          })
        );
        const counts: Record<string, number> = {};
        for (const [id, count] of entries) {
          if (id) counts[id] = count;
        }
        setTaskCounts(counts);
      } catch (err) {
        if(err instanceof Error){
          console.error('Failed to fetch projects:', err.message);
        }
        else{
          console.error('Failed to fetch projects:', err);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, [user?.token]);

  if (!user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setSelectedView('grid')}
                    className={`p-2 rounded ${
                      selectedView === 'grid' ? 'bg-gray-200' : 'hover:bg-gray-100'
                    }`}
                  >
                    <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setSelectedView('list')}
                    className={`p-2 rounded ${
                      selectedView === 'list' ? 'bg-gray-200' : 'hover:bg-gray-100'
                    }`}
                  >
                    <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                </div>
                <button onClick={() => setIsCreateOpen(true)} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
                  New Project
                </button>
              </div>
            </div>
          </div>

          {/* Project Grid/List View */}
          {selectedView === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

              {/* Project Card */}
              {projects.map((project) => {
                const key = (project.id || project._id) as string;
                const value = collabInputs[key] || '';
                return (
                  <ProjectItem
                    key={key}
                    project={project}
                    onToggleArchive={handleArchiveToggle}
                    collabValue={value}
                    onChangeCollabValue={(v) => setCollabInputs(prev => ({ ...prev, [key]: v }))}
                    onAddCollaborator={handleAddCollaborator}
                    onRemoveCollaborator={handleRemoveCollaborator}
                    activeTaskCount={taskCounts[key] ?? 0}
                  />
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow">
              <div className="divide-y">
                {/* Project List Item */}
                {projects.map((project) => (
                  <div key={project.id || project._id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <h2 className="text-xl font-semibold text-gray-900 mr-3">{project.name}</h2>
                          <button onClick={() => handleArchiveToggle(project)} className="px-2 py-1 text-sm rounded bg-blue-100 text-blue-800">{!project.isArchived ? "Active" : "Archived"}</button>
                        </div>
                        <p className="text-gray-600 mb-3">{project.description || '-'}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>{project.deadline ? formatDate(project.deadline) : '-'}</span>
                          <span>•</span>
                          <span>{taskCounts[(project.id || project._id) as string] ?? 0} active tasks</span>
                        </div>
                      </div>
                      <div className="ml-6">
                        <button onClick={() => {
                          setEditProject(project);
                          setIsEditOpen(true);
                        }} className="text-gray-400 hover:text-gray-500">
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <CreateProjectModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreate={async (data) => {
          if (!token) return;
          const res = await projectService.createProject(token, data);
          if (res.status === 'success' && res.data) {
            setProjects((prev) => [res.data!, ...prev]);
          }
        }}
      />

      <EditProjectModal
        isOpen={isEditOpen}
        project={editProject}
        onClose={() => setIsEditOpen(false)}
        onSave={async (id, data) => {
          if (!token) return;
          const res = await projectService.updateProject(token, id, data);
          if (res.status === 'success' && res.data) {
            setProjects((prev) => prev.map(p => (p.id === id || p._id === id) ? res.data! : p));
            setEditProject(null);
          }
        }}
      />
    </div>
  );
}
