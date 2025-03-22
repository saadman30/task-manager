import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/login';
import TasksPage from './pages/tasks';
import { useAuth } from './contexts/AuthContext';
import './App.css'

function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function PublicRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? children : <Navigate to="/tasks" />;
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/tasks"
        element={
          <PrivateRoute>
            <TasksPage />
          </PrivateRoute>
        }
      />
      <Route path="/" element={<Navigate to="/tasks" />} />
    </Routes>
  );
}
