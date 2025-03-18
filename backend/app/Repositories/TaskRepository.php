<?php

namespace App\Repositories;

use App\Models\Task;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Auth;

class TaskRepository implements TaskRepositoryInterface
{
    public function __construct(private Task $model)
    {
    }

    public function all(): Collection
    {
        return $this->model->where('user_id', Auth::id())->get();
    }

    public function paginate(int $perPage = 15): LengthAwarePaginator
    {
        return $this->model->where('user_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }

    public function find(int $id): ?Task
    {
        return $this->model->where('user_id', Auth::id())->find($id);
    }

    public function create(array $data): Task
    {
        $data['user_id'] = Auth::id();
        return $this->model->create($data);
    }

    public function update(int $id, array $data): ?Task
    {
        $task = $this->find($id);
        if (!$task) {
            throw new ModelNotFoundException("Task not found");
        }
        $task->update($data);
        return $task;
    }

    public function delete(int $id): bool
    {
        $task = $this->find($id);
        if (!$task) {
            throw new ModelNotFoundException("Task not found");
        }
        return $task->delete();
    }

    public function search(array $criteria): LengthAwarePaginator
    {
        $query = $this->model->where('user_id', Auth::id());

        if (isset($criteria['status'])) {
            $query->where('status', $criteria['status']);
        }

        if (isset($criteria['search'])) {
            $search = $criteria['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if (isset($criteria['due_date_from'])) {
            $query->where('due_date', '>=', $criteria['due_date_from']);
        }

        if (isset($criteria['due_date_to'])) {
            $query->where('due_date', '<=', $criteria['due_date_to']);
        }

        return $query->orderBy('created_at', 'desc')
                    ->paginate($criteria['per_page'] ?? 15);
    }
} 