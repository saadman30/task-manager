import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TaskAPI } from '../services/api';

const AuthContext = createContext(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check token validity on mount
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setUser(null);
          return;
        }
        
        // Verify token with backend
        await TaskAPI.verifyToken();
        const savedUser = localStorage.getItem('user');
        setUser(savedUser ? JSON.parse(savedUser) : null);
      } catch (error) {
        console.error('Auth verification failed:', error);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const response = await TaskAPI.login({ email, password });
      const { user, token } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      
      navigate('/tasks');
      return { success: true };
    } catch (error) {
      console.error('Login failed:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed'
      };
    }
  }, [navigate]);

  const logout = useCallback(async () => {
    try {
      await TaskAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      navigate('/login');
    }
  }, [navigate]);

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
} 