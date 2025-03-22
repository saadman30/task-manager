import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Input from './ui/Input';
import Select from './ui/Select';
import { TASK_STATUS_OPTIONS } from '../constants/task';

const filterSchema = z.object({
  searchTerm: z.string().optional(),
  status: z.string(),
  sortBy: z.enum(['due_date_asc', 'due_date_desc'])
});

const SORT_OPTIONS = [
  { value: 'due_date_asc', label: 'Due Date (Earliest First)' },
  { value: 'due_date_desc', label: 'Due Date (Latest First)' },
];

const defaultValues = {
  searchTerm: '',
  status: 'All',
  sortBy: 'due_date_asc'
};

export default function TaskFilters({ onSearch, onSort, onFilter }) {
  const {
    register,
    watch,
    formState: { isSubmitting }
  } = useForm({
    resolver: zodResolver(filterSchema),
    defaultValues,
    mode: 'onChange'
  });

  // Watch all form values
  const formValues = watch();

  // Effect for handling changes
  useEffect(() => {
    const { searchTerm, status, sortBy } = formValues;
    
    // Debounce search
    const debounceTimer = setTimeout(() => {
      onSearch(searchTerm);
    }, 300);

    // Immediate updates for status and sort
    onFilter(status);
    onSort(sortBy);

    return () => clearTimeout(debounceTimer);
  }, [formValues, onSearch, onFilter, onSort]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white rounded-lg shadow mb-4">
      <div className="w-full">
        <Input
          label="Search Tasks"
          placeholder="Search by name or description..."
          disabled={isSubmitting}
          {...register('searchTerm')}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Select
          label="Filter Status"
          options={TASK_STATUS_OPTIONS}
          disabled={isSubmitting}
          {...register('status')}
        />
        <Select
          label="Sort By Due Date"
          options={SORT_OPTIONS}
          disabled={isSubmitting}
          {...register('sortBy')}
        />
      </div>
    </div>
  );
} 