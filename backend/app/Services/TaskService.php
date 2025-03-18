<?php

namespace App\Services;

use App\Models\Task;
use App\Repositories\TaskRepositoryInterface;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Pagination\LengthAwarePaginator;

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

    public function searchTasks(array $criteria): LengthAwarePaginator
    {
        return $this->taskRepository->search($criteria);
    }
} 