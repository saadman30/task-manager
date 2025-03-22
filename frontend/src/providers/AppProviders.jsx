import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { BrowserRouter } from 'react-router-dom';

// Create QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 1,
      refetchOnMount: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

export default function AppProviders({ children }) {
  return (
    <React.StrictMode>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <DndProvider backend={HTML5Backend}>
            {children}
          </DndProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </React.StrictMode>
  );
} 