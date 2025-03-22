import React from 'react';
import { useDrag } from 'react-dnd';
import Button from './ui/Button';

export default function TaskCard({ task, onUpdate, onDelete }) {
  const [{ isDragging }, drag] = useDrag({
    type: 'TASK',
    item: { id: task.id, status: task.status },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={drag}
      className={`p-4 bg-gray-50 rounded-lg cursor-move ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-medium">{task.name}</h4>
        <div className="flex space-x-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              const newStatus = prompt(
                'Enter new status (To Do, In Progress, Done):',
                task.status
              );
              if (newStatus && ['To Do', 'In Progress', 'Done'].includes(newStatus)) {
                onUpdate(task.id, { status: newStatus });
              }
            }}
          >
            Move
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => onDelete(task.id)}
          >
            Delete
          </Button>
        </div>
      </div>
      {task.description && (
        <p className="text-sm text-gray-600 mb-2">
          {task.description}
        </p>
      )}
      {task.due_date && (
        <p className="text-xs text-gray-500">
          Due: {new Date(task.due_date).toLocaleString()}
        </p>
      )}
    </div>
  );
} 