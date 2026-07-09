<?php

namespace Database\Factories;

use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Project>
 */
class ProjectFactory extends Factory
{
    protected $model = Project::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'name' => $this->faker->sentence(3),
            'status' => 'draft',
            'current_stage' => 'intake',
            'summary' => $this->faker->paragraph,
            'stack_decision' => [
                'frontend' => 'React',
                'backend' => 'Laravel',
                'database' => 'SQLite',
            ],
            'metadata' => [],
        ];
    }
}
