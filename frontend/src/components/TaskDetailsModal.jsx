import React from 'react';
import { Circle, Pause, CheckCircle, Calendar } from 'lucide-react';
import Button from './ui/Button';

export default function TaskDetailsModal({ task, onClose, onUpdate, onDelete }) {
  if (!task) return null;

  const statusConfig = {
    'To Do': {
      colors: 'bg-amber-50 border-amber-200',
      textColor: 'text-amber-700',
      icon: <Circle className="w-4 h-4" />
    },
    'In Progress': {
      colors: 'bg-blue-50 border-blue-200',
      textColor: 'text-blue-700',
      icon: <Pause className="w-4 h-4" />
    },
    'Done': {
      colors: 'bg-emerald-50 border-emerald-200',
      textColor: 'text-emerald-700',
      icon: <CheckCircle className="w-4 h-4" />
    }
  };

  const config = statusConfig[task.status];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                    {task.name}
                  </h3>
                  <span className={`
                    inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-sm font-medium
                    ${config.colors} ${config.textColor}
                  `}>
                    {config.icon}
                    {task.status}
                  </span>
                </div>

                <div className="mt-6 space-y-4">
                  {/* Description */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Description</h4>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">
                      {task.description || 'No description provided'}
                    </p>
                  </div>

                  {/* Due Date */}
                  {task.due_date && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Due Date</h4>
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-1.5" />
                        {new Date(task.due_date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  )}

                  {/* Status Change */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Change Status</h4>
                    <div className="flex gap-2">
                      {['To Do', 'In Progress', 'Done'].map((status) => (
                        <button
                          key={status}
                          onClick={() => onUpdate(task.id, { status })}
                          className={`
                            px-3 py-1.5 rounded-md text-sm font-medium transition-colors
                            ${task.status === status 
                              ? `${statusConfig[status].colors} ${statusConfig[status].textColor}`
                              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                            }
                          `}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <Button
              variant="danger"
              className="w-full sm:w-auto sm:ml-3"
              onClick={() => {
                onDelete(task.id);
                onClose();
              }}
            >
              Delete Task
            </Button>
            <Button
              variant="secondary"
              className="mt-3 sm:mt-0 w-full sm:w-auto"
              onClick={onClose}
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 