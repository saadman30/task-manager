import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTasks } from '../contexts/TasksContext';
import Input from './ui/Input';
import Select from './ui/Select';
import Button from './ui/Button';
import { TASK_STATUS_OPTIONS } from '../constants/task';
import { TASK_VALIDATION, taskSchema } from '../schemas/task';

// Helper to get today's date in YYYY-MM-DD format
const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

const defaultValues = {
  name: '',
  description: '',
  due_date: '',
  status: 'To Do',
};

export default function TaskForm({ onSuccess }) {
  const { createTask } = useTasks();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, touchedFields },
    reset,
    watch
  } = useForm({
    resolver: zodResolver(taskSchema),
    defaultValues,
    mode: 'onBlur'
  });

  // Watch values for character count
  const nameValue = watch('name');
  const descriptionValue = watch('description');

  // Get helper text (character count for text fields)
  const getHelperText = useCallback((fieldName) => {
    switch (fieldName) {
      case 'name':
        return `${nameValue?.length || 0}/${TASK_VALIDATION.NAME.MAX} characters`;
      case 'description':
        return descriptionValue ? `${descriptionValue.length}/${TASK_VALIDATION.DESCRIPTION.MAX} characters` : '';
      default:
        return '';
    }
  }, [nameValue, descriptionValue]);

  const onSubmit = async (data) => {
    try {
      const result = await createTask(data);
      if (result.success) {
        reset(defaultValues);
        onSuccess?.();
      }
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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