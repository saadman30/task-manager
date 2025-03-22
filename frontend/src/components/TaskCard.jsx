import React, { useState, useRef, useEffect } from 'react';
import { useDrag } from 'react-dnd';
import { Circle, Pause, CheckCircle, X, Calendar, Check, Edit2, Loader2 } from 'lucide-react';
import Button from './ui/Button';
import Select from './ui/Select';
import { TASK_STATUSES, STATUS_STYLES, TASK_STATUS_OPTIONS } from '../constants/task';

export default function TaskCard({ task, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState(task);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const nameInputRef = useRef(null);

  // Update editedTask when task prop changes
  useEffect(() => {
    setEditedTask(task);
  }, [task]);

  const [{ isDragging }, drag] = useDrag({
    type: 'TASK',
    item: { id: task.id, status: task.status },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  useEffect(() => {
    if (isEditing && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [isEditing]);

  const statusIcons = {
    [TASK_STATUSES.TODO]: <Circle className="w-3 h-3" />,
    [TASK_STATUSES.IN_PROGRESS]: <Pause className="w-3 h-3" />,
    [TASK_STATUSES.DONE]: <CheckCircle className="w-3 h-3" />,
  };

  const config = STATUS_STYLES[editedTask.status];
  const icon = statusIcons[editedTask.status];

  const handleEdit = (e) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleSave = async (e) => {
    e.stopPropagation();
    setIsLoading(true);
    try {
      const updates = {
        name: editedTask.name,
        description: editedTask.description,
        status: editedTask.status
      };

      const result = await onUpdate(task.id, updates);
      
      if (result.success) {
        setIsEditing(false);
        setErrors({});
      } else if (result.errors) {
        setErrors(result.errors);
      }
    } catch (error) {
      console.error('Failed to update task:', error);
      setErrors({ general: 'Failed to update task' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = (e) => {
    e.stopPropagation();
    setIsEditing(false);
    setEditedTask(task);
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedTask(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    setIsLoading(true);
    try {
      await onDelete(task.id);
    } catch (error) {
      console.error('Failed to delete task:', error);
      setErrors({ general: 'Failed to delete task' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      ref={drag}
      className={`
        ${config.colors} rounded-lg
        transform transition-all duration-200
        hover:-translate-y-1 hover:shadow-xl ${config.shadowColor}
        relative overflow-hidden
        ${isDragging ? 'opacity-50 scale-95' : ''}
        before:absolute before:inset-0 before:z-0
        before:bg-gradient-to-b before:from-white/10 before:to-transparent
        ${isEditing ? 'cursor-default' : 'cursor-default'}
        ${isLoading ? 'opacity-75' : ''}
      `}
    >
      <div className="relative z-10 p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 text-left flex-1">
            {isEditing ? (
              <input
                ref={nameInputRef}
                type="text"
                name="name"
                value={editedTask.name}
                onChange={handleChange}
                disabled={isLoading}
                className={`w-full bg-white/50 rounded px-2 py-1 ${config.textColor} text-lg font-medium
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                  disabled:opacity-50 disabled:cursor-not-allowed`}
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <h4 className={`font-medium ${config.textColor} text-lg truncate`}>
                {editedTask.name}
              </h4>
            )}
            {isEditing ? (
              <textarea
                name="description"
                value={editedTask.description || ''}
                onChange={handleChange}
                disabled={isLoading}
                className={`w-full mt-2 bg-white/50 rounded px-2 py-1 ${config.textColor}/80 text-sm
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                  disabled:opacity-50 disabled:cursor-not-allowed`}
                rows="2"
                onClick={(e) => e.stopPropagation()}
                placeholder="Add description..."
              />
            ) : (
              editedTask.description && (
                <p className={`mt-1 text-sm ${config.textColor}/80`}>
                  {editedTask.description}
                </p>
              )
            )}
          </div>
          <div 
            className="flex items-center space-x-1"
            onClick={(e) => e.stopPropagation()}
          >
            {isEditing ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSave}
                  disabled={isLoading}
                  className={`${config.textColor}/60 hover:${config.textColor} p-1
                    disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancel}
                  disabled={isLoading}
                  className={`${config.textColor}/60 hover:${config.textColor} p-1
                    disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <X className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleEdit}
                  disabled={isLoading}
                  className={`${config.textColor}/60 hover:${config.textColor} p-1
                    disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDelete}
                  disabled={isLoading}
                  className={`${config.textColor}/60 hover:${config.textColor} p-1
                    disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <X className="w-4 h-4" />
                  )}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isEditing ? (
              <Select
                name="status"
                value={editedTask.status}
                onChange={handleChange}
                options={TASK_STATUS_OPTIONS.slice(1)}
                disabled={isLoading}
                className={`bg-white/50 text-xs min-w-[120px] ${config.textColor}
                  disabled:opacity-50 disabled:cursor-not-allowed`}
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span className={`
                inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium
                bg-white/50 backdrop-blur-sm ${config.textColor}
              `}>
                {icon}
                {editedTask.status}
              </span>
            )}
          </div>
          {editedTask.due_date && (
            <div className={`flex items-center text-xs ${config.textColor}/70`}>
              <Calendar className="w-3.5 h-3.5 mr-1" />
              {new Date(editedTask.due_date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
              })}
            </div>
          )}
        </div>

        {/* Error Messages */}
        {Object.keys(errors).length > 0 && (
          <div className="mt-2 text-red-600 text-xs">
            {Object.entries(errors).map(([field, error]) => (
              <p key={field}>{error}</p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 