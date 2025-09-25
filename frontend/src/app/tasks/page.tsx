'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { useTasks } from '@/lib/hooks/useTasks';
import { TaskItem } from '@/components/features/tasks/TaskItem';
import { CreateTaskModal } from '@/components/forms/CreateTaskModal';
import { AssignTaskModal } from '@/components/forms/AssignTaskModal';
import { EditTaskModal } from '@/components/forms/EditTaskModal';
import type { User } from '@/lib/types/user';
import type { Task, CreateTaskRequest } from '@/lib/types/task';
import { subtaskService } from '@/lib/services/subtask';
import { storage } from '@/lib/utils/storage';

export default function TasksPage() {
  const { user }: { user: User | null } = useUser();
  const router = useRouter();
  const { 
    tasks, 
    loading, 
    error, 
    createTask, 
    assignTask,
    updateTask
  } = useTasks();
  
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const token = storage.getToken();

  // Minimal subtasks demo calls
  const demoCreateSubtask = async () => {
    if (!activeTask || !token) return;
    await subtaskService.create(token, activeTask.id, { title: 'Subtask', dueDate: new Date().toISOString() });
  };
  const demoListSubtasks = async () => {
    if (!activeTask || !token) return;
    await subtaskService.getByParentTask(token, activeTask.id);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  // Filter tasks based on selected filter
  const filteredTasks = tasks.filter(task => {
    if (selectedFilter === 'all') return true;
    return task.status === selectedFilter;
  });

  const handleCreateTask = async (taskData: CreateTaskRequest) => {
    await createTask(taskData);
  };
  
  const handleConfirmAssign = async (assigneeId: string) => {
    if (!activeTask) return;
    try {
      await assignTask(activeTask.id, { assigneeId });
    } catch (err) {
      console.error('Failed to assign task:', err);
      alert('Failed to assign task');
    }
  };
  
  const handleConfirmEdit = async (data: { title?: string; description?: string; dueDate?: string; collaborators?: string[] }) => {
    if (!activeTask) return;
    try {
      await updateTask(activeTask.id, data);
    } catch (err) {
      console.error('Failed to update task:', err);
      alert('Failed to update task');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
              <button 
                onClick={() => setIsCreateModalOpen(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Create New Task
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Filters */}
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <div className="flex space-x-4">
              <button
                onClick={() => setSelectedFilter('all')}
                className={`px-4 py-2 rounded ${
                  selectedFilter === 'all'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                All Tasks ({tasks.length})
              </button>
              <button
                onClick={() => setSelectedFilter('unassigned')}
                className={`px-4 py-2 rounded ${
                  selectedFilter === 'unassigned'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Unassigned ({tasks.filter(t => t.status === 'unassigned').length})
              </button>
              <button
                onClick={() => setSelectedFilter('ongoing')}
                className={`px-4 py-2 rounded ${
                  selectedFilter === 'ongoing'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Ongoing ({tasks.filter(t => t.status === 'ongoing').length})
              </button>
              <button
                onClick={() => setSelectedFilter('under_review')}
                className={`px-4 py-2 rounded ${
                  selectedFilter === 'under_review'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Under Review ({tasks.filter(t => t.status === 'under_review').length})
              </button>
              <button
                onClick={() => setSelectedFilter('completed')}
                className={`px-4 py-2 rounded ${
                  selectedFilter === 'completed'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Completed ({tasks.filter(t => t.status === 'completed').length})
              </button>
            </div>
          </div>

          {/* Task Grid */}
          {loading ? (
            <div className="p-8 text-center text-gray-500 bg-white rounded-lg shadow">Loading tasks...</div>
          ) : filteredTasks.length === 0 ? (
            <div className="p-8 text-center text-gray-500 bg-white rounded-lg shadow">
              {selectedFilter === 'all' 
                ? 'No tasks found. Create your first task!'
                : `No ${selectedFilter.replace('_', ' ')} tasks found.`}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onClick={() => router.push(`/tasks/${task.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateTask={handleCreateTask}
      />

      {/* Assign Task Modal */}
      <AssignTaskModal
        isOpen={isAssignModalOpen}
        task={activeTask}
        onClose={() => { setIsAssignModalOpen(false); setActiveTask(null); }}
        onAssign={async (assigneeId) => { await handleConfirmAssign(assigneeId); }}
      />

      {/* Edit Task Modal */}
      <EditTaskModal
        isOpen={isEditModalOpen}
        task={activeTask}
        onClose={() => { setIsEditModalOpen(false); setActiveTask(null); }}
        onUpdate={async (data) => { await handleConfirmEdit(data); }}
      />

      {/* Subtasks demo buttons - clearly disabled when no active task selected */}
      <div className="fixed bottom-4 right-4 space-x-2">
        <button
          onClick={activeTask ? demoListSubtasks : undefined}
          disabled={!activeTask}
          aria-disabled={!activeTask}
          className={`px-3 py-2 rounded text-sm ${
            activeTask ? 'bg-gray-100 hover:bg-gray-200' : 'bg-gray-100 opacity-50 cursor-not-allowed'
          }`}
          title={!activeTask ? 'Select a task to enable' : undefined}
        >
          List Subtasks
        </button>
        <button
          onClick={activeTask ? demoCreateSubtask : undefined}
          disabled={!activeTask}
          aria-disabled={!activeTask}
          className={`px-3 py-2 rounded text-sm ${
            activeTask ? 'bg-gray-100 hover:bg-gray-200' : 'bg-gray-100 opacity-50 cursor-not-allowed'
          }`}
          title={!activeTask ? 'Select a task to enable' : undefined}
        >
          Create Subtask
        </button>
      </div>
    </div>
  );
}
