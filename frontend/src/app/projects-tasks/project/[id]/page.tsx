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
  const { user, canAssignTasks }: { user: User | null; canAssignTasks: () => boolean } = useUser();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const token = storage.getToken();
  const [progress, setProgress] = useState<{ total: number; unassigned: number; ongoing: number; under_review: number; completed: number; percent: number } | null>(null);

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

        // Fetch aggregated progress (if authorized)
        try {
          const progRes = await projectService.getProjectProgress(token, id);
          if (progRes?.status === 'success') {
            setProgress(progRes.data);
          }
        } catch {}
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
        <div className="text-gray-500">{error || 'You do not have access to this project or it does not exist.'}</div>
      </div>
    );
  }

  // Calculate project task statistics
  const now = new Date();
  const projectStats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    inProgress: tasks.filter(t => t.status === 'ongoing' || t.status === 'under_review').length,
    overdue: tasks.filter(t => new Date(t.dueDate) < now && t.status !== 'completed').length,
    unassigned: tasks.filter(t => t.status === 'unassigned').length,
  };

  const completionPercentage = typeof progress?.percent === 'number'
    ? progress.percent
    : projectStats.total > 0
      ? Math.round((projectStats.completed / projectStats.total) * 100)
      : 0;

  // Filter tasks based on active filter
  const getFilteredTasks = () => {
    switch (activeFilter) {
      case 'overdue':
        return tasks.filter(t => new Date(t.dueDate) < now && t.status !== 'completed');
      case 'in-progress':
        return tasks.filter(t => t.status === 'ongoing' || t.status === 'under_review');
      case 'completed':
        return tasks.filter(t => t.status === 'completed');
      case 'unassigned':
        return tasks.filter(t => t.status === 'unassigned');
      default:
        return tasks;
    }
  };

  const getFilterTitle = () => {
    switch (activeFilter) {
      case 'overdue':
        return 'Overdue Tasks';
      case 'in-progress':
        return 'Tasks In Progress';
      case 'completed':
        return 'Completed Tasks';
      case 'unassigned':
        return 'Unassigned Tasks';
      default:
        return 'All Tasks';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          <button onClick={() => router.push('/projects-tasks')} className="text-sm text-gray-600 hover:text-gray-900">← Back to Projects & Tasks</button>

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
                {user && canAssignTasks() && (
                  <ProjectCollaboratorPicker project={project} onUpdated={setProject} />
                )}
              </div>
            </div>
          </div>

          {/* Project Dashboard */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-6">Project Dashboard</h2>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <StatCard
                title="Total"
                value={progress?.total ?? projectStats.total}
                icon="📋"
                color="blue"
                onClick={() => setActiveFilter('all')}
                active={activeFilter === 'all'}
              />
              <StatCard
                title="Completed"
                value={progress?.completed ?? projectStats.completed}
                icon="✅"
                color="green"
                onClick={() => setActiveFilter('completed')}
                active={activeFilter === 'completed'}
              />
              <StatCard
                title="In Progress"
                value={progress ? (progress.ongoing + progress.under_review) : projectStats.inProgress}
                icon="🔄"
                color="yellow"
                onClick={() => setActiveFilter('in-progress')}
                active={activeFilter === 'in-progress'}
              />
              <StatCard
                title="Overdue"
                value={projectStats.overdue}
                icon="⚠️"
                color="red"
                onClick={() => setActiveFilter('overdue')}
                active={activeFilter === 'overdue'}
              />
              <StatCard
                title="Unassigned"
                value={progress?.unassigned ?? projectStats.unassigned}
                icon="❓"
                color="gray"
                onClick={() => setActiveFilter('unassigned')}
                active={activeFilter === 'unassigned'}
              />
            </div>

            {/* Progress Section */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Project Progress</h3>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Completion Rate</span>
                    <span>{completionPercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${completionPercentage}%` }}
                    ></div>
                  </div>
                </div>
                <div className="text-2xl font-bold text-blue-600">{completionPercentage}%</div>
              </div>
            </div>
          </div>

          {/* Filtered Tasks Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{getFilterTitle()}</h2>
              <span className="text-sm text-gray-500">
                {getFilteredTasks().length} of {tasks.length} tasks
              </span>
            </div>
            
            {getFilteredTasks().length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">📝</div>
                <div className="text-gray-500">
                  {activeFilter === 'all' 
                    ? 'No tasks in this project.'
                    : `No ${activeFilter.replace('-', ' ')} tasks found.`
                  }
                </div>
              </div>
            ) : (
              <div className="divide-y">
                {getFilteredTasks().map((t) => (
                  <TaskCard
                    key={t.id}
                    task={t}
                    onClick={() => router.push(`/projects-tasks/task/${t.id}`)}
                  />
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
          forceDepartmentScope={true}
          departmentIdOverride={project.departmentId as unknown as string}
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
            const trimmed = selectedUserId.trim();
            if (!trimmed) return;
            const addRes = await projectService.addCollaborator(token, id, trimmed);
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

interface StatCardProps {
  title: string;
  value: number;
  icon: string;
  color: 'blue' | 'green' | 'yellow' | 'red' | 'gray';
  onClick: () => void;
  active: boolean;
}

function StatCard({ title, value, icon, color, onClick, active }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-800',
    green: 'bg-green-50 border-green-200 text-green-800',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    red: 'bg-red-50 border-red-200 text-red-800',
    gray: 'bg-gray-50 border-gray-200 text-gray-800',
  };

  const activeColorClasses = {
    blue: 'bg-blue-100 border-blue-300',
    green: 'bg-green-100 border-green-300',
    yellow: 'bg-yellow-100 border-yellow-300',
    red: 'bg-red-100 border-red-300',
    gray: 'bg-gray-100 border-gray-300',
  };

  return (
    <div
      className={`
        p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md
        ${active ? activeColorClasses[color] : colorClasses[color]}
        ${active ? 'shadow-md' : ''}
      `}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium opacity-75">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <div className="text-2xl">{icon}</div>
      </div>
    </div>
  );
}

interface TaskCardProps {
  task: Task;
  onClick: () => void;
}

function TaskCard({ task, onClick }: TaskCardProps) {
  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'completed';
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'ongoing':
        return 'bg-blue-100 text-blue-800';
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800';
      case 'unassigned':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div
      className="py-4 flex items-start justify-between hover:bg-gray-50 cursor-pointer transition-colors duration-200 px-2 rounded"
      onClick={onClick}
    >
      <div className="flex-1">
        <div className="font-medium text-gray-900">{task.title}</div>
        <div className="text-sm text-gray-600 mt-1">{task.description}</div>
        <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
          <span>Due: {formatDate(task.dueDate)}</span>
          {task.assigneeName && <span>Assignee: {task.assigneeName}</span>}
          {(task.collaboratorNames?.length ?? 0) > 0 && (
            <span>Collaborators: {task.collaboratorNames?.join(', ')}</span>
          )}
        </div>
      </div>
      <div className="flex flex-col items-end gap-2">
        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(task.status)}`}>
          {task.status.replace('_', ' ')}
        </span>
        {isOverdue && (
          <span className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
            Overdue
          </span>
        )}
      </div>
    </div>
  );
}
