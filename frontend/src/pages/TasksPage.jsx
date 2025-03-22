import React, { useState } from 'react';
import { useDrop } from 'react-dnd';
import { Plus, LogOut, X } from 'lucide-react';
import { useTasks } from '../contexts/TasksContext';
import { useAuth } from '../contexts/AuthContext';
import { useDebouncedValue } from '../hooks/useDebounce';
import TaskCard from '../components/TaskCard';
import TaskForm from '../components/TaskForm';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { TASK_STATUSES, TASK_STATUS_OPTIONS, STATUS_STYLES } from '../constants/task';

const SORT_OPTIONS = [
  { value: 'due_date_asc', label: 'Due Date (Earliest First)' },
  { value: 'due_date_desc', label: 'Due Date (Latest First)' },
];

export default function TasksPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('due_date_asc'); // Default to ascending
  const debouncedSearch = useDebouncedValue(searchInput, 300);
  const { logout } = useAuth();

  const { tasks, isLoading, error, createTask, updateTask, deleteTask, refetch, filterTasks } = useTasks();

  // Use filterTasks from TasksContext
  const filteredTasks = filterTasks(tasks, {
    searchTerm: debouncedSearch,
    status: statusFilter === 'All' ? null : statusFilter,
    sortBy
  });

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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="w-full">
          <Input
            type="text"
            placeholder="Search tasks..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="grid grid-cols-4 gap-3">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={TASK_STATUS_OPTIONS}
            className="w-full"
          />
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            options={SORT_OPTIONS}
            className="w-full"
          />
          <Button onClick={() => setIsModalOpen(true)} className="w-full">
            <Plus className="w-5 h-5 mr-1" />
            New Task
          </Button>
          <Button 
            onClick={logout}
            variant="secondary"
            className="w-full bg-red-50 text-red-600 hover:bg-red-100"
          >
            <LogOut className="w-5 h-5 mr-1" />
            Logout
          </Button>
        </div>
      </div>

      {/* Task Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <TaskColumn status={TASK_STATUSES.TODO} />
        <TaskColumn status={TASK_STATUSES.IN_PROGRESS} />
        <TaskColumn status={TASK_STATUSES.DONE} />
      </div>

      {/* New Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 relative">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-medium">Create New Task</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsModalOpen(false)}
                className="p-1"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="p-4">
              <TaskForm onSuccess={() => setIsModalOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 