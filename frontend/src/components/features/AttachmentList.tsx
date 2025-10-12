'use client';

import { useState } from 'react';
import { taskService } from '@/lib/services/task';
import { TaskAttachment } from '@/lib/types/task';

interface AttachmentListProps {
  attachments: TaskAttachment[];
  taskId: string;
  token: string;
  onAttachmentRemoved: (attachmentId: string) => void;
  onError: (error: string) => void;
}

export default function AttachmentList({ attachments, taskId, token, onAttachmentRemoved, onError }: AttachmentListProps) {
  const [removingId, setRemovingId] = useState<string | null>(null);

  const handleRemoveAttachment = async (attachmentId: string) => {
    if (!attachmentId) {
      onError('Invalid attachment ID');
      return;
    }

    setRemovingId(attachmentId);
    try {
      const response = await taskService.removeAttachment(token, taskId, attachmentId);
      if (response.status === 'success') {
        onAttachmentRemoved(attachmentId);
      } else {
        onError(response.message || 'Failed to remove attachment');
      }
    } catch {
      onError('Failed to remove attachment');
    } finally {
      setRemovingId(null);
    }
  };


  const getFileIcon = (filename: string) => {
    const extension = filename.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return '📄';
      case 'docx':
        return '📝';
      case 'xlsx':
        return '📊';
      default:
        return '📎';
    }
  };

  if (attachments.length === 0) {
    return (
      <div className="text-gray-500 text-sm mt-2">
        No attachments
      </div>
    );
  }

  return (
    <div className="mt-4">
      <h4 className="text-sm font-medium text-gray-700 mb-2">Attachments</h4>
      <div className="space-y-2">
        {attachments.map((attachment) => (
          <div key={attachment._id || attachment.filename} className="flex items-center justify-between p-2 bg-gray-50 rounded">
            <div className="flex items-center space-x-2">
              <span className="text-lg">{getFileIcon(attachment.filename)}</span>
              <div>
                <div className="text-sm font-medium">{attachment.filename}</div>
                <div className="text-xs text-gray-500">
                  Uploaded {new Date(attachment.uploadedAt).toLocaleDateString()}
                </div>
              </div>
            </div>
            <button
              onClick={() => handleRemoveAttachment(attachment._id || attachment.filename)}
              disabled={removingId === (attachment._id || attachment.filename)}
              className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {removingId === (attachment._id || attachment.filename) ? 'Removing...' : 'Remove'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
