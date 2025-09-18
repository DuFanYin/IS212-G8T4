export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  teamId?: string;
  departmentId?: string;
}

export interface AuthResponse {
  status: string;
  data: {
    token: string;
    user: User;
  };
}
