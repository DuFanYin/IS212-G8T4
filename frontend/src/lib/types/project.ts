export interface Collaborator {
  user: string;
  role: 'viewer' | 'editor';
  assignedBy?: string;
  assignedAt?: string;
}

export interface Project {
  id?: string;
  _id?: string;
  name: string;
  description?: string;
  isArchived?: boolean;
  deadline?: string | null;
  hasContainedTasks?: boolean;
  // Additional fields provided by backend
  ownerId?: string;
  departmentId?: string;
  departmentName?: string;
  collaborators?: Collaborator[] | string[]; // Support both old and new format
  isOverdue?: boolean;
  createdAt?: string;
  updatedAt?: string;
  // Enriched fields from backend
  ownerName?: string;
  collaboratorNames?: string[];
}

export interface ProjectResponse {
  status: string;
  data: Project;
  message?: string;
}

export interface ProjectsResponse {
  status: string;
  data: Project[];
  message?: string;
}


