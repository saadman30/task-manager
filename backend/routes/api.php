<?php

use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\Api\AuthController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('tasks/search', [TaskController::class, 'search']);
    Route::apiResource('tasks', TaskController::class);
}); 