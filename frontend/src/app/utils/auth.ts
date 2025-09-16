export const checkAuth = () => {
  const token = localStorage.getItem('token');
  return { isAuthenticated: !!token };
};

export const logout = () => {
  localStorage.removeItem('token');
};