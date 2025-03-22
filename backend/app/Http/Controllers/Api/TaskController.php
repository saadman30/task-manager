<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Task\StoreTaskRequest;
use App\Http\Requests\Task\UpdateTaskRequest;
use App\Services\TaskService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Response as ResponseFacade;

class TaskController extends Controller
{
    public function __construct(private TaskService $taskService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $params = [
            'search' => $request->get('search'),
            'sort' => $request->get('sort'),
            'status' => $request->get('status'),
            'per_page' => $request->get('per_page', 50),
        ];

        return ResponseFacade::json($this->taskService->searchTasks($params));
    }

    public function store(StoreTaskRequest $request): JsonResponse
    {
        $task = $this->taskService->createTask($request->validated());
        return ResponseFacade::json($task, Response::HTTP_CREATED);
    }

    public function show(int $id): JsonResponse
    {
        $task = $this->taskService->getTask($id);
        return ResponseFacade::json($task);
    }

    public function update(UpdateTaskRequest $request, int $id): JsonResponse
    {
        $task = $this->taskService->updateTask($id, $request->validated());
        return ResponseFacade::json($task);
    }

    public function destroy(int $id): JsonResponse
    {
        $this->taskService->deleteTask($id);
        return ResponseFacade::json(null, Response::HTTP_NO_CONTENT);
    }
} 