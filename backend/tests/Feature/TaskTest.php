<?php

namespace Tests\Feature;

use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TaskTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
    }

    public function test_can_create_task(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/tasks', [
                'name' => 'Test Task',
                'description' => 'Test Description',
                'status' => 'To Do',
                'due_date' => now()->addDays(7),
            ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'id',
                'name',
                'description',
                'status',
                'due_date',
                'user_id',
                'created_at',
                'updated_at',
            ]);
    }

    public function test_can_list_tasks(): void
    {
        Task::factory()->count(3)->create(['user_id' => $this->user->id]);

        $response = $this->actingAs($this->user)
            ->getJson('/api/tasks');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'current_page',
                'data' => [
                    '*' => [
                        'id',
                        'name',
                        'description',
                        'status',
                        'due_date',
                        'user_id',
                        'created_at',
                        'updated_at',
                    ],
                ],
                'first_page_url',
                'from',
                'last_page',
                'last_page_url',
                'links',
                'next_page_url',
                'path',
                'per_page',
                'prev_page_url',
                'to',
                'total',
            ]);
    }

    public function test_can_update_task(): void
    {
        $task = Task::factory()->create(['user_id' => $this->user->id]);

        $response = $this->actingAs($this->user)
            ->putJson("/api/tasks/{$task->id}", [
                'name' => 'Updated Task',
                'status' => 'In Progress',
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'name' => 'Updated Task',
                'status' => 'In Progress',
            ]);
    }

    public function test_can_delete_task(): void
    {
        $task = Task::factory()->create(['user_id' => $this->user->id]);

        $response = $this->actingAs($this->user)
            ->deleteJson("/api/tasks/{$task->id}");

        $response->assertStatus(204);
        $this->assertDatabaseMissing('tasks', ['id' => $task->id]);
    }

    public function test_can_search_tasks(): void
    {
        Task::factory()->create([
            'user_id' => $this->user->id,
            'name' => 'Important Task',
            'status' => 'To Do',
        ]);

        Task::factory()->create([
            'user_id' => $this->user->id,
            'name' => 'Another Task',
            'status' => 'Done',
        ]);

        $response = $this->actingAs($this->user)
            ->getJson('/api/tasks/search?search=Important&status=To Do');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'current_page',
                'data' => [
                    '*' => [
                        'id',
                        'name',
                        'description',
                        'status',
                        'due_date',
                        'user_id',
                        'created_at',
                        'updated_at',
                    ],
                ],
                'first_page_url',
                'from',
                'last_page',
                'last_page_url',
                'links',
                'next_page_url',
                'path',
                'per_page',
                'prev_page_url',
                'to',
                'total',
            ])
            ->assertJson([
                'data' => [
                    [
                        'name' => 'Important Task',
                        'status' => 'To Do',
                    ],
                ],
            ]);
    }
} 