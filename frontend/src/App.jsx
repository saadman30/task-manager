import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import LoginPage from './pages/LoginPage';
import TasksPage from './pages/TasksPage';
import { useState, useEffect } from 'react'
import TaskList from './components/TaskList'
import TaskForm from './components/TaskForm'
import TaskFilters from './components/TaskFilters'
import Login from './components/Login'
import { TaskAPI } from './services/api'
import './App.css'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
}

function PublicRoute({ children }) {
  const token = localStorage.getItem('token');
  return !token ? children : <Navigate to="/tasks" />;
}

export default function App() {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [isInitialized, setIsInitialized] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [authError, setAuthError] = useState(null)

  // Check authentication status and initialize API
  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('Initializing application...')
        setIsLoading(true)

        // Initialize API (get CSRF token)
        await TaskAPI.init()
        setIsInitialized(true)

        // Check for existing session
        const token = localStorage.getItem('token')
        const savedUser = localStorage.getItem('user')
        
        if (token && savedUser) {
          const userData = await TaskAPI.checkAuth()
          if (userData) {
            console.log('Session verified')
            setUser(userData)
            setIsAuthenticated(true)
          } else {
            console.log('Invalid session')
            handleLogout()
          }
        }

        console.log('Application initialized successfully')
      } catch (error) {
        console.error('Failed to initialize application:', error)
        setAuthError('Failed to initialize application. Please try again.')
        handleLogout()
      } finally {
        setIsLoading(false)
      }
    }

    initializeApp()
  }, []) // Empty dependency array means this runs once on mount

  const handleLogin = async (data) => {
    console.log('Processing login response:', data)
    try {
      if (!data || !data.token || !data.user) {
        throw new Error('Invalid login response')
      }

      setUser(data.user)
      setIsAuthenticated(true)
      setAuthError(null)
      console.log('Authentication state updated successfully')
    } catch (error) {
      console.error('Error handling login:', error)
      setAuthError('Failed to process login. Please try again.')
      handleLogout()
    }
  }

  const handleLogout = async () => {
    console.log('Starting logout process...')
    try {
      if (isAuthenticated) {
        await TaskAPI.logout()
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      setIsAuthenticated(false)
      setUser(null)
      console.log('Logout completed')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    )
  }

  if (authError) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl text-red-600 mb-4">{authError}</div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <QueryClientProvider client={queryClient}>
      <DndProvider backend={HTML5Backend}>
        <Router>
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
        </Router>
      </DndProvider>
    </QueryClientProvider>
  )
}
