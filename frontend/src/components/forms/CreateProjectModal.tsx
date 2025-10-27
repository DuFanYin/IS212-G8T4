import { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import { loadOrgSelectors } from '@/lib/utils/orgAccess';
import type { Department } from '@/lib/services/organization';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: { name: string; description?: string; deadline?: string; departmentId?: string; collaboratorIds?: string[] }) => Promise<void>;
}

export const CreateProjectModal = ({ isOpen, onClose, onCreate }: CreateProjectModalProps) => {
  const { user } = useUser();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState<string>('');
  const [departmentId, setDepartmentId] = useState<string>('');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const today = new Date().toISOString().split('T')[0];

  // Load departments when modal opens
  useEffect(() => {
    if (!isOpen) return;
    const loadDepartments = async () => {
      if (!user?.token) return;
      try {
        const res = await loadOrgSelectors({ token: user.token, user });
        setDepartments(res.departments || []);
        if (user.departmentId) {
          setDepartmentId(user.departmentId);
        }
      } catch (err) {
        console.error('Failed to load departments:', err);
      }
    };
    loadDepartments();
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    try {
      setLoading(true);
      const isoDeadline = deadline ? new Date(deadline).toISOString() : undefined;
      await onCreate({ 
        name, 
        description: description || undefined, 
        deadline: isoDeadline,
        departmentId: departmentId || undefined
      });
      setName(''); 
      setDescription(''); 
      setDeadline('');
      setDepartmentId('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white rounded p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">Create Project</h2>
        {error && <div className="mb-3 p-2 bg-red-100 text-red-700 rounded">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
          <input className="w-full border rounded p-2" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
          <input className="w-full border rounded p-2" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
          {departments.length > 0 && (
            <select className="w-full border rounded p-2" value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}>
              <option value="">Select Department (Optional)</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          )}
          <label htmlFor="deadline" className="block text-sm font-medium text-gray-700">Due Date</label>
          <input id="deadline" className="w-full border rounded p-2" type="date" placeholder="Select a due date" value={deadline} min={today} onChange={(e) => setDeadline(e.target.value)} />
          <div className="flex justify-end space-x-2 pt-2">
            <button type="button" onClick={onClose} className="px-3 py-2 rounded bg-gray-100 hover:bg-gray-200">Cancel</button>
            <button type="submit" disabled={loading} className="px-3 py-2 rounded bg-green-500 text-white hover:bg-green-600 disabled:opacity-50">{loading ? 'Creating...' : 'Create'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};


