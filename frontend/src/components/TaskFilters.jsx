import Input from './ui/Input';
import Select from './ui/Select';
import { TASK_STATUS_OPTIONS } from '../constants/task';

const SORT_OPTIONS = [
  { value: 'due_date_asc', label: 'Due Date (Earliest First)' },
  { value: 'due_date_desc', label: 'Due Date (Latest First)' },
];

export default function TaskFilters({ 
  searchTerm,
  status,
  sortBy,
  onSearchChange,
  onStatusChange,
  onSortChange,
  isDisabled 
}) {
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