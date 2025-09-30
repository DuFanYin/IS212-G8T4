'use client';

import { useEffect, useMemo, useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import type { User } from '@/lib/types/user';
import type { Task } from '@/lib/types/task';
import { taskService } from '@/lib/services/task';
import { storage } from '@/lib/utils/storage';
import { TaskItem } from '@/components/features/tasks/TaskItem';

export default function DepartmentTasksPage() {
  const { user }: { user: User | null } = useUser();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  type StatusFilter = 'all' | 'unassigned' | 'ongoing' | 'under_review' | 'completed';
  type SortBy = 'due_asc' | 'due_desc' | 'status' | 'assignee' | 'project';
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortBy, setSortBy] = useState<SortBy>('due_asc');
  const token = storage.getToken();

  // Role-based access: Director+ can view department tasks
  const normalizeRole = (role?: string) => (role || '').toLowerCase();
  const roleRank: Record<string, number> = {
    'staff': 1,
    'manager': 2,
    'director': 3,
    'hr': 4,
    'senior management': 5,
    'sm': 5
  };
  const getRank = (role?: string) => roleRank[normalizeRole(role)] || 0;
  const canView = getRank(user?.role) >= 3; // Director+

  useEffect(() => {
    const load = async () => {
      if (!canView) {
        setLoading(false);
        setError('You do not have permission to view department tasks.');
        return;
      }
      if (!user?.departmentId || !token) return;
      try {
        setLoading(true);
        const res = await taskService.getTasksByDepartment(token, String(user.departmentId));
        if (res.status === 'success') setTasks(res.data);
        else setError(res.message || 'Failed to fetch department tasks');
      } catch {
        setError('Failed to fetch department tasks');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.departmentId, token, canView]);

  const kpis = useMemo(() => {
    const now = new Date();
    const counts = {
      total: tasks.length,
      unassigned: tasks.filter(t => t.status === 'unassigned').length,
      ongoing: tasks.filter(t => t.status === 'ongoing').length,
      under_review: tasks.filter(t => t.status === 'under_review').length,
      completed: tasks.filter(t => t.status === 'completed').length,
      overdue: tasks.filter(t => t.dueDate && new Date(t.dueDate) < now && t.status !== 'completed').length,
    };
    return counts;
  }, [tasks]);

  const filteredSorted = useMemo(() => {
    const base = statusFilter === 'all' ? tasks : tasks.filter(t => t.status === statusFilter);
    const arr = [...base];
    if (sortBy === 'due_asc') arr.sort((a, b) => new Date(a.dueDate || 0).getTime() - new Date(b.dueDate || 0).getTime());
    if (sortBy === 'due_desc') arr.sort((a, b) => new Date(b.dueDate || 0).getTime() - new Date(a.dueDate || 0).getTime());
    if (sortBy === 'status') arr.sort((a, b) => a.status.localeCompare(b.status));
    if (sortBy === 'assignee') arr.sort((a, b) => (a.assigneeName || '').localeCompare(b.assigneeName || ''));
    if (sortBy === 'project') arr.sort((a, b) => (a.projectName || '').localeCompare(b.projectName || ''));
    return arr;
  }, [tasks, statusFilter, sortBy]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!canView) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="p-6 bg-white rounded shadow text-center max-w-md">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Access restricted</h2>
          <p className="text-gray-600 text-sm">Only Directors and above can view department tasks.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Department Tasks</h1>
            <p className="text-sm text-gray-500">Showing tasks for your department</p>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            <div className="bg-white rounded shadow p-3"><div className="text-xs text-gray-500">Total</div><div className="text-xl font-semibold">{kpis.total}</div></div>
            <div className="bg-white rounded shadow p-3"><div className="text-xs text-gray-500">Unassigned</div><div className="text-xl font-semibold">{kpis.unassigned}</div></div>
            <div className="bg-white rounded shadow p-3"><div className="text-xs text-gray-500">Ongoing</div><div className="text-xl font-semibold">{kpis.ongoing}</div></div>
            <div className="bg-white rounded shadow p-3"><div className="text-xs text-gray-500">Under Review</div><div className="text-xl font-semibold">{kpis.under_review}</div></div>
            <div className="bg-white rounded shadow p-3"><div className="text-xs text-gray-500">Completed</div><div className="text-xl font-semibold">{kpis.completed}</div></div>
            <div className="bg-white rounded shadow p-3"><div className="text-xs text-gray-500">Overdue</div><div className="text-xl font-semibold">{kpis.overdue}</div></div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>
          )}

          {loading ? (
            <div className="p-8 text-center text-gray-500 bg-white rounded-lg shadow">Loading tasks...</div>
          ) : filteredSorted.length === 0 ? (
            <div className="p-8 text-center text-gray-500 bg-white rounded-lg shadow">No department tasks found.</div>
          ) : (
            <div>
              {/* Controls */}
              <div className="bg-white p-3 rounded shadow mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="flex flex-wrap gap-2">
                  {(['all','unassigned','ongoing','under_review','completed'] as const).map(key => (
                    <button key={key} onClick={() => setStatusFilter(key)} className={`px-3 py-1.5 rounded text-sm ${statusFilter===key ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                      {key.replace('_',' ')} {key==='all' ? `(${kpis.total})` : ''}
                    </button>
                  ))}
                </div>
                <div>
                  <select value={sortBy} onChange={e=>setSortBy(e.target.value as SortBy)} className="border rounded px-2 py-1 text-sm">
                    <option value="due_asc">Due date ↑</option>
                    <option value="due_desc">Due date ↓</option>
                    <option value="status">Status</option>
                    <option value="assignee">Assignee</option>
                    <option value="project">Project</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSorted.map((task) => (
                <TaskItem key={task.id} task={task} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}


