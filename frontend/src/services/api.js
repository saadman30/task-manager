import axios from 'axios';
import { handleError, AppError, ErrorSeverity } from '../utils/errorHandler';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // This is important for handling cookies/session
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor to handle responses
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error);
  }
);

// Function to get CSRF token
const getCsrfToken = async () => {
  try {
    await axios.get('http://localhost:8000/sanctum/csrf-cookie', {
      withCredentials: true,
    });
  } catch (error) {
    handleError(error, 'getCsrfToken');
    throw new AppError('Failed to get CSRF token', ErrorSeverity.CRITICAL);
  }
};

export const TaskAPI = {
  // Authentication methods
  login: async (credentials) => {
    try {
      await getCsrfToken();
      const response = await api.post('/login', credentials);
      const { access_token, user } = response;
      
      if (!access_token || !user) {
        throw new AppError('Invalid response from server', ErrorSeverity.ERROR);
      }
      
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(user));
      
      return { access_token, user };
    } catch (error) {
      handleError(error, 'login');
      throw error;
    }
  },

  logout: async () => {
    try {
      await api.post('/logout');
    } catch (error) {
      handleError(error, 'logout');
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  getAllTasks: async (params = {}) => {
    try {
      const queryParams = {
        search: params.search || '',
        sort: params.sort || '',
        status: params.status || '',
      };

      const data = await api.get('/tasks', { 
        params: queryParams,
        paramsSerializer: {
          indexes: null
        }
      });

      if (Array.isArray(data)) {
        return data;
      } else if (data && Array.isArray(data.data)) {
        return data.data;
      } else {
        throw new AppError('Unexpected tasks response format', ErrorSeverity.WARNING);
      }
    } catch (error) {
      handleError(error, 'getAllTasks');
      return [];
    }
  },

  createTask: async (taskData) => {
    try {
      const data = await api.post('/tasks', taskData);
      return data;
    } catch (error) {
      handleError(error, 'createTask');
      throw error;
    }
  },

  updateTask: async (taskId, taskData) => {
    try {
      if (!taskId) {
        throw new AppError('Invalid taskId provided', ErrorSeverity.ERROR);
      }
      
      const id = typeof taskId === 'string' ? parseInt(taskId, 10) : taskId;
      
      const data = await api.put(`/tasks/${id}`, {
        name: taskData.name,
        description: taskData.description,
        status: taskData.status,
        due_date: taskData.due_date
      });
      
      return data;
    } catch (error) {
      handleError(error, 'updateTask');
      throw error;
    }
  },

  deleteTask: async (taskId) => {
    try {
      const data = await api.delete(`/tasks/${taskId}`);
      return data;
    } catch (error) {
      handleError(error, 'deleteTask');
      throw error;
    }
  },

  updateTaskOrder: async (taskId, data) => {
    try {
      const response = await api.patch(`/tasks/${taskId}/order`, data);
      return response.data;
    } catch (error) {
      handleError(error, 'updateTaskOrder');
      throw error;
    }
  },
};

export default api; 