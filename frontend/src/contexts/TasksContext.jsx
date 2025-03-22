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
    error
  } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const response = await TaskAPI.getTasks();
      return response.data;
    }
  });

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: async (newTask) => {
      const response = await TaskAPI.createTask(newTask);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks']);
    }
  });

  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, updates }) => {
      const response = await TaskAPI.updateTask(id, updates);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks']);
    }
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: async (id) => {
      await TaskAPI.deleteTask(id);
      return id;
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
    tasks,
    isLoading,
    error,
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