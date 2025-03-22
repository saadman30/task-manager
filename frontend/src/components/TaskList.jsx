import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDrag, useDrop } from 'react-dnd';
import { TaskAPI } from '../services/api';
import TaskCard from './TaskCard';

const TASK_STATUSES = ['To Do', 'In Progress', 'Done'];

const TaskColumn = ({ status, tasks = [], onTaskMove }) => {
  const [{ isOver }, drop] = useDrop({
    accept: 'TASK',
    drop: (item) => onTaskMove(item.id, status),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  // Ensure tasks is an array before filtering
  const filteredTasks = Array.isArray(tasks) 
    ? tasks.filter((task) => task.status === status)
    : [];

  console.log(`${status} column tasks:`, filteredTasks);

  return (
    <div
      ref={drop}
      className={`flex-1 min-h-[500px] p-4 rounded-lg bg-gray-100 ${
        isOver ? 'bg-gray-200' : ''
      }`}
    >
      <h3 className="text-lg font-semibold mb-4">
        {status}
      </h3>
      <div className="space-y-4">
        {filteredTasks
          .sort((a, b) => (a.order || 0) - (b.order || 0))
          .map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
      </div>
    </div>
  );
};

export default function TaskList({ searchTerm, sortBy, filterStatus }) {
  const queryClient = useQueryClient();

  const { data: tasksData, isLoading, error } = useQuery({
    queryKey: ['tasks', { searchTerm, sortBy, filterStatus }],
    queryFn: async () => {
      console.log('Fetching tasks with params:', { searchTerm, sortBy, filterStatus });
      const response = await TaskAPI.getAllTasks({
        search: searchTerm,
        sort: sortBy,
        status: filterStatus,
      });
      
      console.log('Raw API response:', response);
      
      // Handle paginated response
      let tasks = [];
      if (response && typeof response === 'object') {
        if (response.data) {
          tasks = response.data;
        } else if (Array.isArray(response)) {
          tasks = response;
        }
      }
      
      console.log('Processed tasks:', tasks);
      return tasks;
    },
    // Refresh data every 30 seconds
    refetchInterval: 30000,
  });

  // Ensure tasks is always an array
  const tasks = Array.isArray(tasksData) ? tasksData : [];
  console.log('Current tasks state:', tasks);

  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, data }) => TaskAPI.updateTask(taskId, data),
    onMutate: async ({ taskId, data }) => {
      await queryClient.cancelQueries(['tasks']);
      const previousTasks = queryClient.getQueryData(['tasks']);
      queryClient.setQueryData(['tasks'], (old) =>
        Array.isArray(old)
          ? old.map((task) => (task.id === taskId ? { ...task, ...data } : task))
          : []
      );
      return { previousTasks };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['tasks'], context.previousTasks);
      console.error('Error updating task:', err);
    },
    onSettled: () => {
      queryClient.invalidateQueries(['tasks']);
    },
  });

  const handleTaskMove = (taskId, newStatus) => {
    console.log('Moving task:', { taskId, newStatus });
    updateTaskMutation.mutate({
      taskId,
      data: { status: newStatus },
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-gray-600">Loading tasks...</div>
      </div>
    );
  }

  if (error) {
    console.error('Error loading tasks:', error);
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-red-600">
          Error loading tasks. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-4 p-4">
      {TASK_STATUSES.map((status) => (
        <TaskColumn
          key={status}
          status={status}
          tasks={tasks}
          onTaskMove={handleTaskMove}
        />
      ))}
    </div>
  );
} 