import { useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { showToast } from '../../components/ui/Toast';
import { taskFilterSchema, taskSchema, TASK_VALIDATION } from '../../schemas/task';
import { useTasks } from '../../contexts/TasksContext';
import { useDebouncedValue } from '../../hooks/useDebounce';
import { TASK_STATUS_OPTIONS, TASK_STATUSES } from '../../constants/task';

export const SORT_OPTIONS = [
  { value: 'due_date_asc', label: 'Due Date (Earliest First)' },
  { value: 'due_date_desc', label: 'Due Date (Latest First)' },
];

const defaultFilterValues = {
  searchTerm: '',
  status: TASK_STATUSES.ALL,
  sortBy: 'due_date_asc'
};

const defaultTaskValues = {
  name: '',
  description: '',
  due_date: '',
  status: TASK_STATUSES.TODO,
};

export const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

export function useTasksLogic() {
  const { tasks, isLoading, createTask, updateTask, deleteTask } = useTasks();

  // Form handling for filters
  const {
    watch: watchFilters,
    setValue: setFilterValue,
    getValues: getFilterValues,
    formState: { isSubmitting: isFilterSubmitting }
  } = useForm({
    resolver: zodResolver(taskFilterSchema),
    defaultValues: defaultFilterValues,
    mode: 'onChange'
  });

  // Form handling for task creation
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting: isTaskSubmitting, touchedFields },
    reset,
    watch: watchTaskForm
  } = useForm({
    resolver: zodResolver(taskSchema),
    defaultValues: defaultTaskValues,
    mode: 'onBlur'
  });

  const { searchTerm, status, sortBy } = watchFilters();
  const debouncedSearchTerm = useDebouncedValue(searchTerm, 300);

  // Watch values for character count
  const nameValue = watchTaskForm('name');
  const descriptionValue = watchTaskForm('description');

  // Get helper text (character count for text fields)
  const getHelperText = useCallback((fieldName) => {
    switch (fieldName) {
      case 'name':
        return `${nameValue?.length || 0}/${TASK_VALIDATION.NAME.MAX} characters`;
      case 'description':
        return descriptionValue ? `${descriptionValue.length}/${TASK_VALIDATION.DESCRIPTION.MAX} characters` : '';
      default:
        return '';
    }
  }, [nameValue, descriptionValue]);

  // Memoized filtered and sorted tasks
  const { filteredTasks, sortedTasks, groupedTasks } = useMemo(() => {
    // Filter tasks
    const filtered = tasks?.filter(task => {
      if (!task) return false;

      const searchLower = debouncedSearchTerm?.toLowerCase() || '';
      const matchesSearch = !debouncedSearchTerm || 
        (task.name || '').toLowerCase().includes(searchLower) ||
        (task.description || '').toLowerCase().includes(searchLower);
      
      const matchesStatus = status === TASK_STATUSES.ALL || task.status === status;
      
      return matchesSearch && matchesStatus;
    }) || [];

    // Sort tasks
    const sorted = [...filtered].sort((a, b) => {
      if (!a?.due_date) return 1;
      if (!b?.due_date) return -1;
      const dateA = new Date(a.due_date);
      const dateB = new Date(b.due_date);
      return sortBy === 'due_date_asc' ? dateA - dateB : dateB - dateA;
    });

    // Group tasks
    const grouped = sorted.reduce((acc, task) => {
      if (!task?.status) return acc;
      if (!acc[task.status]) {
        acc[task.status] = [];
      }
      acc[task.status].push(task);
      return acc;
    }, {});

    return { filteredTasks: filtered, sortedTasks: sorted, groupedTasks: grouped };
  }, [tasks, debouncedSearchTerm, status, sortBy]);

  // Event handlers for filters
  const handleSearchChange = useCallback((e) => {
    const value = e.target.value || '';
    setFilterValue('searchTerm', value);
  }, [setFilterValue]);

  const handleStatusChange = useCallback((e) => {
    setFilterValue('status', e.target.value);
  }, [setFilterValue]);

  const handleSortChange = useCallback((e) => {
    setFilterValue('sortBy', e.target.value);
  }, [setFilterValue]);

  // Event handler for task creation
  const handleCreateTask = useCallback(async (data) => {
    try {
      await createTask(data);
      showToast.success('Task created successfully');
      reset(defaultTaskValues);
      return true;
    } catch (error) {
      showToast.error(error, 'create task');
      return false;
    }
  }, [createTask, reset]);

  const handleUpdateTask = useCallback(async (taskId, updates) => {
    try {
      await updateTask(taskId, updates);
      showToast.success('Task updated successfully');
      return true;
    } catch (error) {
      showToast.error(error, 'update task');
      return false;
    }
  }, [updateTask]);

  const handleDeleteTask = useCallback(async (taskId) => {
    try {
      await deleteTask(taskId);
      showToast.success('Task deleted successfully');
      return true;
    } catch (error) {
      showToast.error(error, 'delete task');
      return false;
    }
  }, [deleteTask]);

  return {
    // Form handling
    formRegister: register,
    formErrors: errors,
    touchedFields,
    isTaskSubmitting,
    onSubmit: handleSubmit(handleCreateTask),
    getHelperText,

    // Filter state and handlers
    searchTerm: getFilterValues().searchTerm,
    status,
    sortBy,
    onSearchChange: handleSearchChange,
    onStatusChange: handleStatusChange,
    onSortChange: handleSortChange,
    isFilterSubmitting,

    // Task operations
    groupedTasks,
    onUpdateTask: handleUpdateTask,
    onDeleteTask: handleDeleteTask,
    isLoading,
  };
} 