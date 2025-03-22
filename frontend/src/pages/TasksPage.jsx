import React, { useState } from 'react';
import { useDrop } from 'react-dnd';
import { Plus, LogOut } from 'lucide-react';
import { useTasks } from '../contexts/TasksContext';
import { useAuth } from '../contexts/AuthContext';
import { useDebouncedValue } from '../hooks/useDebounce';
import TaskCard from '../components/TaskCard';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import TaskDetailsModal from '../components/TaskDetailsModal';
import { TASK_STATUSES, TASK_STATUS_OPTIONS, SORT_OPTIONS, STATUS_STYLES } from '../constants/task';

export default function TasksPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('due_date');
  const debouncedSearch = useDebouncedValue(searchInput, 300);
  const { logout } = useAuth();

  const { tasks, isLoading, error, createTask, updateTask, deleteTask, refetch } = useTasks();

  const filteredTasks = tasks?.filter(task => {
    const matchesSearch = task.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      task.description?.toLowerCase().includes(debouncedSearch.toLowerCase());
    const matchesStatus = statusFilter === 'All' || task.status === statusFilter;
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'due_date') {
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return new Date(a.due_date) - new Date(b.due_date);
    }
    return 0;
  }) ?? [];

  const handleDrop = async (item, status) => {
    try {
      await updateTask(item.id, { status });
      refetch();
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  };

  const TaskColumn = ({ status }) => {
    const [{ isOver }, drop] = useDrop({
      accept: 'TASK',
      drop: (item) => {
        if (item.status !== status) {
          handleDrop(item, status);
        }
      },
      collect: (monitor) => ({
        isOver: !!monitor.isOver(),
      }),
    });

    const config = STATUS_STYLES[status];
    const tasksInColumn = filteredTasks.filter(task => task.status === status);

    return (
      <div
        ref={drop}
        className={`
          flex-1 min-w-[300px] p-4 rounded-lg
          ${config.colors}/20 border ${config.colors}/30
          ${isOver ? config.colors + '/40' : ''}
          transition-colors duration-200
        `}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className={`font-medium ${config.textColor}`}>
            {status} ({tasksInColumn.length})
          </h3>
        </div>

        <div className="space-y-3">
          {tasksInColumn.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onUpdate={updateTask}
              onDelete={deleteTask}
            />
          ))}
          {tasksInColumn.length === 0 && (
            <p className={`text-sm ${config.textColor}/60 text-center py-4`}>
              No tasks in this column
            </p>
          )}
        </div>
      </div>
    );
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex-1 min-w-[280px]">
          <Input
            type="text"
            placeholder="Search tasks..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="flex items-center gap-3">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={TASK_STATUS_OPTIONS}
          />
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            options={SORT_OPTIONS}
          />
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="w-5 h-5 mr-1" />
            New Task
          </Button>
          <Button 
            onClick={logout}
            variant="secondary"
            className="bg-red-50 text-red-600 hover:bg-red-100"
          >
            <LogOut className="w-5 h-5 mr-1" />
            Logout
          </Button>
        </div>
      </div>

      {/* Task Columns */}
      <div className="flex gap-6 overflow-x-auto pb-6">
        <TaskColumn status={TASK_STATUSES.TODO} />
        <TaskColumn status={TASK_STATUSES.IN_PROGRESS} />
        <TaskColumn status={TASK_STATUSES.DONE} />
      </div>

      {/* New Task Modal */}
      {isModalOpen && (
        <TaskDetailsModal
          onClose={() => setIsModalOpen(false)}
          onUpdate={createTask}
        />
      )}
    </div>
  );
} 