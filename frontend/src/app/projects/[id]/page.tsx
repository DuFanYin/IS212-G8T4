'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import type { User } from '@/lib/types/user';
import type { Project } from '@/lib/types/project';
import type { Task } from '@/lib/types/task';
import { projectService } from '@/lib/services/project';
import { taskService } from '@/lib/services/task';
import { formatDate } from '@/lib/utils/formatDate';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user }: { user: User | null } = useUser();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const projectId = params?.id as string | undefined;
    if (!user?.token || !projectId) return;
    const token = user.token;

    async function fetchData(id: string) {
      try {
        const projectsRes = await projectService.getProjects(token);
        const list = projectsRes.data || [];
        const found = list.find((p: Project) => (p.id || p._id) === id) || null;
        setProject(found);

        const tasksRes = await taskService.getTasksByProject(token, id);
        setTasks(tasksRes.data || []);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load project');
      } finally {
        setLoading(false);
      }
    }

    fetchData(projectId);
  }, [user?.token, params?.id]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Loading project...</div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">{error || 'Project not found'}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          <button onClick={() => router.push('/projects')} className="text-sm text-gray-600 hover:text-gray-900">← Back to Projects</button>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between gap-3 mb-3">
              <h1 className="text-2xl font-bold text-gray-900 break-words">{project.name}</h1>
              <span className="px-2 py-1 rounded text-sm bg-blue-100 text-blue-800">{project.isArchived ? 'Archived' : 'Active'}</span>
            </div>
            <p className="text-gray-700 mb-4 break-words">{project.description || '-'}</p>
            <div className="text-sm text-gray-600">Due: {project.deadline ? formatDate(project.deadline) : '-'}</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Tasks</h2>
            {tasks.length === 0 ? (
              <div className="text-gray-500">No tasks in this project.</div>
            ) : (
              <div className="divide-y">
                {tasks.map((t) => (
                  <div key={t.id} className="py-4 flex items-start justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{t.title}</div>
                      <div className="text-sm text-gray-600">{t.description}</div>
                      <div className="text-xs text-gray-500 mt-1">Due: {new Date(t.dueDate).toLocaleString()}</div>
                    </div>
                    <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-700">{t.status.replace('_', ' ')}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}


