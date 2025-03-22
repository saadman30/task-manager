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
        bg-white rounded-lg shadow p-4
        ${isDragging ? 'opacity-50' : 'opacity-100'}
        transition-all duration-200
        border ${config.colors}/30
      `}
    >
      {isEditing ? (
        <div className="space-y-3">
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
        <>
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-medium">{task.name}</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => setIsEditing(true)}
                className="text-gray-500 hover:text-gray-700"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={onDelete}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-2">{task.description}</p>
          <div className="flex justify-between items-center text-sm text-gray-500">
            <span>Due: {format(new Date(task.due_date), 'MMM d, yyyy')}</span>
            <span className={`px-2 py-1 rounded ${config.colors}/20 ${config.textColor}`}>
              {task.status}
            </span>
          </div>
        </>
      )}
    </div>
  );
} 