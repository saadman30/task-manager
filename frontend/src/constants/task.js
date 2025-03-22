export const TASK_STATUSES = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  DONE: 'Done',
  ALL: 'All'
};

export const TASK_STATUS_OPTIONS = [
  { value: TASK_STATUSES.ALL, label: 'All' },
  { value: TASK_STATUSES.TODO, label: TASK_STATUSES.TODO },
  { value: TASK_STATUSES.IN_PROGRESS, label: TASK_STATUSES.IN_PROGRESS },
  { value: TASK_STATUSES.DONE, label: TASK_STATUSES.DONE },
];

export const SORT_OPTIONS = [
  { value: 'due_date_asc', label: 'Due Date (Earliest First)' },
  { value: 'due_date_desc', label: 'Due Date (Latest First)' },
];

export const STATUS_STYLES = {
  [TASK_STATUSES.TODO]: {
    colors: 'bg-yellow-100',
    shadowColor: 'shadow-yellow-200/50',
    textColor: 'text-yellow-800',
    columnBg: 'bg-yellow-50',
    columnBorder: 'border-yellow-100',
    columnHover: 'ring-yellow-200',
  },
  [TASK_STATUSES.IN_PROGRESS]: {
    colors: 'bg-blue-100',
    shadowColor: 'shadow-blue-200/50',
    textColor: 'text-blue-800',
    columnBg: 'bg-blue-50',
    columnBorder: 'border-blue-100',
    columnHover: 'ring-blue-200',
  },
  [TASK_STATUSES.DONE]: {
    colors: 'bg-green-100',
    shadowColor: 'shadow-green-200/50',
    textColor: 'text-green-800',
    columnBg: 'bg-green-50',
    columnBorder: 'border-green-100',
    columnHover: 'ring-green-200',
  },
}; 