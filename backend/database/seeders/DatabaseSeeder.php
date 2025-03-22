<?php

namespace Database\Seeders;

use App\Models\Task;
use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create admin user
        $admin = User::factory()->create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => bcrypt('password123'),
        ]);

        // Create regular user
        $regularUser = User::factory()->create([
            'name' => 'Regular User',
            'email' => 'user@example.com',
            'password' => bcrypt('password123'),
        ]);

        // Create tasks for both users
        collect([$admin, $regularUser])->each(function ($user) {
            // Create 3-5 tasks per user with different statuses
            $taskCount = rand(3, 5);
            
            Task::factory()->count($taskCount)->create([
                'user_id' => $user->id,
            ]);
        });
    }
}
