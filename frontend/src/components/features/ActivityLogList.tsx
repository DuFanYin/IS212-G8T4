'use client';

import { useState, useEffect } from 'react';
import { activityLogService } from '@/lib/services/activityLog';
import { ActivityLog } from '@/lib/types/activityLog';

interface ActivityLogListProps {
  taskId: string;
  token: string;
  onError: (error: string) => void;
}

export default function ActivityLogList({ taskId, token, onError }: ActivityLogListProps) {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await activityLogService.getActivityLogs(token, { resourceId: taskId });
        if (response.status === 'success') {
          setLogs(response.data);
        } else {
          onError(response.message || 'Failed to fetch activity logs');
        }
      } catch {
        onError('Failed to fetch activity logs');
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [taskId, token, onError]);

  const formatAction = (action: string) => {
    switch (action) {
      case 'created':
        return 'Created task';
      case 'updated':
        return 'Updated task';
      case 'assigned':
        return 'Assigned task';
      case 'status_changed':
        return 'Changed status';
      case 'attachment_added':
        return 'Added attachment';
      case 'attachment_removed':
        return 'Removed attachment';
      default:
        return action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  const formatDetails = (details: Record<string, unknown>) => {
    if (!details) return '';
    
    const { before, after } = details;
    if (before && after) {
      // Show what changed
      const changes = [];
      const beforeObj = before as Record<string, unknown>;
      const afterObj = after as Record<string, unknown>;
      
      if (beforeObj.title !== afterObj.title) {
        changes.push(`Title: "${beforeObj.title}" → "${afterObj.title}"`);
      }
      if (beforeObj.status !== afterObj.status) {
        changes.push(`Status: ${beforeObj.status} → ${afterObj.status}`);
      }
      if (beforeObj.assigneeId !== afterObj.assigneeId) {
        changes.push(`Assignee: ${beforeObj.assigneeId || 'Unassigned'} → ${afterObj.assigneeId || 'Unassigned'}`);
      }
      return changes.join(', ');
    }
    
    return '';
  };

  if (loading) {
    return (
      <div className="mt-4 p-4 bg-gray-50 rounded" data-testid="activity-log-loading">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="mt-4 p-4 bg-gray-50 rounded">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Activity Log</h4>
        <div className="text-gray-500 text-sm">No activity recorded</div>
      </div>
    );
  }

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded">
      <h4 className="text-sm font-medium text-gray-700 mb-3">Activity Log</h4>
      <div className="space-y-3">
        {logs.map((log) => (
          <div key={log.id} className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
            <div className="flex-1 min-w-0">
              <div className="text-sm">
                <span className="font-medium">{formatAction(log.action)}</span>
                {log.details && (
                  <span className="text-gray-600 ml-1">
                    {formatDetails(log.details)}
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {new Date(log.createdAt).toLocaleString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
