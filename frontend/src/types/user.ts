export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  status: string;
  data: {
    token: string;
    user: User;
  };
}
