<?php

namespace Database\Factories;

use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class TaskFactory extends Factory
{
    protected $model = Task::class;

    public function definition(): array
    {
        return [
            'name' => fake()->sentence(3),
            'description' => fake()->paragraph(2),
            'status' => fake()->randomElement(['To Do', 'In Progress', 'Done']),
            'due_date' => fake()->dateTimeBetween('now', '+30 days'),
            'user_id' => User::factory(),
        ];
    }
} 