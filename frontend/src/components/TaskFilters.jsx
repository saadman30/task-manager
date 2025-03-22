import { useState, useCallback } from 'react';
import debounce from 'lodash/debounce';

const TASK_STATUSES = ['To Do', 'In Progress', 'Done'];

export default function TaskFilters({ onSearch, onSort, onFilter }) {
  const [searchTerm, setSearchTerm] = useState('');

  // Debounce the search to avoid too many API calls
  const debouncedSearch = useCallback(
    debounce((value) => {
      onSearch(value);
    }, 300),
    [onSearch]
  );

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  const handleSortChange = (e) => {
    const value = e.target.value;
    console.log('Sorting by:', value);
    onSort(value);
  };

  const handleFilterChange = (e) => {
    const value = e.target.value;
    console.log('Filtering by status:', value);
    onFilter(value);
  };

  return (
    <div className="flex flex-wrap gap-4 p-4 bg-white rounded-lg shadow mb-4">
      <div className="flex-1 min-w-[200px]">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Search Tasks
        </label>
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search by name or description..."
          className="w-full p-2 border rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div className="min-w-[150px]">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Sort By
        </label>
        <select
          onChange={handleSortChange}
          className="w-full p-2 border rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        >
          <option value="">None</option>
          <option value="name_asc">Name (A-Z)</option>
          <option value="name_desc">Name (Z-A)</option>
          <option value="due_date_asc">Due Date (Ascending)</option>
          <option value="due_date_desc">Due Date (Descending)</option>
          <option value="created_at_desc">Recently Created</option>
          <option value="created_at_asc">Oldest First</option>
        </select>
      </div>

      <div className="min-w-[150px]">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Filter Status
        </label>
        <select
          onChange={handleFilterChange}
          className="w-full p-2 border rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        >
          <option value="">All</option>
          {TASK_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
} 