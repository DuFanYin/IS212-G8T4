export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  teamId?: string;
  departmentId?: string;
  token?: string; // Added for useTasks hook
}

export interface AuthResponse {
  status: string;
  data: {
    token: string;
    user: User;
  };
}
