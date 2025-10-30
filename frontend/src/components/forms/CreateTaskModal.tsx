import { useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { CreateTaskRequest } from '@/lib/types/task';
import { User } from '@/lib/types/user';
import { UserSelector } from '@/components/features/users/UserSelector';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTask: (taskData: CreateTaskRequest) => Promise<void>;
}

export const CreateTaskModal = ({ isOpen, onClose, onCreateTask }: CreateTaskModalProps) => {
  const { user } = useUser();
  const [formData, setFormData] = useState<CreateTaskRequest>({
    title: '',
    description: '',
    dueDate: '',
    priority: 5,
    assigneeId: '',
    projectId: '',
    collaborators: [],
    recurringInterval: undefined
  });
  const [selectedAssignee, setSelectedAssignee] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  

  const handleAssigneeSelect = (user: User) => {
    setSelectedAssignee(user);
    setFormData((prev: CreateTaskRequest) => ({
      ...prev,
      assigneeId: user.id
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear any previous errors
    setError(null);
    
    // Validate required fields
    if (!formData.title.trim() || !formData.dueDate) {
      setError('Title and due date are required');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        title: formData.title.trim(),
        description: formData.description || '',
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : '',
        priority: formData.priority || 5,
        recurringInterval: formData.recurringInterval,
        // Only include optional IDs if they are non-empty strings
        ...(formData.assigneeId && formData.assigneeId.trim() !== '' ? { assigneeId: formData.assigneeId.trim() } : {}),
        ...(formData.projectId && formData.projectId.trim() !== '' ? { projectId: formData.projectId.trim() } : {}),
        ...(Array.isArray(formData.collaborators) && formData.collaborators.length > 0 ? { collaborators: formData.collaborators } : {})
      } as CreateTaskRequest;
      await onCreateTask(payload);
      onClose();
      setFormData({
        title: '',
        description: '',
        dueDate: '',
        priority: 5,
        assigneeId: '',
        projectId: '',
        collaborators: [],
        recurringInterval: undefined
      });
      setSelectedAssignee(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: CreateTaskRequest) => ({
      ...prev,
      [name]:
        name === 'priority' ? parseInt(value) || 5  :
        name === 'recurringInterval'
          ? value === '' ? undefined : parseInt(value)
          : value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-bold mb-4">Create New Task</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              id="title"
              type="text"
              name="title"
              value={formData.title}
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
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-2">
              Due Date *
            </label>
            <input
              id="dueDate"
              type="date"
              name="dueDate"
              value={formData.dueDate}
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
              value={formData.priority || 5}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                <option key={num} value={num}>{num} {num === 1 ? '(Lowest)' : num === 10 ? '(Highest)' : ''}</option>
              ))}
            </select>
          </div>
          
          <div className="mb-4">
            <label htmlFor="assigneeId" className="block text-sm font-medium text-gray-700 mb-2">
              Assignee (optional)
            </label>
            {user && user.token ? (
              <UserSelector
                token={user.token}
                userRole={user.role}
                userDepartmentId={user.departmentId}
                onUserSelect={handleAssigneeSelect}
                placeholder={selectedAssignee ? selectedAssignee.name : "Select a user..."}
              />
            ) : (
              <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500">
                User information not available
              </div>
            )}
          </div>
          
          <div className="mb-6">
            <label htmlFor="projectId" className="block text-sm font-medium text-gray-700 mb-2">
              Project ID (optional)
            </label>
            <input
              id="projectId"
              type="text"
              name="projectId"
              value={formData.projectId}
              onChange={handleChange}
              placeholder="Project ID to associate with"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="recurringInterval" className="block text-sm font-medium text-gray-700 mb-2">
              Recurring Interval (in days, optional)
            </label>
            <input
              id="recurringInterval"
              type="number"
              name="recurringInterval"
              value={formData.recurringInterval === undefined ? '' : formData.recurringInterval}
              onChange={handleChange}
              placeholder="Recurring interval in days"
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
              {loading ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
