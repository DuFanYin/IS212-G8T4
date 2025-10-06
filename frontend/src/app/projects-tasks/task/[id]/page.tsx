'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import type { User } from '@/lib/types/user';
import type { Task } from '@/lib/types/task';
import { taskService } from '@/lib/services/task';
import { subtaskService } from '@/lib/services/subtask';
import { SubtaskList } from '@/components/features/tasks/SubtaskList';
import type { Subtask } from '@/lib/types/subtask';
import { storage } from '@/lib/utils/storage';
import { UserSelector } from '@/components/features/users/UserSelector';

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, canAssignTasks }: { user: User | null; canAssignTasks: () => boolean } = useUser();
  const [task, setTask] = useState<Task | null>(null);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // selection handled via UserSelector + confirm buttons
  const [selectedAssigneeId, setSelectedAssigneeId] = useState<string>('');
  const [selectedCollaboratorId, setSelectedCollaboratorId] = useState<string>('');
  const [addingCollaborator, setAddingCollaborator] = useState<boolean>(false);
  const [assigneeResetTick, setAssigneeResetTick] = useState<number>(0);
  const [collabResetTick, setCollabResetTick] = useState<number>(0);
  const token = storage.getToken();

  useEffect(() => {
    const taskId = params?.id as string | undefined;
    if (!user?.token || !taskId) return;
    const token = user.token;

    async function fetchTask(id: string) {
      try {
        const [taskRes, subtaskRes] = await Promise.all([
          taskService.getTaskById(token, id),
          subtaskService.getByParentTask(token, id)
        ]);

        if (taskRes.status === 'success') {
          setTask(taskRes.data);
        } else {
          setError(taskRes.message || 'Failed to load task');
        }

        if (subtaskRes.status === 'success') {
          setSubtasks(subtaskRes.data || []);
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
          <button onClick={() => router.push('/projects-tasks')} className="text-sm text-gray-600 hover:text-gray-900">← Back to Projects & Tasks</button>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{task.title}</h1>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <label htmlFor="priority" className="text-sm font-medium text-gray-700">Priority:</label>
                  <select
                    id="priority"
                    value={task.priority || 5}
                    onChange={async (e) => {
                      if (!token) return;
                      const newPriority = parseInt(e.target.value);
                      const res = await taskService.updateTask(token, task.id, { priority: newPriority });
                      if (res?.data) setTask(res.data);
                    }}
                    className="px-2 py-1 rounded text-sm border border-gray-300 bg-white text-gray-700"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                </div>
                <select
                  value={task.status}
                  onChange={async (e) => {
                    if (!token) return;
                    const res = await taskService.updateTaskStatus(token, task.id, { status: e.target.value as Task['status'] });
                    if (res?.data) setTask(res.data);
                  }}
                  className="px-2 py-1 rounded text-sm border border-gray-300 bg-white text-gray-700"
                >
                  <option value="unassigned">Unassigned</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="under_review">Under Review</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
            <p className="text-gray-700 mb-4">{task.description}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
              <div><span className="font-medium">Priority:</span> {task.priority || 5}/10</div>
              <div><span className="font-medium">Due:</span> {new Date(task.dueDate).toLocaleString()}</div>
              <div><span className="font-medium">Created:</span> {new Date(task.createdAt).toLocaleString()}</div>
              {task.assigneeName && <div><span className="font-medium">Assignee:</span> {task.assigneeName}</div>}
              {task.projectName && <div><span className="font-medium">Project:</span> {task.projectName}</div>}
              <div><span className="font-medium">Created By:</span> {task.createdByName || '-'}</div>
              <div><span className="font-medium">Updated:</span> {new Date(task.updatedAt).toLocaleString()}</div>
            </div>
            <div className="mt-4 text-sm text-gray-700">
              <div className="font-medium mb-1">Collaborators ({task.collaboratorNames?.length ?? 0})</div>
              {(task.collaboratorNames?.length ?? 0) === 0 ? (
                <div className="text-gray-500">0 collaborators</div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {task.collaboratorNames!.map((n) => (
                    <span key={n} className="px-2 py-1 rounded bg-gray-100">{n}</span>
                  ))}
                </div>
              )}
            </div>

            {(task.attachments?.length ?? 0) > 0 && (
              <div className="mt-6">
                <div className="font-medium text-gray-800 mb-2">Attachments</div>
                <div className="space-y-2 text-sm text-gray-700">
                  {task.attachments.map((a) => (
                    <div key={`${a.path}-${a.uploadedAt}`} className="flex items-center justify-between">
                      <div>
                        <div className="text-gray-900">{a.filename}</div>
                        <div className="text-xs text-gray-500">Uploaded by {a.uploadedBy} · {new Date(a.uploadedAt).toLocaleString()}</div>
                      </div>
                      <a href={a.path} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">View</a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {user && canAssignTasks() && (
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">Assign</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <UserSelector
                        token={token || ''}
                        userRole={user.role}
                        userDepartmentId={user.departmentId}
                        placeholder="Select assignee..."
                        resetTrigger={assigneeResetTick}
                        onUserSelect={(u) => setSelectedAssigneeId(u.id)}
                      />
                    </div>
                    <button
                      type="button"
                      className="px-3 py-2 text-sm rounded bg-blue-600 text-white disabled:opacity-50"
                      disabled={!selectedAssigneeId}
                      onClick={async () => {
                        if (!token || !selectedAssigneeId) return;
                        const trimmed = selectedAssigneeId.trim();
                        if (!trimmed) return;
                        const res = await taskService.assignTask(token, task.id, { assigneeId: trimmed });
                        if (res?.data) setTask(res.data);
                        else {
                          const ref = await taskService.getTaskById(token, task.id);
                          if (ref?.data) setTask(ref.data);
                        }
                        setSelectedAssigneeId('');
                        setAssigneeResetTick((t) => t + 1);
                      }}
                    >
                      Assign
                    </button>
                  </div>
              </div>
              )}
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">Add collaborator</div>
                {user && (
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <UserSelector
                        token={token || ''}
                        userRole={user.role}
                        userDepartmentId={user.departmentId}
                        placeholder="Select collaborator..."
                        resetTrigger={collabResetTick}
                        onUserSelect={(u) => setSelectedCollaboratorId(u.id)}
                      />
                    </div>
                    <button
                      type="button"
                      className="px-3 py-2 text-sm rounded bg-gray-900 text-white disabled:opacity-50"
                      disabled={!selectedCollaboratorId || addingCollaborator}
                      onClick={async () => {
                        if (!token || !selectedCollaboratorId || addingCollaborator) return;
                        setAddingCollaborator(true);
                        try {
                          const trimmed = selectedCollaboratorId.trim();
                          if (!trimmed) return;
                          const current = task.collaborators || [];
                          const res = await taskService.updateTask(token, task.id, { collaborators: Array.from(new Set([...current, trimmed])) });
                          if (res?.status === 'success' && res?.data) {
                            setTask(res.data);
                          } else {
                            const ref = await taskService.getTaskById(token, task.id);
                            if (ref?.data) setTask(ref.data);
                            if (!res || res.status !== 'success') {
                              alert(res?.message || 'Failed to add collaborator');
                            }
                          }
                          setSelectedCollaboratorId('');
                          setCollabResetTick((t) => t + 1);
                        } catch (e) {
                          alert(e instanceof Error ? e.message : 'Failed to add collaborator');
                        } finally {
                          setAddingCollaborator(false);
                        }
                      }}
                    >
                      {addingCollaborator ? 'Adding...' : 'Add'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6">
              <div className="font-medium text-gray-800 mb-2">Subtasks</div>
              <SubtaskList
                token={token || ''}
                parentTaskId={task.id}
                subtasks={subtasks}
                onSubtasksUpdated={setSubtasks}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}


