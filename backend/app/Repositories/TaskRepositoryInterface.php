<?php

namespace App\Repositories;

use App\Models\Task;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;

interface TaskRepositoryInterface
{
    public function query(): Builder;
    
    public function all(): Collection;
    
    public function paginate(int $perPage = 15): LengthAwarePaginator;
    
    public function find(int $id): ?Task;
    
    public function create(array $data): Task;
    
    public function update(int $id, array $data): ?Task;
    
    public function delete(int $id): bool;
    
    public function search(array $criteria): LengthAwarePaginator;
} 