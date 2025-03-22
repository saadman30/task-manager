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

        // Create regular users
        $users = User::factory(3)->create();

        // Add admin to users collection
        $users->push($admin);

        // Create tasks for each user
        $users->each(function ($user) {
            // Create 3-5 tasks per user with different statuses
            $taskCount = rand(3, 5);
            
            Task::factory()->count($taskCount)->create([
                'user_id' => $user->id,
            ]);
        });
    }
}
