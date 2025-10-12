import { API_URL } from './config';
import { ActivityLogResponse, GetActivityLogsRequest } from '@/lib/types/activityLog';

export const activityLogService = {
  getActivityLogs: async (token: string, filters?: GetActivityLogsRequest): Promise<ActivityLogResponse> => {
    const res = await fetch(`${API_URL}/logs/`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json', 
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify(filters || {}),
    });
    return res.json();
  },
};
