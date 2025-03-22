import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import AppProviders from './providers/AppProviders'
import { AuthProvider } from './contexts/AuthContext'
import { TasksProvider } from './contexts/TasksContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <AppProviders>
    <AuthProvider>
      <TasksProvider>
        <App />
      </TasksProvider>
    </AuthProvider>
  </AppProviders>
)
