import axios from 'axios';

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

// Interceptor to handle 401 responses
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

// Function to get CSRF token
const getCsrfToken = async () => {
  try {
    await axios.get('http://localhost:8000/sanctum/csrf-cookie', {
      withCredentials: true,
    });
  } catch (error) {
    console.error('Error getting CSRF token:', error);
    throw error;
  }
};

export const TaskAPI = {
  // Initialize API by getting CSRF token and checking session
  init: async () => {
    try {
      await getCsrfToken();
      console.log('CSRF token obtained successfully');
      return true;
    } catch (error) {
      console.error('Init error:', error);
      throw error;
    }
  },

  // Authentication methods
  login: async (credentials) => {
    try {
      await getCsrfToken();
      const response = await api.post('/login', credentials);
      const { access_token, user } = response.data;
      
      if (!access_token || !user) {
        throw new Error('Invalid response from server');
      }
      
      // Store authentication data
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(user));
      
      return {
        token: access_token,
        user: user
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  logout: async () => {
    try {
      await api.post('/logout');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local storage even if API call fails
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      throw error;
    }
  },

  // Check if user is authenticated
  checkAuth: async () => {
    try {
      const response = await api.get('/user');
      if (response.data) {
        localStorage.setItem('user', JSON.stringify(response.data));
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('Auth check error:', error);
      return null;
    }
  },

  getAllTasks: async (params = {}) => {
    try {
      console.log('Fetching tasks with params:', params);
      const queryParams = {
        search: params.search || '',
        sort: params.sort || '',
        status: params.status || '',
      };

      const response = await api.get('/tasks', { 
        params: queryParams,
        paramsSerializer: {
          indexes: null // This will serialize arrays with the same key
        }
      });

      console.log('Tasks API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  },

  createTask: async (taskData) => {
    try {
      const response = await api.post('/tasks', taskData);
      return response.data;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  },

  updateTask: async (taskId, taskData) => {
    try {
      const response = await api.put(`/tasks/${taskId}`, taskData);
      return response.data;
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  },

  deleteTask: async (taskId) => {
    try {
      const response = await api.delete(`/tasks/${taskId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  },

  updateTaskOrder: async (taskId, data) => {
    try {
      const response = await api.patch(`/tasks/${taskId}/order`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating task order:', error);
      throw error;
    }
  },
};

export default api; 