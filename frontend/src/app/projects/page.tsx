'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import type { User } from '@/lib/types/user';
import { ProjectItem } from '@/components/features/projects/ProjectItem';
import { projectService } from '@/lib/services/project';
import { taskService } from '@/lib/services/task';
import type { Project } from '@/lib/types/project';
import { storage } from '@/lib/utils/storage';
import { CreateProjectModal } from '@/components/forms/CreateProjectModal';
import { EditProjectModal } from '@/components/forms/EditProjectModal';

export default function ProjectsPage() {
  const { user }: { user: User | null } = useUser();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  // Single view (grid) only
  const token = storage.getToken();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [taskCounts, setTaskCounts] = useState<Record<string, number>>({});

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
                <button onClick={() => setIsCreateOpen(true)} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
                  New Project
                </button>
              </div>
            </div>
          </div>

          {/* Project Grid View */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => {
              const key = (project.id || project._id) as string;
              return (
                <ProjectItem
                  key={key}
                  project={project}
                  activeTaskCount={taskCounts[key] ?? 0}
                  onClick={() => router.push(`/projects/${key}`)}
                />
              );
            })}
          </div>
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
