import { useState, useEffect } from 'react';
import type { Task } from '@/lib/types/task';

interface AssignTaskModalProps {
  isOpen: boolean;
  task: Task | null;
  onClose: () => void;
  onAssign: (assigneeId: string) => Promise<void>;
}

export const AssignTaskModal = ({ isOpen, task, onClose, onAssign }: AssignTaskModalProps) => {
  const [assigneeId, setAssigneeId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (task?.assigneeId) {
      setAssigneeId(task.assigneeId);
    } else {
      setAssigneeId('');
    }
  }, [task]);

  if (!isOpen || !task) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!assigneeId.trim()) {
      setError('Assignee ID is required');
      return;
    }
    try {
      setLoading(true);
      await onAssign(assigneeId.trim());
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-bold mb-4">Assign Task</h2>
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="assigneeId" className="block text-sm font-medium text-gray-700 mb-2">
              Assignee ID
            </label>
            <input
              id="assigneeId"
              type="text"
              name="assigneeId"
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              placeholder="User ID to assign"
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
              {loading ? 'Assigning...' : 'Assign Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


