import { useState } from 'react';
import { useDrag } from 'react-dnd';
import { format } from 'date-fns';
import { Edit2, Trash2, Check, X } from 'lucide-react';
import { STATUS_STYLES } from '../constants/task';
import Input from './ui/Input';
import Button from './ui/Button';

export default function TaskCard({ task, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(task.name);
  const [editedDescription, setEditedDescription] = useState(task.description);

  const [{ isDragging }, drag] = useDrag({
    type: 'TASK',
    item: { id: task.id, status: task.status },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  const handleSave = () => {
    onUpdate({
      name: editedName,
      description: editedDescription,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedName(task.name);
    setEditedDescription(task.description);
    setIsEditing(false);
  };

  const config = STATUS_STYLES[task.status];

  return (
    <div
      ref={drag}
      className={`
        ${config.columnBg} rounded-lg shadow-sm p-4
        ${isDragging ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}
        transform transition-all duration-200 ease-in-out
        border-l-4 ${config.columnBorder}
        hover:shadow-md hover:${config.columnHover}
        cursor-move
        animate-fade-in
      `}
    >
      {isEditing ? (
        <div className="space-y-3 animate-slide-in">
          <Input
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            placeholder="Task name"
            className="w-full"
          />
          <Input
            value={editedDescription}
            onChange={(e) => setEditedDescription(e.target.value)}
            placeholder="Description"
            className="w-full"
          />
          <div className="flex justify-end space-x-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={handleCancel}
            >
              <X className="w-4 h-4 mr-1" />
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
            >
              <Check className="w-4 h-4 mr-1" />
              Save
            </Button>
          </div>
        </div>
      ) : (
        <div className="animate-fade-in">
          <div className="flex justify-between items-start mb-2">
            <h3 className={`font-medium ${config.textColor}`}>{task.name}</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => setIsEditing(true)}
                className={`${config.textColor} opacity-60 hover:opacity-100 transition-opacity duration-200`}
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={onDelete}
                className="text-red-500 hover:text-red-700 opacity-60 hover:opacity-100 transition-opacity duration-200"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          <p className={`text-sm ${config.textColor} opacity-75 mb-2`}>{task.description}</p>
          <div className="flex justify-between items-center text-sm">
            <span className={`${config.textColor} opacity-75`}>
              Due: {format(new Date(task.due_date), 'MMM d, yyyy')}
            </span>
            <span className={`px-2 py-1 rounded-full ${config.colors} ${config.textColor} font-medium transform transition-transform duration-200 hover:scale-105`}>
              {task.status}
            </span>
          </div>
        </div>
      )}
    </div>
  );
} 