import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDrop } from 'react-dnd';
import { TaskAPI } from '../services/api';
import AppLayout from '../components/layout/AppLayout';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';
import TaskCard from '../components/TaskCard';
import { useDebouncedValue } from '../hooks/useDebounce';

const TASK_STATUSES = [
  { value: '', label: 'All' },
  { value: 'To Do', label: 'To Do' },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'Done', label: 'Done' },
];

const SORT_OPTIONS = [
  { value: '', label: 'None' },
  { value: 'name_asc', label: 'Name (A-Z)' },
  { value: 'name_desc', label: 'Name (Z-A)' },
  { value: 'due_date_asc', label: 'Due Date (Ascending)' },
  { value: 'due_date_desc', label: 'Due Date (Descending)' },
  { value: 'created_at_desc', label: 'Recently Created' },
  { value: 'created_at_asc', label: 'Oldest First' },
];

function TaskColumn({ status, tasks, onTaskMove, onTaskDelete }) {
  const [{ isOver }, drop] = useDrop({
    accept: 'TASK',
    drop: (item) => {
      if (item.status !== status) {
        onTaskMove(item.id, { status });
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  return (
    <div
      ref={drop}
      className={`
        bg-white rounded-xl border border-gray-200
        ${isOver ? 'ring-2 ring-blue-500' : ''}
      `}
    >
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">{status}</h3>
        <div className="mt-1">
          <span className="text-sm text-gray-500">
            {tasks.filter(task => task.status === status).length} tasks
          </span>
        </div>
      </div>
      
      <div className="p-4 space-y-4 min-h-[calc(100vh-20rem)] overflow-auto">
        {tasks
          .filter((task) => task.status === status)
          .map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onUpdate={onTaskMove}
              onDelete={onTaskDelete}
            />
          ))}
        {tasks.filter(task => task.status === status).length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">No tasks in this column</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TasksPage() {
  const queryClient = useQueryClient();
  const [searchInput, setSearchInput] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newTask, setNewTask] = useState({
    name: '',
    description: '',
    due_date: '',
    status: 'To Do',
  });

  // Use debounced value for search
  const debouncedSearchTerm = useDebouncedValue(searchInput, 500);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchInput(e.target.value);
  };

  // Fetch tasks
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks', { searchTerm: debouncedSearchTerm, sortBy, filterStatus }],
    queryFn: async () => {
      const response = await TaskAPI.getAllTasks({
        search: debouncedSearchTerm,
        sort: sortBy,
        status: filterStatus,
      });
      return Array.isArray(response) ? response : [];
    },
  });

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: (taskData) => TaskAPI.createTask(taskData),
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks']);
      setNewTask({
        name: '',
        description: '',
        due_date: '',
        status: 'To Do',
      });
      setIsCreating(false);
    },
  });

  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, data }) => TaskAPI.updateTask(taskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks']);
    },
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: (taskId) => TaskAPI.deleteTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks']);
    },
  });

  const handleCreateTask = (e) => {
    e.preventDefault();
    createTaskMutation.mutate(newTask);
  };

  const handleUpdateTask = (taskId, data) => {
    updateTaskMutation.mutate({ taskId, data });
  };

  const handleDeleteTask = (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      deleteTaskMutation.mutate(taskId);
    }
  };

  const handleNewTaskChange = (e) => {
    const { name, value } = e.target;
    setNewTask((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-xl text-gray-600">Loading tasks...</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="h-[calc(100vh-5rem)] flex gap-8">
        {/* Tasks List - Left Side */}
        <div className="flex-grow min-w-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Task Board</h1>
            <p className="mt-2 text-gray-600">
              Manage and organize your tasks across different stages
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {['To Do', 'In Progress', 'Done'].map((status) => (
              <TaskColumn
                key={status}
                status={status}
                tasks={tasks}
                onTaskMove={handleUpdateTask}
                onTaskDelete={handleDeleteTask}
              />
            ))}
          </div>
        </div>

        {/* Controls - Right Side */}
        <div className="w-80 flex flex-col gap-6">
          {/* Filters */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-5 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Filters & Sort
              </h2>
            </div>
            <div className="p-5 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Tasks
                </label>
                <Input
                  value={searchInput}
                  onChange={handleSearchChange}
                  placeholder="Search by name or description..."
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  options={SORT_OPTIONS}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter Status
                </label>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  options={TASK_STATUSES}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Create Task Form */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-5 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">Create New Task</h2>
                {!isCreating && (
                  <Button 
                    onClick={() => setIsCreating(true)}
                    size="sm"
                  >
                    Add Task
                  </Button>
                )}
              </div>
            </div>

            {isCreating && (
              <div className="p-5 space-y-5">
                <Input
                  label="Task Name"
                  name="name"
                  value={newTask.name}
                  onChange={handleNewTaskChange}
                  required
                  placeholder="Enter task name"
                />

                <Input
                  label="Description"
                  name="description"
                  value={newTask.description}
                  onChange={handleNewTaskChange}
                  as="textarea"
                  rows="4"
                  placeholder="Enter task description"
                />

                <Input
                  label="Due Date"
                  type="datetime-local"
                  name="due_date"
                  value={newTask.due_date}
                  onChange={handleNewTaskChange}
                />

                <Select
                  label="Status"
                  name="status"
                  value={newTask.status}
                  onChange={handleNewTaskChange}
                  options={TASK_STATUSES.filter(status => status.value)}
                />

                <div className="flex justify-end space-x-3 pt-3">
                  <Button
                    variant="secondary"
                    onClick={() => setIsCreating(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    onClick={handleCreateTask}
                    isLoading={createTaskMutation.isPending}
                  >
                    Create Task
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
} 