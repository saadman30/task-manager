import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { ROUTES } from './config/routes';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css'

// Lazy load pages
const LoginPage = lazy(() => import('./pages/login'));
const TasksPage = lazy(() => import('./pages/tasks/TasksPage'));

function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to={ROUTES.LOGIN} />;
}

function PublicRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? children : <Navigate to={ROUTES.TASKS} />;
}

// Loading Fallback Component
function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route
            path={ROUTES.LOGIN}
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path={ROUTES.TASKS}
            element={
              <PrivateRoute>
                <TasksPage />
              </PrivateRoute>
            }
          />
          <Route path="/" element={<Navigate to={ROUTES.TASKS} replace />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
