import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { TaskAPI } from '../services/api';

const TASK_STATUSES = ['To Do', 'In Progress', 'Done'];

const initialFormState = {
  name: '',
  description: '',
  due_date: '',
  status: 'To Do',
};

export default function TaskForm() {
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const queryClient = useQueryClient();

  const createTaskMutation = useMutation({
    mutationFn: (data) => TaskAPI.createTask(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks']);
      setFormData(initialFormState);
      setErrors({});
    },
    onError: (error) => {
      // Handle validation errors from the backend
      if (error.response?.status === 422) {
        console.log('Validation errors:', error.response.data);
        setErrors(error.response.data.errors || {});
      }
    },
  });

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

    if (!TASK_STATUSES.includes(formData.status)) {
      newErrors.status = 'Invalid status';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submitting form data:', formData);
    if (validateForm()) {
      createTaskMutation.mutate(formData);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white rounded-lg shadow">
      <div>
        <label className="block text-sm font-medium text-gray-700">Name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
            errors.name ? 'border-red-500' : ''
          }`}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-500">{errors.name}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="3"
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
            errors.description ? 'border-red-500' : ''
          }`}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-500">{errors.description}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Due Date</label>
        <input
          type="datetime-local"
          name="due_date"
          value={formData.due_date}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
            errors.due_date ? 'border-red-500' : ''
          }`}
        />
        {errors.due_date && (
          <p className="mt-1 text-sm text-red-500">{errors.due_date}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Status</label>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
            errors.status ? 'border-red-500' : ''
          }`}
        >
          {TASK_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        {errors.status && (
          <p className="mt-1 text-sm text-red-500">{errors.status}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={createTaskMutation.isPending}
        className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
      >
        {createTaskMutation.isPending ? 'Creating...' : 'Create Task'}
      </button>

      {createTaskMutation.isError && !Object.keys(errors).length && (
        <div className="mt-2 text-sm text-red-600">
          An error occurred while creating the task. Please try again.
        </div>
      )}
    </form>
  );
} 