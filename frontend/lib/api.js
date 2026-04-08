import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5005/api',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const orgId = localStorage.getItem('activeOrgId');
    if (orgId) config.headers['x-org-id'] = orgId;
  }
  return config;
});

const redirectToLoginIfNeeded = () => {
  if (typeof window === 'undefined') return;

  const authRoutes = ['/login', '/register', '/invite-signup'];
  const currentPath = window.location?.pathname || '';
  if (authRoutes.includes(currentPath)) return;

  if (window.__authRedirecting) return;
  window.__authRedirecting = true;

  localStorage.removeItem('userName');
  localStorage.removeItem('userRole');
  localStorage.removeItem('activeOrgId');
  localStorage.removeItem('orgName');

  window.location.href = '/login';
};

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401 || status === 403) {
      redirectToLoginIfNeeded();
    }
    return Promise.reject(error);
  }
);

export default api;
