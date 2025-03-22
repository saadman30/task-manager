import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useDrag } from 'react-dnd';
import { TaskAPI } from '../services/api';

const TASK_STATUSES = ['To Do', 'In Progress', 'Done'];

export default function TaskCard({ task }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState(task);
  const queryClient = useQueryClient();

  const [{ isDragging }, drag] = useDrag({
    type: 'TASK',
    item: { id: task.id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, data }) => TaskAPI.updateTask(taskId, data),
    onMutate: async ({ taskId, data }) => {
      await queryClient.cancelQueries(['tasks']);
      const previousTasks = queryClient.getQueryData(['tasks']);
      queryClient.setQueryData(['tasks'], (old) =>
        Array.isArray(old)
          ? old.map((t) => (t.id === taskId ? { ...t, ...data } : t))
          : []
      );
      return { previousTasks };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['tasks'], context.previousTasks);
      console.error('Error updating task:', err);
    },
    onSettled: () => {
      queryClient.invalidateQueries(['tasks']);
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (taskId) => TaskAPI.deleteTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks']);
    },
    onError: (error) => {
      console.error('Error deleting task:', error);
    },
  });

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    console.log('Saving task:', editedTask);
    updateTaskMutation.mutate({
      taskId: task.id,
      data: editedTask,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedTask(task);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      deleteTaskMutation.mutate(task.id);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedTask((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div
      ref={drag}
      className={`p-4 bg-white rounded-lg shadow ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      {isEditing ? (
        <div className="space-y-3">
          <input
            type="text"
            name="name"
            value={editedTask.name}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
          <textarea
            name="description"
            value={editedTask.description || ''}
            onChange={handleChange}
            rows="2"
            className="w-full p-2 border rounded"
          />
          <input
            type="datetime-local"
            name="due_date"
            value={editedTask.due_date || ''}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
          <select
            name="status"
            value={editedTask.status}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            {TASK_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <div className="flex justify-end space-x-2">
            <button
              onClick={handleCancel}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-medium">{task.name}</h4>
            <div className="flex space-x-2">
              <button
                onClick={handleEdit}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Delete
              </button>
            </div>
          </div>
          {task.description && (
            <p className="text-sm text-gray-600 mb-2">{task.description}</p>
          )}
          {task.due_date && (
            <p className="text-xs text-gray-500">
              Due: {new Date(task.due_date).toLocaleString()}
            </p>
          )}
        </div>
      )}
    </div>
  );
} 