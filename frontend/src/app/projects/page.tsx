'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import type { User } from '@/lib/types/user';
import { formatDate } from '@/lib/utils/formatDate';
import { projectService } from '@/lib/services/project';
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
        setProjects((json.data as Project[]) || []);
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
              {projects.map((project) => (
                <div key={project.id || project._id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h2 className="text-xl font-semibold text-gray-900">{project.name}</h2>
                      <button onClick={() => handleArchiveToggle(project)} className="px-2 py-1 text-sm rounded bg-blue-100 text-blue-800">
                        {!project.isArchived ? "Active" : "Archived"}
                      </button>
                    </div>
                    <p className="text-gray-600 mb-4">{project.description}</p>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm text-gray-500 mb-1">
                          <span>Progress</span>
                          <span>60%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                        </div>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Due: {project.deadline ? formatDate(project.deadline) : '-'}</span>
                        <span className="text-gray-500">{project.hasContainedTasks ? "5" : "0"} active tasks</span>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center space-x-2">
                      <input
                        placeholder="User ID"
                        className="px-2 py-1 border rounded text-sm"
                        value={collabInputs[(project.id || project._id) as string] || ''}
                        onChange={(e) => {
                          const key = (project.id || project._id) as string;
                          setCollabInputs(prev => ({ ...prev, [key]: e.target.value }));
                        }}
                      />
                      <button onClick={() => handleAddCollaborator(project, collabInputs[(project.id || project._id) as string] || '')} className="text-sm px-2 py-1 rounded bg-gray-100 hover:bg-gray-200">Add Collaborator</button>
                      <button onClick={() => handleRemoveCollaborator(project, collabInputs[(project.id || project._id) as string] || '')} className="text-sm px-2 py-1 rounded bg-gray-100 hover:bg-gray-200">Remove Collaborator</button>
                    </div>
                  </div>
                </div>
              ))}
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
                        <p className="text-gray-600 mb-3">Complete overhaul of company website with modern design</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>{project.deadline ? formatDate(project.deadline) : '-'}</span>
                          <span>•</span>
                          <span>{project.hasContainedTasks ? "5" : "0"} active tasks</span>
                          <span>•</span>
                          <span>60% complete</span>
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
