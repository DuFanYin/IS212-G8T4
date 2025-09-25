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

export interface UserResponse {
  status: string;
  data: User;
  message?: string;
}

export interface UsersResponse {
  status: string;
  data: User[];
  message?: string;
}

export interface PasswordResetTokenResponse {
  status: string;
  data: { resetToken: string };
  message?: string;
}

export interface BasicResponse {
  status: string;
  message?: string;
}
