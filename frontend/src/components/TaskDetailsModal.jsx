import React, { useState } from 'react';
import { X } from 'lucide-react';
import Button from './ui/Button';
import Input from './ui/Input';
import Select from './ui/Select';
import { TASK_STATUS_OPTIONS } from '../constants/task';

export default function TaskDetailsModal({ task, onClose, onUpdate, onDelete }) {
  const [formData, setFormData] = useState({
    name: task?.name || '',
    description: task?.description || '',
    status: task?.status || TASK_STATUS_OPTIONS[1].value, // Default to "To Do"
    due_date: task?.due_date || '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for the field being changed
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      const result = await onUpdate(task?.id ? { id: task.id, ...formData } : formData);
      if (result.success) {
        onClose();
      } else if (result.errors) {
        setErrors(result.errors);
      } else if (result.error) {
        setErrors({ general: result.error });
      }
    } catch (error) {
      console.error('Task submission error:', error);
      const errorMessage = error.response?.data?.message;
      if (errorMessage?.includes('due date')) {
        setErrors({ due_date: errorMessage });
      } else {
        setErrors({ 
          general: errorMessage || 'An error occurred while saving the task.' 
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {task ? 'Edit Task' : 'New Task'}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {errors.general && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
              {errors.general}
            </div>
          )}

          <Input
            label="Task Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Enter task name"
            error={errors.name}
          />

          <Input
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            as="textarea"
            rows="4"
            placeholder="Enter task description"
            error={errors.description}
          />

          <Input
            label="Due Date"
            type="datetime-local"
            name="due_date"
            value={formData.due_date}
            onChange={handleChange}
            error={errors.due_date}
            min={new Date().toISOString().slice(0, 16)} // Set minimum date to now
          />

          <Select
            label="Status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            options={TASK_STATUS_OPTIONS.slice(1)} // Exclude "All" option
            error={errors.status}
          />

          <div className="flex justify-end space-x-3 pt-4">
            {task && (
              <Button
                type="button"
                variant="danger"
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete this task?')) {
                    onDelete(task.id);
                    onClose();
                  }
                }}
              >
                Delete
              </Button>
            )}
            <div className="flex-1" />
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              isLoading={isSubmitting}
            >
              {task ? 'Save Changes' : 'Create Task'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 