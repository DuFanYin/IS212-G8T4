export const checkAuth = () => {
  if (typeof window === 'undefined') return { isAuthenticated: false };
  
  const token = localStorage.getItem('token');
  return { isAuthenticated: !!token };
};

export const logout = () => {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('token');
  window.location.href = '/login';
};