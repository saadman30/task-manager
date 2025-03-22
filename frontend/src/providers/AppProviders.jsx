import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import { TasksProvider } from '../contexts/TasksContext';

// Create QueryClient instance with optimized configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0, // Always fetch fresh data
      cacheTime: 1000 * 60 * 5, // 5 minutes cache
      refetchOnWindowFocus: true,
      refetchOnMount: 'always',
      refetchOnReconnect: 'always',
      retry: 1,
      suspense: false,
      networkMode: 'online',
      refetchInterval: false,
      keepPreviousData: false, // Don't keep previous data between user changes
    },
    mutations: {
      retry: 1,
      networkMode: 'online',
    },
  },
});

// Add global error handler
queryClient.setDefaultOptions({
  mutations: {
    onError: (error) => {
      console.error('Mutation error:', error);
    },
  },
  queries: {
    onError: (error) => {
      console.error('Query error:', error);
    },
  },
});

export default function AppProviders({ children }) {
  return (
    <React.StrictMode>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <DndProvider backend={HTML5Backend}>
            <AuthProvider>
              <TasksProvider>
                {children}
              </TasksProvider>
            </AuthProvider>
          </DndProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </React.StrictMode>
  );
} 