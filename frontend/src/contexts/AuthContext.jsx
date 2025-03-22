import React, { createContext, useContext, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { showToast } from '../components/ui/Toast';
import { TaskAPI } from '../services/api';
import { ROUTES } from '../config/routes';

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
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const login = useCallback(async (email, password) => {
    try {
      setIsLoading(true);
      const response = await TaskAPI.login({ email, password });
      setUser(response.user);
      queryClient.invalidateQueries(['tasks']);
      navigate(ROUTES.TASKS);
      showToast.success('Welcome back!');
      return { success: true };
    } catch (error) {
      showToast.error(error, 'login');
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed'
      };
    } finally {
      setIsLoading(false);
    }
  }, [navigate, queryClient]);

  const logout = useCallback(async () => {
    try {
      await TaskAPI.logout();
      showToast.success('Logged out successfully');
    } catch (error) {
      showToast.warning('Error during logout, clearing session anyway');
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      queryClient.clear();
      navigate(ROUTES.LOGIN);
    }
  }, [navigate, queryClient]);

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
} 