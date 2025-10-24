import { useEffect, useState } from 'react';
import type { Task, UpdateTaskRequest } from '@/lib/types/task';

interface EditTaskModalProps {
  isOpen: boolean;
  task: Task | null;
  onClose: () => void;
  onUpdate: (data: UpdateTaskRequest) => Promise<void>;
}

export const EditTaskModal = ({ isOpen, task, onClose, onUpdate }: EditTaskModalProps) => {
  const [formData, setFormData] = useState<UpdateTaskRequest>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description,
        dueDate: task.dueDate,
        priority: task.priority,
        collaborators: task.collaborators,
        recurringInterval: task.recurringInterval === undefined ? undefined : task.recurringInterval
      });
    } else {
      setFormData({});
    }
  }, [task]);

  if (!isOpen || !task) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'priority'
        ? parseInt(value) || 5
        : name === 'recurringInterval'
          ? value === '' ? undefined : parseInt(value)
          : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      setLoading(true);
      const payload: UpdateTaskRequest = {
        ...(formData.title && formData.title.trim() ? { title: formData.title.trim() } : {}),
        ...(typeof formData.description === 'string' ? { description: formData.description } : {}),
        ...(formData.dueDate ? { dueDate: new Date(formData.dueDate).toISOString() } : {}),
        ...(typeof formData.priority === 'number' ? { priority: formData.priority } : {}),
        ...(Array.isArray(formData.collaborators) ? { collaborators: formData.collaborators } : {}),
        ...(typeof formData.recurringInterval === 'number' ? { recurringInterval: formData.recurringInterval } : {})
      };
      await onUpdate(payload);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-bold mb-4">Edit Task</h2>
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              id="title"
              type="text"
              name="title"
              value={formData.title || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-2">
              Due Date
            </label>
            <input
              id="dueDate"
              type="date"
              name="dueDate"
              value={formData.dueDate ? formData.dueDate.substring(0, 10) : ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <select
              id="priority"
              name="priority"
              value={formData.priority || task.priority || 5}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                <option key={num} value={num}>{num} {num === 1 ? '(Lowest)' : num === 10 ? '(Highest)' : ''}</option>
              ))}
            </select>
          </div>
          <div className="mb-6">
            <label htmlFor="recurringInterval" className="block text-sm font-medium text-gray-700 mb-2">
              Recurring Interval (days)
            </label>
            <input
              id="recurringInterval"
              type="number"
              name="recurringInterval"
              min={1}
              value={formData.recurringInterval === undefined ? '' : formData.recurringInterval}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


