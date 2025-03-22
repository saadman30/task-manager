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
        
        let taskList = [];
        if (Array.isArray(response)) {
          taskList = response;
        } else if (response && Array.isArray(response.data)) {
          taskList = response.data;
        } else {
          console.warn('Unexpected tasks response format:', response);
          return [];
        }

        // Sort tasks by due date ascending by default
        return taskList.sort((a, b) => {
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          return new Date(a.due_date) - new Date(b.due_date);
        });
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

  // Create task mutation with optimistic update
  const createTaskMutation = useMutation({
    mutationFn: async (taskData) => {
      const response = await TaskAPI.createTask(taskData);
      return response;
    },
    onMutate: async (newTask) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries(['tasks']);

      // Snapshot the previous value
      const previousTasks = queryClient.getQueryData(['tasks']);

      // Optimistically update to the new value
      const optimisticTask = {
        id: `temp-${Date.now()}`, // Temporary ID
        ...newTask,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      queryClient.setQueryData(['tasks'], old => [...(old || []), optimisticTask]);

      // Return a context object with the snapshotted value
      return { previousTasks };
    },
    onError: (err, newTask, context) => {
      queryClient.setQueryData(['tasks'], context.previousTasks);
    },
    onSettled: () => {
      queryClient.invalidateQueries(['tasks']);
    }
  });

  // Update task mutation with optimistic update
  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, updates }) => {
      console.log('Updating task:', taskId, 'with updates:', updates);
      const response = await TaskAPI.updateTask(taskId, updates);
      return response;
    },
    onMutate: async ({ taskId, updates }) => {
      await queryClient.cancelQueries(['tasks']);
      const previousTasks = queryClient.getQueryData(['tasks']);

      queryClient.setQueryData(['tasks'], old => {
        return old?.map(task => 
          task.id === taskId 
            ? { ...task, ...updates, updated_at: new Date().toISOString() }
            : task
        ) || [];
      });

      return { previousTasks };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['tasks'], context.previousTasks);
    },
    onSettled: () => {
      queryClient.invalidateQueries(['tasks']);
    }
  });

  // Delete task mutation with optimistic update
  const deleteTaskMutation = useMutation({
    mutationFn: async (id) => {
      const response = await TaskAPI.deleteTask(id);
      return response;
    },
    onMutate: async (taskId) => {
      await queryClient.cancelQueries(['tasks']);
      const previousTasks = queryClient.getQueryData(['tasks']);

      queryClient.setQueryData(['tasks'], old => 
        old?.filter(task => task.id !== taskId) || []
      );

      return { previousTasks };
    },
    onError: (err, taskId, context) => {
      queryClient.setQueryData(['tasks'], context.previousTasks);
    },
    onSettled: () => {
      queryClient.invalidateQueries(['tasks']);
    }
  });

  // Task operations with optimistic updates
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

  const updateTask = useCallback(async (taskId, updates) => {
    try {
      console.log('updateTask called with:', { taskId, updates });
      await updateTaskMutation.mutateAsync({ taskId, updates });
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

    // Apply sorting (only due date sorting is supported)
    if (sortBy) {
      filteredTasks.sort((a, b) => {
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        const dateA = new Date(a.due_date);
        const dateB = new Date(b.due_date);
        return sortBy === 'due_date_asc' 
          ? dateA - dateB 
          : dateB - dateA;
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