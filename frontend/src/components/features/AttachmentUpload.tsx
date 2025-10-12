'use client';

import { useState, useRef } from 'react';
import { taskService } from '@/lib/services/task';
import { TaskAttachment } from '@/lib/types/task';

interface AttachmentUploadProps {
  taskId: string;
  token: string;
  onAttachmentAdded: (attachment: TaskAttachment) => void;
  onError: (error: string) => void;
}

export default function AttachmentUpload({ taskId, token, onAttachmentAdded, onError }: AttachmentUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['.pdf', '.docx', '.xlsx'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!allowedTypes.includes(fileExtension)) {
      onError('Only PDF, DOCX, and XLSX files are allowed');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      onError('File size must be less than 5MB');
      return;
    }

    setIsUploading(true);
    try {
      const response = await taskService.addAttachment(token, taskId, file);
      if (response.status === 'success') {
        // Find the newly added attachment
        const newAttachment = response.data.attachments[response.data.attachments.length - 1];
        onAttachmentAdded(newAttachment);
      } else {
        onError(response.message || 'Failed to upload attachment');
      }
    } catch {
      onError('Failed to upload attachment');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="mt-4">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.xlsx"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isUploading}
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isUploading ? 'Uploading...' : 'Add Attachment'}
      </button>
    </div>
  );
}
