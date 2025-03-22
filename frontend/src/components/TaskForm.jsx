import { useState } from 'react';
import { useTasks } from '../contexts/TasksContext';
import Input from './ui/Input';
import Select from './ui/Select';
import Button from './ui/Button';
import { TASK_STATUS_OPTIONS } from '../constants/task';

const initialFormState = {
  name: '',
  description: '',
  due_date: '',
  status: 'To Do',
};

export default function TaskForm({ onSuccess }) {
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const { createTask } = useTasks();

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length > 255) {
      newErrors.name = 'Name must be less than 255 characters';
    }

    if (formData.description && formData.description.length > 1000) {
      newErrors.description = 'Description must be less than 1000 characters';
    }

    if (formData.due_date) {
      const dueDate = new Date(formData.due_date);
      const now = new Date();
      if (isNaN(dueDate.getTime())) {
        newErrors.due_date = 'Invalid date format';
      } else if (dueDate <= now) {
        newErrors.due_date = 'Due date must be in the future';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const result = await createTask(formData);
      if (result.success) {
        setFormData(initialFormState);
        setErrors({});
        onSuccess?.();
      } else if (result.errors) {
        setErrors(result.errors);
      }
    } catch (error) {
      console.error('Failed to create task:', error);
      setErrors({ general: 'Failed to create task' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Task Name"
        type="text"
        name="name"
        value={formData.name}
        onChange={handleChange}
        error={errors.name}
        disabled={isLoading}
        required
      />

      <Input
        label="Description"
        as="textarea"
        name="description"
        value={formData.description}
        onChange={handleChange}
        error={errors.description}
        disabled={isLoading}
        rows="3"
      />

      <Input
        label="Due Date"
        type="datetime-local"
        name="due_date"
        value={formData.due_date}
        onChange={handleChange}
        error={errors.due_date}
        disabled={isLoading}
      />

      <Select
        label="Status"
        name="status"
        value={formData.status}
        onChange={handleChange}
        options={TASK_STATUS_OPTIONS.slice(1)}
        error={errors.status}
        disabled={isLoading}
      />

      {errors.general && (
        <div className="text-sm text-red-600">
          {errors.general}
        </div>
      )}

      <Button
        type="submit"
        isLoading={isLoading}
        className="w-full"
      >
        Create Task
      </Button>
    </form>
  );
} 