import { useState, useEffect } from 'react';
import type { Project } from '@/lib/types/project';

interface EditProjectModalProps {
  isOpen: boolean;
  project: Project | null;
  onClose: () => void;
  onSave: (id: string, data: { name?: string; description?: string; deadline?: string }) => Promise<void>;
}

export const EditProjectModal = ({ isOpen, project, onClose, onSave }: EditProjectModalProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (project) {
      setName(project.name || '');
      setDescription(project.description || '');
      setDeadline(project.deadline ? project.deadline.substring(0,10) : '');
    }
  }, [project]);

  if (!isOpen || !project) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      setLoading(true);
      const id = (project.id || project._id) as string;
      const isoDeadline = deadline ? new Date(deadline).toISOString() : undefined;
      await onSave(id, { name: name || undefined, description: description || undefined, deadline: isoDeadline });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white rounded p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">Edit Project</h2>
        {error && <div className="mb-3 p-2 bg-red-100 text-red-700 rounded">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
          <input className="w-full border rounded p-2" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
          <input className="w-full border rounded p-2" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
          <label htmlFor="deadline" className="block text-sm font-medium text-gray-700">Due Date</label>
          <input className="w-full border rounded p-2" type="date" value={deadline} min={today} onChange={(e) => setDeadline(e.target.value)} />
          <div className="flex justify-end space-x-2 pt-2">
            <button type="button" onClick={onClose} className="px-3 py-2 rounded bg-gray-100 hover:bg-gray-200">Cancel</button>
            <button type="submit" disabled={loading} className="px-3 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50">{loading ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};


