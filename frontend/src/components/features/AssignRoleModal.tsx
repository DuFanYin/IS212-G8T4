'use client';

import React, { useState } from 'react';
import { projectService } from '@/lib/services/project';
import { useUser } from '@/contexts/UserContext';
import type { Collaborator } from '@/lib/types/project';

interface AssignRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  collaborator: Collaborator;
  onSuccess: () => void;
}

export default function AssignRoleModal({
  isOpen,
  onClose,
  projectId,
  collaborator,
  onSuccess
}: AssignRoleModalProps) {
  const [selectedRole, setSelectedRole] = useState<'viewer' | 'editor'>(collaborator.role);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.token) return;

    setIsLoading(true);
    try {
      await projectService.assignRole(
        user.token,
        projectId,
        collaborator.user,
        selectedRole
      );
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to assign role:', error);
      alert('Failed to assign role. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Assign Role</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Collaborator: {collaborator.user}
            </label>
            
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="role"
                  value="viewer"
                  checked={selectedRole === 'viewer'}
                  onChange={(e) => setSelectedRole(e.target.value as 'viewer')}
                  className="mr-2"
                />
                <span>Viewer - Can view project details and tasks</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="radio"
                  name="role"
                  value="editor"
                  checked={selectedRole === 'editor'}
                  onChange={(e) => setSelectedRole(e.target.value as 'editor')}
                  className="mr-2"
                />
                <span>Editor - Can edit project details and manage tasks</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Assigning...' : 'Assign Role'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
