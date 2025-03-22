import { useState, useCallback, useEffect } from 'react';
import debounce from 'lodash/debounce';

const TASK_STATUSES = ['To Do', 'In Progress', 'Done'];

export default function TaskFilters({ onSearch, onSort, onFilter }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('due_date_asc'); // Default to ascending

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
    setSortOrder(value);
    onSort(value);
  };

  const handleFilterChange = (e) => {
    const value = e.target.value;
    console.log('Filtering by status:', value);
    onFilter(value);
  };

  // Call onSort with default value on mount
  useEffect(() => {
    onSort('due_date_asc');
  }, [onSort]);

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
          Sort By Due Date
        </label>
        <select
          value={sortOrder}
          onChange={handleSortChange}
          className="w-full p-2 border rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        >
          <option value="due_date_asc">Earliest First</option>
          <option value="due_date_desc">Latest First</option>
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