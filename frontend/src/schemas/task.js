import { z } from 'zod';
import { TASK_STATUS_OPTIONS } from '../constants/task';

// Constants for validation rules
export const TASK_VALIDATION = {
  NAME: {
    MIN: 3,
    MAX: 255
  },
  DESCRIPTION: {
    MAX: 1000
  }
};

// Helper function to strip time from date and compare only dates
const isDateTodayOrFuture = (dateStr) => {
  const inputDate = new Date(dateStr);
  const today = new Date();
  
  // Reset time portions to compare only dates
  inputDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  
  return inputDate >= today;
};

// Base task schema
export const taskSchema = z.object({
  name: z.string()
    .min(TASK_VALIDATION.NAME.MIN, `Name must be at least ${TASK_VALIDATION.NAME.MIN} characters`)
    .max(TASK_VALIDATION.NAME.MAX, `Name must be less than ${TASK_VALIDATION.NAME.MAX} characters`)
    .trim()
    .nonempty('Name is required'),
  description: z.string()
    .max(TASK_VALIDATION.DESCRIPTION.MAX, `Description must be less than ${TASK_VALIDATION.DESCRIPTION.MAX} characters`)
    .optional()
    .transform(val => val || ''), // Convert undefined to empty string
  due_date: z.string()
    .nonempty('Due date is required')
    .refine(
      (date) => !isNaN(new Date(date).getTime()),
      'Invalid date format'
    )
    .refine(
      isDateTodayOrFuture,
      'Due date must be today or in the future'
    ),
  status: z.string()
    .nonempty('Status is required')
    .refine(
      (status) => TASK_STATUS_OPTIONS.slice(1).some(option => option.value === status),
      'Invalid status'
    )
});

// Helper function to validate a single field
export const validateTaskField = (name, value) => {
  try {
    const fieldSchema = z.object({ [name]: taskSchema.shape[name] });
    fieldSchema.parse({ [name]: value });
    return '';
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldError = error.errors.find(err => err.path[0] === name);
      return fieldError ? fieldError.message : '';
    }
    return '';
  }
};

// Helper function to validate entire task
export const validateTask = (data) => {
  try {
    taskSchema.parse(data);
    return { success: true, errors: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = {};
      error.errors.forEach(err => {
        const [field] = err.path;
        errors[field] = err.message;
      });
      return { success: false, errors };
    }
    return { success: false, errors: { general: 'Validation failed' } };
  }
}; 