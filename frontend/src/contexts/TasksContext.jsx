import React, { createContext, useContext, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TaskAPI } from '../services/api';

const TasksContext = createContext(null);

export function useTasks() {
  const context = useContext(TasksContext);
  if (!context) {
    throw new Error('useTasks must be used within a TasksProvider');
  }
  return context;
}

export function TasksProvider({ children }) {
  const queryClient = useQueryClient();

  // Fetch tasks
  const {
    data: tasks = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.log('No token found, skipping task fetch');
          return [];
        }

        console.log('Fetching tasks...');
        const response = await TaskAPI.getAllTasks();
        console.log('Tasks fetched successfully:', response);
        
        if (Array.isArray(response)) {
          return response;
        } else if (response && Array.isArray(response.data)) {
          return response.data;
        } else {
          console.warn('Unexpected tasks response format:', response);
          return [];
        }
      } catch (error) {
        console.error('Error fetching tasks:', error);
        throw error;
      }
    },
    enabled: true, // Always enabled, but queryFn checks for token
    staleTime: 0, // Immediately mark data as stale
    cacheTime: 1000 * 60 * 5, // Cache for 5 minutes
    retry: 1,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    initialData: []
  });

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: async (taskData) => {
      const response = await TaskAPI.createTask(taskData);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks']);
    }
  });

  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, updates }) => {
      const response = await TaskAPI.updateTask(id, updates);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks']);
    }
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: async (id) => {
      const response = await TaskAPI.deleteTask(id);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks']);
    }
  });

  // Task operations
  const createTask = useCallback(async (taskData) => {
    try {
      await createTaskMutation.mutateAsync(taskData);
      return { success: true };
    } catch (error) {
      console.error('Create task failed:', error);
      if (error.response?.status === 422) {
        // Validation errors
        const errorMessage = error.response.data.message;
        const errorFields = error.response.data.errors || {};
        
        // If there's a due_date error message in the main message
        if (errorMessage.includes('due date')) {
          return {
            success: false,
            errors: {
              ...errorFields,
              due_date: errorMessage
            }
          };
        }
        
        return {
          success: false,
          errors: errorFields,
          error: errorMessage
        };
      }
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create task'
      };
    }
  }, [createTaskMutation]);

  const updateTask = useCallback(async (id, updates) => {
    try {
      await updateTaskMutation.mutateAsync({ id, updates });
      return { success: true };
    } catch (error) {
      console.error('Update task failed:', error);
      if (error.response?.status === 422) {
        // Validation errors
        return {
          success: false,
          errors: error.response.data.errors || {},
          error: error.response.data.message
        };
      }
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update task'
      };
    }
  }, [updateTaskMutation]);

  const deleteTask = useCallback(async (id) => {
    try {
      await deleteTaskMutation.mutateAsync(id);
      return { success: true };
    } catch (error) {
      console.error('Delete task failed:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete task'
      };
    }
  }, [deleteTaskMutation]);

  // Filter and sort tasks
  const filterTasks = useCallback((tasks, { searchTerm, status, sortBy }) => {
    if (!Array.isArray(tasks)) return [];
    
    let filteredTasks = [...tasks];

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filteredTasks = filteredTasks.filter(task => 
        task.name.toLowerCase().includes(searchLower) ||
        (task.description && task.description.toLowerCase().includes(searchLower))
      );
    }

    // Apply status filter
    if (status && status !== 'All') {
      filteredTasks = filteredTasks.filter(task => task.status === status);
    }

    // Apply sorting
    if (sortBy) {
      filteredTasks.sort((a, b) => {
        switch (sortBy) {
          case 'name':
            return a.name.localeCompare(b.name);
          case 'dueDate':
            if (!a.due_date) return 1;
            if (!b.due_date) return -1;
            return new Date(a.due_date) - new Date(b.due_date);
          case 'status':
            return a.status.localeCompare(b.status);
          default:
            return 0;
        }
      });
    }

    return filteredTasks;
  }, []);

  const value = {
    tasks: Array.isArray(tasks) ? tasks : [],
    isLoading,
    error,
    refetch,
    createTask,
    updateTask,
    deleteTask,
    filterTasks,
    mutations: {
      createTaskMutation,
      updateTaskMutation,
      deleteTaskMutation
    }
  };

  return (
    <TasksContext.Provider value={value}>
      {children}
    </TasksContext.Provider>
  );
} 