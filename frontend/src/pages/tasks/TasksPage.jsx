import { useState } from 'react';
import TaskList from '../../components/TaskList';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import { TASK_STATUS_OPTIONS } from '../../constants/task';
import { useTasksLogic, SORT_OPTIONS, getTodayDate } from './useTasksLogic';
import { useAuth } from '../../contexts/AuthContext';

// Render task filters section
function TaskFilters({ searchTerm, status, sortBy, onSearchChange, onStatusChange, onSortChange, isDisabled }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white rounded-lg shadow mb-4">
      <div className="w-full">
        <Input
          label="Search Tasks"
          placeholder="Search by name or description..."
          value={searchTerm}
          onChange={onSearchChange}
          disabled={isDisabled}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Select
          label="Filter Status"
          options={TASK_STATUS_OPTIONS}
          value={status}
          onChange={onStatusChange}
          disabled={isDisabled}
        />
        <Select
          label="Sort By Due Date"
          options={SORT_OPTIONS}
          value={sortBy}
          onChange={onSortChange}
          disabled={isDisabled}
        />
      </div>
    </div>
  );
}

// Render task creation form
function TaskForm({ register, errors, touchedFields, isSubmitting, onSubmit, getHelperText }) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Input
        label="Task Name"
        error={touchedFields.name ? errors.name?.message : ''}
        helperText={getHelperText('name')}
        disabled={isSubmitting}
        required
        {...register('name')}
      />

      <Input
        label="Description"
        as="textarea"
        error={touchedFields.description ? errors.description?.message : ''}
        helperText={getHelperText('description')}
        disabled={isSubmitting}
        rows="3"
        {...register('description')}
      />

      <Input
        label="Due Date"
        type="date"
        error={touchedFields.due_date ? errors.due_date?.message : ''}
        disabled={isSubmitting}
        required
        min={getTodayDate()}
        {...register('due_date')}
      />

      <Select
        label="Status"
        options={TASK_STATUS_OPTIONS.slice(1)}
        error={touchedFields.status ? errors.status?.message : ''}
        disabled={isSubmitting}
        required
        {...register('status')}
      />

      <Button
        type="submit"
        isLoading={isSubmitting}
        className="w-full"
      >
        Create Task
      </Button>
    </form>
  );
}

export default function TasksPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { logout, user } = useAuth();
  const {
    // Form handling
    formRegister,
    formErrors,
    touchedFields,
    isTaskSubmitting,
    onSubmit,
    getHelperText,

    // Filter state and handlers
    searchTerm,
    status,
    sortBy,
    onSearchChange,
    onStatusChange,
    onSortChange,
    isFilterSubmitting,

    // Task operations
    groupedTasks,
    onUpdateTask,
    onDeleteTask,
    isLoading,
  } = useTasksLogic();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Task Management</h1>
          <div className="flex items-center space-x-3 ml-6">
            <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
              <span className="text-sm font-medium text-white">
                {user?.name?.[0] || user?.email?.[0] || "?"}
              </span>
            </div>
            <span className="text-sm text-gray-600">
              {user?.name || user?.email}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => setIsCreateModalOpen(true)}>
            Create New Task
          </Button>
          <Button 
            variant="ghost" 
            onClick={logout}
            className="flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Logout
          </Button>
        </div>
      </div>

      <TaskFilters
        searchTerm={searchTerm}
        status={status}
        sortBy={sortBy}
        onSearchChange={onSearchChange}
        onStatusChange={onStatusChange}
        onSortChange={onSortChange}
        isDisabled={isLoading || isFilterSubmitting}
      />

      <TaskList
        groupedTasks={groupedTasks}
        onUpdateTask={onUpdateTask}
        onDeleteTask={onDeleteTask}
        isLoading={isLoading}
      />

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Task"
      >
        <TaskForm
          register={formRegister}
          errors={formErrors}
          touchedFields={touchedFields}
          isSubmitting={isTaskSubmitting}
          onSubmit={(e) => {
            onSubmit(e);
            setIsCreateModalOpen(false);
          }}
          getHelperText={getHelperText}
        />
      </Modal>
    </div>
  );
} 