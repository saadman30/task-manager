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
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
      refetchOnWindowFocus: true,
      refetchOnMount: 'always',
      refetchOnReconnect: 'always',
      retry: 1,
      suspense: false,
      networkMode: 'online',
      refetchInterval: false,
      keepPreviousData: true,
    },
    mutations: {
      retry: 1,
      networkMode: 'online',
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