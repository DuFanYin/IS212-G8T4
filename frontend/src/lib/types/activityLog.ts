export interface ActivityLog {
  id: string;
  taskId: string;
  userId: string;
  action: string;
  details: {
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLogResponse {
  status: string;
  data: ActivityLog[];
  message?: string;
}

export interface GetActivityLogsRequest {
  resourceId?: string;
}
