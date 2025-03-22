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
    console.error('Error getting CSRF token:', error);
    throw error;
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
        throw new Error('Invalid response from server');
      }
      
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(user));
      
      return { access_token, user };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  logout: async () => {
    try {
      await api.post('/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
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

      const data = await api.get('/tasks', { 
        params: queryParams,
        paramsSerializer: {
          indexes: null
        }
      });

      console.log('Tasks API response:', data);
      if (Array.isArray(data)) {
        return data;
      } else if (data && Array.isArray(data.data)) {
        return data.data;
      } else {
        console.warn('Unexpected tasks response format:', data);
        return [];
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      return [];
    }
  },

  createTask: async (taskData) => {
    const data = await api.post('/tasks', taskData);
    return data;
  },

  updateTask: async (taskId, taskData) => {
    try {
      console.log('API updateTask called with:', { taskId, taskData });
      if (!taskId || typeof taskId !== 'number') {
        throw new Error(`Invalid taskId: ${taskId}`);
      }
      const data = await api.put(`/tasks/${taskId}`, taskData);
      console.log('Task update response:', data);
      return data;
    } catch (error) {
      console.error('Task update failed:', error);
      throw error;
    }
  },

  deleteTask: async (taskId) => {
    const data = await api.delete(`/tasks/${taskId}`);
    return data;
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