'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import type { User } from '@/lib/types/user';
import type { Task } from '@/lib/types/task';
import { taskService } from '@/lib/services/task';

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user }: { user: User | null } = useUser();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const taskId = params?.id as string | undefined;
    if (!user?.token || !taskId) return;
    const token = user.token;

    async function fetchTask(id: string) {
      try {
        const res = await taskService.getTaskById(token, id);
        if (res.status === 'success') {
          setTask(res.data);
        } else {
          setError(res.message || 'Failed to load task');
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load task');
      } finally {
        setLoading(false);
      }
    }

    fetchTask(taskId);
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
        <div className="text-gray-500">Loading task...</div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">{error || 'Task not found'}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          <button onClick={() => router.push('/tasks')} className="text-sm text-gray-600 hover:text-gray-900">← Back to Tasks</button>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{task.title}</h1>
              <span className="px-2 py-1 rounded text-sm bg-gray-100 text-gray-700">{task.status.replace('_', ' ')}</span>
            </div>
            <p className="text-gray-700 mb-4">{task.description}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
              <div><span className="font-medium">Due:</span> {new Date(task.dueDate).toLocaleString()}</div>
              <div><span className="font-medium">Created:</span> {new Date(task.createdAt).toLocaleString()}</div>
              {task.assigneeId && <div><span className="font-medium">Assignee:</span> {task.assigneeId}</div>}
              {task.projectId && <div><span className="font-medium">Project:</span> {task.projectId}</div>}
            </div>
            {(task.collaborators?.length ?? 0) > 0 && (
              <div className="mt-4 text-sm text-gray-700">
                <div className="font-medium mb-1">Collaborators</div>
                <div className="flex flex-wrap gap-2">
                  {task.collaborators.map((c) => (
                    <span key={c} className="px-2 py-1 rounded bg-gray-100">{c}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}


