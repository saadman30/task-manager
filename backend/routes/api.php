<?php

use App\Http\Controllers\Api\TaskController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('tasks/search', [TaskController::class, 'search']);
    Route::apiResource('tasks', TaskController::class);
}); 