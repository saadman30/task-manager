import { useState, useCallback } from 'react';
import { useTasks } from '../contexts/TasksContext';
import Input from './ui/Input';
import Select from './ui/Select';
import Button from './ui/Button';
import { TASK_STATUS_OPTIONS } from '../constants/task';
import { TASK_VALIDATION, validateTaskField, validateTask } from '../schemas/task';

// Helper to format date to YYYY-MM-DD
const formatDateForInput = (date) => {
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  return d.toISOString().split('T')[0];
};

// Helper to get today's date in YYYY-MM-DD format
const getTodayDate = () => {
  const today = new Date();
  return formatDateForInput(today);
};

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
  const [touched, setTouched] = useState({});
  const { createTask } = useTasks();

  // Handle field blur - mark as touched and validate
  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateTaskField(name, formData[name]);
    setErrors(prev => ({ ...prev, [name]: error }));
  }, [formData]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Mark all fields as touched
    const allTouched = Object.keys(formData).reduce((acc, field) => ({
      ...acc,
      [field]: true
    }), {});
    setTouched(allTouched);

    // Validate form
    const validation = validateTask(formData);
    if (!validation.success) {
      setErrors(validation.errors);
      return;
    }

    setIsLoading(true);
    try {
      const result = await createTask(formData);
      if (result.success) {
        setFormData(initialFormState);
        setErrors({});
        setTouched({});
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
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // If field is touched, validate on change
    if (touched[name]) {
      const error = validateTaskField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  // Get helper text (character count for text fields)
  const getHelperText = useCallback((fieldName) => {
    switch (fieldName) {
      case 'name':
        return `${formData.name.length}/${TASK_VALIDATION.NAME.MAX} characters`;
      case 'description':
        return formData.description ? `${formData.description.length}/${TASK_VALIDATION.DESCRIPTION.MAX} characters` : '';
      default:
        return '';
    }
  }, [formData.name.length, formData.description]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Task Name"
        type="text"
        name="name"
        value={formData.name}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.name ? errors.name : ''}
        helperText={getHelperText('name')}
        disabled={isLoading}
        required
      />

      <Input
        label="Description"
        as="textarea"
        name="description"
        value={formData.description}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.description ? errors.description : ''}
        helperText={getHelperText('description')}
        disabled={isLoading}
        rows="3"
      />

      <Input
        label="Due Date"
        type="date"
        name="due_date"
        value={formData.due_date}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.due_date ? errors.due_date : ''}
        disabled={isLoading}
        required
        min={getTodayDate()} // Set minimum date to today
      />

      <Select
        label="Status"
        name="status"
        value={formData.status}
        onChange={handleChange}
        onBlur={handleBlur}
        options={TASK_STATUS_OPTIONS.slice(1)}
        error={touched.status ? errors.status : ''}
        disabled={isLoading}
        required
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