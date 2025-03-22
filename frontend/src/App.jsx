import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/login';
import TasksPage from './pages/tasks';
import { useAuth } from './contexts/AuthContext';
import { ROUTES } from './config/routes';
import './App.css'

function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to={ROUTES.LOGIN} />;
}

function PublicRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? children : <Navigate to={ROUTES.TASKS} />;
}

export default function App() {
  return (
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
      <Route path={ROUTES.HOME} element={<Navigate to={ROUTES.TASKS} />} />
    </Routes>
  );
}
