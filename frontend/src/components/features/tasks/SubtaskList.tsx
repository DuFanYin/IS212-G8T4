'use client';

import React from 'react';
import type { Subtask } from '@/lib/types/subtask';
import { subtaskService } from '@/lib/services/subtask';

interface SubtaskListProps {
  token: string;
  parentTaskId: string;
  subtasks: Subtask[];
  onSubtasksUpdated: (subtasks: Subtask[]) => void;
}

export function SubtaskList({ token, parentTaskId, subtasks, onSubtasksUpdated }: SubtaskListProps) {
  if (!subtasks || subtasks.length === 0) {
    return <div className="text-sm text-gray-500">No subtasks.</div>;
  }

  return (
    <div className="divide-y">
      {subtasks.map((s) => (
        <div key={s.id} className="py-3 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="font-medium text-gray-900 truncate">{s.title}</div>
            {s.description && <div className="text-sm text-gray-600 truncate">{s.description}</div>}
            <div className="text-xs text-gray-500 mt-1">Due: {new Date(s.dueDate).toLocaleString()}</div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <select
              value={s.status}
              onChange={async (e) => {
                const newStatus = e.target.value as unknown as import('@/lib/types/subtask').SubtaskStatus;
                const res = await subtaskService.updateStatus(token, s.id, newStatus);
                if (res?.status === 'success' && res.data) {
                  onSubtasksUpdated(subtasks.map((x) => x.id === s.id ? { ...x, status: newStatus } : x));
                } else {
                  const refreshed = await subtaskService.getByParentTask(token, parentTaskId);
                  if (refreshed?.data) onSubtasksUpdated(refreshed.data);
                }
              }}
              className="px-2 py-1 rounded text-xs border border-gray-300 bg-white text-gray-700"
            >
              <option value="unassigned">Unassigned</option>
              <option value="ongoing">Ongoing</option>
              <option value="under_review">Under Review</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      ))}
    </div>
  );
}


