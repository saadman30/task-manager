import { useState, useEffect } from 'react'
import TaskList from './components/TaskList'
import TaskForm from './components/TaskForm'
import TaskFilters from './components/TaskFilters'
import Login from './components/Login'
import { TaskAPI } from './services/api'
import './App.css'

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
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto py-8 px-4">
        <header className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Task Manager</h1>
              {user && (
                <p className="text-sm text-gray-600 mt-1">
                  Welcome, {user.name || user.email}
                </p>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Logout
            </button>
          </div>
          <TaskFilters
            onSearch={setSearchTerm}
            onSort={setSortBy}
            onFilter={setFilterStatus}
          />
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <TaskList
              searchTerm={searchTerm}
              sortBy={sortBy}
              filterStatus={filterStatus}
            />
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-4">Add New Task</h2>
            <TaskForm />
          </div>
        </div>
      </div>
    </div>
  )
}
