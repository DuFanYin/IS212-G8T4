export type SubtaskStatus = 'unassigned' | 'ongoing' | 'under_review' | 'completed';

export interface Subtask {
  id: string;
  title: string;
  description?: string;
  dueDate: string;
  status: SubtaskStatus;
  assigneeId?: string;
  collaborators?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface SubtaskResponse {
  status: string;
  data: Subtask;
  message?: string;
}

export interface SubtasksResponse {
  status: string;
  data: Subtask[];
  message?: string;
}


