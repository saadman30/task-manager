import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { taskFilterSchema } from '../schemas/task';
import { useTasks } from '../contexts/TasksContext';
import { useDebouncedValue } from '../hooks/useDebounce';
import TaskFilters from '../components/TaskFilters';
import TaskList from '../components/TaskList';
import Button from '../components/ui/Button';
import TaskForm from '../components/TaskForm';
import Modal from '../components/ui/Modal';

const defaultFilterValues = {
  searchTerm: '',
  status: 'All',
  sortBy: 'due_date_asc'
};

export default function TasksPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { tasks, isLoading, createTask, updateTask, deleteTask } = useTasks();

  // Form handling for filters
  const {
    watch,
    setValue,
    formState: { isSubmitting }
  } = useForm({
    resolver: zodResolver(taskFilterSchema),
    defaultValues: defaultFilterValues,
    mode: 'onChange'
  });

  const { searchTerm, status, sortBy } = watch();
  const debouncedSearchTerm = useDebouncedValue(searchTerm, 300);

  // Filter tasks based on current criteria
  const filteredTasks = tasks?.filter(task => {
    if (!task) return false;

    const searchLower = debouncedSearchTerm?.toLowerCase() || '';
    const matchesSearch = !debouncedSearchTerm || 
      (task.name || '').toLowerCase().includes(searchLower) ||
      (task.description || '').toLowerCase().includes(searchLower);
    
    const matchesStatus = status === 'All' || task.status === status;
    
    return matchesSearch && matchesStatus;
  }) || [];

  // Sort tasks
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (!a?.due_date) return 1;
    if (!b?.due_date) return -1;
    const dateA = new Date(a.due_date);
    const dateB = new Date(b.due_date);
    return sortBy === 'due_date_asc' ? dateA - dateB : dateB - dateA;
  });

  // Group tasks by status
  const groupedTasks = sortedTasks.reduce((acc, task) => {
    if (!task?.status) return acc;
    if (!acc[task.status]) {
      acc[task.status] = [];
    }
    acc[task.status].push(task);
    return acc;
  }, {});

  // Event handlers
  const handleSearchChange = (e) => {
    setValue('searchTerm', e.target.value || '');
  };

  const handleStatusChange = (e) => {
    setValue('status', e.target.value);
  };

  const handleSortChange = (e) => {
    setValue('sortBy', e.target.value);
  };

  const handleCreateTask = async (data) => {
    try {
      await createTask(data);
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const handleUpdateTask = async (taskId, updates) => {
    try {
      await updateTask(taskId, updates);
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await deleteTask(taskId);
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Task Management</h1>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          Create New Task
        </Button>
      </div>

      <TaskFilters
        searchTerm={searchTerm}
        status={status}
        sortBy={sortBy}
        onSearchChange={handleSearchChange}
        onStatusChange={handleStatusChange}
        onSortChange={handleSortChange}
        isDisabled={isLoading || isSubmitting}
      />

      <TaskList
        groupedTasks={groupedTasks}
        onUpdateTask={handleUpdateTask}
        onDeleteTask={handleDeleteTask}
        isLoading={isLoading}
      />

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Task"
      >
        <TaskForm onSubmit={handleCreateTask} />
      </Modal>
    </div>
  );
} 