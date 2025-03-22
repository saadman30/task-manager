import React, { useState } from 'react';
import { useDrag } from 'react-dnd';
import { Circle, Pause, CheckCircle, X, Calendar } from 'lucide-react';
import Button from './ui/Button';
import TaskDetailsModal from './TaskDetailsModal';

export default function TaskCard({ task, onUpdate, onDelete }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [{ isDragging }, drag] = useDrag({
    type: 'TASK',
    item: { id: task.id, status: task.status },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  const statusConfig = {
    'To Do': {
      colors: 'bg-amber-50 border-amber-200',
      textColor: 'text-amber-700',
      icon: <Circle className="w-3 h-3" />
    },
    'In Progress': {
      colors: 'bg-blue-50 border-blue-200',
      textColor: 'text-blue-700',
      icon: <Pause className="w-3 h-3" />
    },
    'Done': {
      colors: 'bg-emerald-50 border-emerald-200',
      textColor: 'text-emerald-700',
      icon: <CheckCircle className="w-3 h-3" />
    }
  };

  const config = statusConfig[task.status];

  return (
    <>
      <div
        ref={drag}
        onClick={() => setIsModalOpen(true)}
        className={`
          bg-white border rounded-lg overflow-hidden cursor-pointer
          hover:shadow-md transition-all duration-200
          ${isDragging ? 'opacity-50 scale-95' : ''}
        `}
      >
        <div className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 text-left">
              <h4 className="font-medium text-gray-900 truncate">
                {task.name}
              </h4>
              {task.description && (
                <p className="text-sm text-gray-600">
                  {task.description}
                </p>
              )}
            </div>
            <div 
              className="flex items-center space-x-1"
              onClick={(e) => e.stopPropagation()} // Prevent modal from opening when clicking actions
            >
             
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(task.id)}
                className="text-gray-400 hover:text-red-600 p-1"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`
                inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium
                ${config.colors} ${config.textColor}
              `}>
                {config.icon}
                {task.status}
              </span>
            </div>
            {task.due_date && (
              <div className="flex items-center text-xs text-gray-500">
                <Calendar className="w-3.5 h-3.5 mr-1" />
                {new Date(task.due_date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric'
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Task Details Modal */}
      {isModalOpen && (
        <TaskDetailsModal
          task={task}
          onClose={() => setIsModalOpen(false)}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      )}
    </>
  );
} 