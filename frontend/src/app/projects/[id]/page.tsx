'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import type { User } from '@/lib/types/user';
import type { Project } from '@/lib/types/project';
import type { Task } from '@/lib/types/task';
import { projectService } from '@/lib/services/project';
import { taskService } from '@/lib/services/task';
import { formatDate } from '@/lib/utils/formatDate';
import { storage } from '@/lib/utils/storage';
import { UserSelector } from '@/components/features/users/UserSelector';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user }: { user: User | null } = useUser();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const token = storage.getToken();

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
              <button
                onClick={async () => {
                  if (!token) return;
                  const id = (project.id || project._id) as string;
                  const res = await projectService.setArchived(token, id, !project.isArchived);
                  if (res?.data) setProject(res.data);
                }}
                className="px-2 py-1 rounded text-sm bg-blue-100 text-blue-800"
                title={!project.isArchived ? 'Set archived' : 'Set active'}
              >
                {project.isArchived ? 'Archived' : 'Active'}
              </button>
            </div>
            <p className="text-gray-700 mb-4 break-words">{project.description || '-'}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-700">
              <div><span className="font-medium">Due:</span> {project.deadline ? formatDate(project.deadline) : '-'}</div>
              <div><span className="font-medium">Owner:</span> {project.ownerName || '-'}</div>
              <div><span className="font-medium">Department:</span> {project.departmentName || '-'}</div>
              <div><span className="font-medium">Overdue:</span> {project.isOverdue ? 'Yes' : 'No'}</div>
              <div><span className="font-medium">Has Tasks:</span> {project.hasContainedTasks ? 'Yes' : 'No'}</div>
              <div><span className="font-medium">Created:</span> {project.createdAt ? new Date(project.createdAt).toLocaleString() : '-'}</div>
              <div><span className="font-medium">Updated:</span> {project.updatedAt ? new Date(project.updatedAt).toLocaleString() : '-'}</div>
            </div>
            <div className="mt-4 text-sm text-gray-700">
              <div className="font-medium mb-1">Collaborators ({project.collaboratorNames?.length ?? 0})</div>
              {(project.collaboratorNames?.length ?? 0) === 0 ? (
                <div className="text-gray-500 mb-3">0 collaborators</div>
              ) : (
                <div className="flex flex-wrap gap-2 mb-3">
                  {project.collaboratorNames!.map((c) => (
                    <span key={c} className="px-2 py-1 rounded bg-gray-100 text-gray-800">{c}</span>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-3">
                {user && (
                  <ProjectCollaboratorPicker project={project} onUpdated={setProject} />
                )}
              </div>
            </div>
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
                      <div className="text-xs text-gray-500">Assignee: {t.assigneeName || '-'}</div>
                      {(t.collaboratorNames?.length ?? t.collaborators?.length ?? 0) > 0 && (
                        <div className="text-xs text-gray-600 mt-1">Collaborators: {(t.collaboratorNames && t.collaboratorNames.length > 0 ? t.collaboratorNames : t.collaborators || []).join(', ')}</div>
                      )}
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



function ProjectCollaboratorPicker({ project, onUpdated }: { project: Project; onUpdated: (p: Project) => void }) {
  const { user }: { user: User | null } = useUser();
  const token = storage.getToken();
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [adding, setAdding] = useState<boolean>(false);
  const [resetTick, setResetTick] = useState<number>(0);
  if (!user) return null;
  return (
    <div className="flex items-center gap-2 w-full">
      <div className="flex-1">
        <UserSelector
          token={token || ''}
          userRole={user.role}
          userDepartmentId={user.departmentId}
          placeholder="Select collaborator..."
          resetTrigger={resetTick}
          onUserSelect={(u) => setSelectedUserId(u.id)}
        />
      </div>
      <button
        type="button"
        className="px-3 py-2 text-sm rounded bg-gray-900 text-white disabled:opacity-50"
        disabled={!selectedUserId || adding}
        onClick={async () => {
          if (!token || !selectedUserId || adding) return;
          setAdding(true);
          try {
            const id = (project.id || project._id) as string;
            const addRes = await projectService.addCollaborator(token, id, selectedUserId);
            if (addRes?.status === 'success' && addRes.data) {
              onUpdated(addRes.data as unknown as Project);
            } else {
              // fallback: refresh list, else show message
              const res = await projectService.getProjects(token);
              const list = res.data || [];
              const updated = list.find((p) => (p.id || p._id) === id) || project;
              onUpdated(updated);
              if (!addRes || addRes.status !== 'success') {
                alert(addRes?.message || 'Failed to add collaborator');
              }
            }
            setSelectedUserId('');
            setResetTick((t) => t + 1);
          } catch (e) {
            alert(e instanceof Error ? e.message : 'Failed to add collaborator');
          } finally {
            setAdding(false);
          }
        }}
      >
        {adding ? 'Adding...' : 'Add'}
      </button>
    </div>
  );
}
