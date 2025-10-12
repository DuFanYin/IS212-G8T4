export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'unassigned' | 'ongoing' | 'under_review' | 'completed';
  priority: number;
  dueDate: string;
  createdBy: string;
  createdByName?: string;
  assigneeId?: string;
  projectId?: string;
  collaborators: string[];
  attachments: TaskAttachment[];
  // Enriched fields from backend
  projectName?: string;
  assigneeName?: string;
  collaboratorNames?: string[];
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
  _id?: string;
  filename: string;
  path: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface CreateTaskRequest {
  title: string;
  description: string;
  dueDate: string;
  priority?: number;
  assigneeId?: string;
  projectId?: string;
  collaborators?: string[];
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  dueDate?: string;
  priority?: number;
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
