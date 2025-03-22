import React, { useState } from 'react';
import { useDrag } from 'react-dnd';
import { Circle, Pause, CheckCircle, X, Calendar } from 'lucide-react';
import Button from './ui/Button';
import TaskDetailsModal from './TaskDetailsModal';
import { TASK_STATUSES, STATUS_STYLES } from '../constants/task';

export default function TaskCard({ task, onUpdate, onDelete }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [{ isDragging }, drag] = useDrag({
    type: 'TASK',
    item: { id: task.id, status: task.status },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  const statusIcons = {
    [TASK_STATUSES.TODO]: <Circle className="w-3 h-3" />,
    [TASK_STATUSES.IN_PROGRESS]: <Pause className="w-3 h-3" />,
    [TASK_STATUSES.DONE]: <CheckCircle className="w-3 h-3" />,
  };

  const config = STATUS_STYLES[task.status];
  const icon = statusIcons[task.status];

  return (
    <>
      <div
        ref={drag}
        onClick={() => setIsModalOpen(true)}
        className={`
          ${config.colors} rounded-lg cursor-pointer
          transform transition-all duration-200
          hover:-translate-y-1 hover:shadow-xl ${config.shadowColor}
          relative overflow-hidden
          ${isDragging ? 'opacity-50 scale-95' : ''}
          before:absolute before:inset-0 before:z-0
          before:bg-gradient-to-b before:from-white/10 before:to-transparent
        `}
      >
        <div className="relative z-10 p-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 text-left">
              <h4 className={`font-medium ${config.textColor} text-lg truncate`}>
                {task.name}
              </h4>
              {task.description && (
                <p className={`mt-1 text-sm ${config.textColor}/80`}>
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
                className={`${config.textColor}/60 hover:${config.textColor} p-1`}
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
                bg-white/50 backdrop-blur-sm ${config.textColor}
              `}>
                {icon}
                {task.status}
              </span>
            </div>
            {task.due_date && (
              <div className={`flex items-center text-xs ${config.textColor}/70`}>
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