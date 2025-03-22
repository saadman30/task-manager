import { useState, useMemo } from 'react';
import { useTasks } from '../contexts/TasksContext';

export function useTaskFilters(initialFilters = {}) {
  const { tasks, filterTasks } = useTasks();
  const [filters, setFilters] = useState({
    searchTerm: '',
    status: 'All',
    sortBy: '',
    ...initialFilters
  });

  const filteredTasks = useMemo(() => {
    return filterTasks(tasks, filters);
  }, [tasks, filters, filterTasks]);

  const updateFilters = (newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
  };

  const resetFilters = () => {
    setFilters({
      searchTerm: '',
      status: 'All',
      sortBy: ''
    });
  };

  return {
    filters,
    filteredTasks,
    updateFilters,
    resetFilters
  };
} 