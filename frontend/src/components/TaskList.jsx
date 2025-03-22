import { useDrop } from 'react-dnd';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
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

      <TransitionGroup className="space-y-3">
        {tasks.map(task => (
          <CSSTransition
            key={task.id}
            timeout={300}
            classNames="task"
          >
            <div className="task-move">
              <TaskCard
                task={task}
                onUpdate={(updates) => onUpdateTask(task.id, updates)}
                onDelete={() => onDeleteTask(task.id)}
              />
            </div>
          </CSSTransition>
        ))}
        {tasks.length === 0 && (
          <CSSTransition
            timeout={300}
            classNames="task"
          >
            <p className={`text-sm ${config.textColor}/60 text-center py-4`}>
              No tasks in this column
            </p>
          </CSSTransition>
        )}
      </TransitionGroup>
    </div>
  );
};

export default function TaskList({ groupedTasks, onUpdateTask, onDeleteTask, isLoading }) {
  if (isLoading) {
    return <div className="text-center py-8">Loading tasks...</div>;
  }

  // Filter out the 'All' status when rendering columns
  const columnStatuses = Object.values(TASK_STATUSES).filter(status => status !== TASK_STATUSES.ALL);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {columnStatuses.map(status => (
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