export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'unassigned' | 'ongoing' | 'under_review' | 'completed';
  dueDate: string;
  createdBy: string;
  assigneeId?: string;
  projectId?: string;
  collaborators: string[];
  attachments: TaskAttachment[];
  lastStatusUpdate?: {
    status: string;
    updatedBy: string;
    updatedAt: string;
  };
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TaskAttachment {
  filename: string;
  path: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface CreateTaskRequest {
  title: string;
  description: string;
  dueDate: string;
  assigneeId?: string;
  projectId?: string;
  collaborators?: string[];
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  dueDate?: string;
  collaborators?: string[];
}

export interface AssignTaskRequest {
  assigneeId: string;
}

export interface UpdateTaskStatusRequest {
  status: 'unassigned' | 'ongoing' | 'under_review' | 'completed';
}

export interface TaskResponse {
  status: string;
  data: Task;
  message?: string;
}

export interface TasksResponse {
  status: string;
  data: Task[];
  message?: string;
}
