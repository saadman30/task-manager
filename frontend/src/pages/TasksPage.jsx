import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDrop } from 'react-dnd';
import { TaskAPI } from '../services/api';
import AppLayout from '../components/layout/AppLayout';
import Input from '../components/ui/Input';
import DebouncedInput from '../components/ui/DebouncedInput';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';
import TaskCard from '../components/TaskCard';

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
      className={`bg-white rounded-lg shadow p-4 h-full overflow-auto ${
        isOver ? 'ring-2 ring-blue-500' : ''
      }`}
    >
      <h3 className="text-lg font-semibold mb-4 sticky top-0 bg-white py-2">{status}</h3>
      <div className="space-y-4">
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
      </div>
    </div>
  );
}

export default function TasksPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newTask, setNewTask] = useState({
    name: '',
    description: '',
    due_date: '',
    status: 'To Do',
  });

  // Fetch tasks
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks', { searchTerm, sortBy, filterStatus }],
    queryFn: async () => {
      const response = await TaskAPI.getAllTasks({
        search: searchTerm,
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
        <div className="flex items-center justify-center h-64">
          <div className="text-xl text-gray-600">Loading tasks...</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="h-[calc(100vh-4rem)] flex gap-4">
        {/* Tasks List - Left Side (2/3) */}
        <div className="flex-grow w-2/3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
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

        {/* Controls - Right Side (1/3) */}
        <div className="w-1/3 space-y-4 overflow-auto">
          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-4">Filters & Sort</h2>
            <div className="space-y-4">
              <DebouncedInput
                label="Search Tasks"
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Search by name or description..."
                debounceMs={500}
              />

              <Select
                label="Sort By"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                options={SORT_OPTIONS}
              />

              <Select
                label="Filter Status"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                options={TASK_STATUSES}
              />
            </div>
          </div>

          {/* Create Task Form */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Create New Task</h2>
              {!isCreating && (
                <Button onClick={() => setIsCreating(true)}>
                  Add New Task
                </Button>
              )}
            </div>

            {isCreating && (
              <form onSubmit={handleCreateTask} className="space-y-4">
                <Input
                  label="Task Name"
                  name="name"
                  value={newTask.name}
                  onChange={handleNewTaskChange}
                  required
                />

                <Input
                  label="Description"
                  name="description"
                  value={newTask.description}
                  onChange={handleNewTaskChange}
                  as="textarea"
                  rows="3"
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

                <div className="flex justify-end space-x-2">
                  <Button
                    variant="secondary"
                    onClick={() => setIsCreating(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    isLoading={createTaskMutation.isPending}
                  >
                    Create Task
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
} 