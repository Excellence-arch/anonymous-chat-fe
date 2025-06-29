import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_BASE_URL =
  process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (identifier: string, password: string) =>
    api.post('/auth/login', { identifier, password }),
  register: (username: string, email: string, password: string) =>
    api.post('/auth/register', { username, email, password }),
};

export const chatAPI = {
  getChats: () => api.get('/chat/chats'),
  getChatHistory: (userId: string, page = 1, limit = 50) =>
    api.get(`/chat/history/${userId}?page=${page}&limit=${limit}`),
  sendMessage: (receiverId: string, content: string) =>
    api.post('/chat/send', { receiverId, content }),
  searchUsers: (query = '') =>
    api.get(
      `/chat/search${query ? `?query=${encodeURIComponent(query)}` : ''}`
    ),
};

export default api;
