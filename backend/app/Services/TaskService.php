<?php

namespace App\Services;

use App\Models\Task;
use App\Repositories\TaskRepositoryInterface;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Log;

class TaskService
{
    public function __construct(private TaskRepositoryInterface $taskRepository)
    {
    }

    public function getAllTasks(): array
    {
        return $this->taskRepository->all()->toArray();
    }

    public function getPaginatedTasks(int $perPage = 15): LengthAwarePaginator
    {
        return $this->taskRepository->paginate($perPage);
    }

    public function searchTasks(array $params = []): array
    {
        try {
            Log::info('Searching tasks with params:', $params);
            
            $query = $this->taskRepository->query();

            // Apply search
            if (!empty($params['search'])) {
                $searchTerm = $params['search'];
                $query->where(function ($q) use ($searchTerm) {
                    $q->where('name', 'like', "%{$searchTerm}%")
                      ->orWhere('description', 'like', "%{$searchTerm}%");
                });
            }

            // Apply status filter
            if (!empty($params['status'])) {
                $query->where('status', $params['status']);
            }

            // Apply sorting
            if (!empty($params['sort'])) {
                $sortParts = explode('_', $params['sort']);
                if (count($sortParts) === 2) {
                    $field = $sortParts[0];
                    $direction = $sortParts[1];

                    // Validate sort field
                    $allowedFields = ['name', 'due_date', 'created_at', 'status'];
                    if (in_array($field, $allowedFields)) {
                        $query->orderBy($field, $direction === 'desc' ? 'desc' : 'asc');
                    }
                }
            } else {
                // Default sorting
                $query->orderBy('created_at', 'desc');
            }

            // Execute query
            $tasks = $query->get();
            Log::info('Found ' . $tasks->count() . ' tasks');

            return $tasks->toArray();
        } catch (\Exception $e) {
            Log::error('Error searching tasks: ' . $e->getMessage());
            throw $e;
        }
    }

    public function getTask(int $id): array
    {
        $task = $this->taskRepository->find($id);
        if (!$task) {
            throw new ModelNotFoundException("Task not found");
        }
        return $task->toArray();
    }

    public function createTask(array $data): array
    {
        $task = $this->taskRepository->create($data);
        return $task->toArray();
    }

    public function updateTask(int $id, array $data): array
    {
        $task = $this->taskRepository->update($id, $data);
        return $task->toArray();
    }

    public function deleteTask(int $id): bool
    {
        return $this->taskRepository->delete($id);
    }
} 