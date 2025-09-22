'use client';

import { useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { useTasks } from '@/lib/hooks/useTasks';
import { TaskItem } from '@/components/features/tasks/TaskItem';
import { CreateTaskModal } from '@/components/forms/CreateTaskModal';
import type { User } from '@/lib/types/user';
import type { Task, CreateTaskRequest } from '@/lib/types/task';

export default function TasksPage() {
  const { user }: { user: User | null } = useUser();
  const { 
    tasks, 
    loading, 
    error, 
    createTask, 
    updateTaskStatus, 
    archiveTask 
  } = useTasks();
  
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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

  // Check if user can assign tasks (managers and above)
  const canAssignTasks = ['manager', 'director', 'hr', 'sm'].includes(user.role);

  const handleCreateTask = async (taskData: CreateTaskRequest) => {
    await createTask(taskData);
  };

  const handleStatusChange = async (task: Task, newStatus: Task['status']) => {
    try {
      await updateTaskStatus(task.id, { status: newStatus });
    } catch (err) {
      console.error('Failed to update task status:', err);
      alert('Failed to update task status');
    }
  };

  const handleArchiveTask = async (task: Task) => {
    if (confirm(`Are you sure you want to archive "${task.title}"?`)) {
      try {
        await archiveTask(task.id);
      } catch (err) {
        console.error('Failed to archive task:', err);
        alert('Failed to archive task');
      }
    }
  };

  const handleEditTask = () => {
    // TODO: Implement edit modal
    alert('Edit functionality coming soon!');
  };

  const handleAssignTask = () => {
    // TODO: Implement assignment modal
    alert('Assignment functionality coming soon!');
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

          {/* Task List */}
          <div className="bg-white rounded-lg shadow">
            {loading ? (
              <div className="p-8 text-center text-gray-500">
                Loading tasks...
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                {selectedFilter === 'all' 
                  ? 'No tasks found. Create your first task!' 
                  : `No ${selectedFilter.replace('_', ' ')} tasks found.`
                }
              </div>
            ) : (
              <div className="divide-y">
                {filteredTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onEdit={handleEditTask}
                    onAssign={handleAssignTask}
                    onStatusChange={handleStatusChange}
                    onArchive={handleArchiveTask}
                    canAssign={canAssignTasks}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateTask={handleCreateTask}
      />
    </div>
  );
}
