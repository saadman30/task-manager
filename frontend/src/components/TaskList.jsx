import { useDrop } from 'react-dnd';
import TaskCard from './TaskCard';
import { TASK_STATUSES, STATUS_STYLES } from '../constants/task';

const TaskColumn = ({ status, tasks, onUpdateTask, onDeleteTask }) => {
  const [{ isOver }, drop] = useDrop({
    accept: 'TASK',
    drop: (item) => {
      if (item.status !== status) {
        onUpdateTask(item.id, { status });
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  const config = STATUS_STYLES[status];

  return (
    <div
      ref={drop}
      className={`
        flex-1 min-w-[300px] p-4 rounded-lg
        ${config.colors}/20 border ${config.colors}/30
        ${isOver ? config.colors + '/40' : ''}
        transition-colors duration-200
      `}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className={`font-medium ${config.textColor}`}>
          {status} ({tasks.length})
        </h3>
      </div>

      <div className="space-y-3">
        {tasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            onUpdate={(updates) => onUpdateTask(task.id, updates)}
            onDelete={() => onDeleteTask(task.id)}
          />
        ))}
        {tasks.length === 0 && (
          <p className={`text-sm ${config.textColor}/60 text-center py-4`}>
            No tasks in this column
          </p>
        )}
      </div>
    </div>
  );
};

export default function TaskList({ groupedTasks, onUpdateTask, onDeleteTask, isLoading }) {
  if (isLoading) {
    return <div className="text-center py-8">Loading tasks...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {Object.values(TASK_STATUSES).map(status => (
        <TaskColumn
          key={status}
          status={status}
          tasks={groupedTasks[status] || []}
          onUpdateTask={onUpdateTask}
          onDeleteTask={onDeleteTask}
        />
      ))}
    </div>
  );
} 