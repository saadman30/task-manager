import { useDrag, useDrop } from 'react-dnd';
import { useTasks } from '../contexts/TasksContext';

export function useDragAndDrop(task, onStatusChange) {
  const { updateTask } = useTasks();

  const [{ isDragging }, drag] = useDrag({
    type: 'TASK',
    item: { id: task.id, status: task.status },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  const handleDrop = async (item, status) => {
    if (item.status !== status) {
      const result = await updateTask(item.id, { status });
      if (result.success) {
        onStatusChange?.(item.id, status);
      }
    }
  };

  const [{ isOver }, drop] = useDrop({
    accept: 'TASK',
    drop: (item) => handleDrop(item, task.status),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  return {
    isDragging,
    isOver,
    drag,
    drop,
  };
} 