<?php

namespace Database\Factories;

use App\Models\AiProvider;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<AiProvider>
 */
class AiProviderFactory extends Factory
{
    protected $model = AiProvider::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'name' => $this->faker->company.' LLM',
            'provider' => 'openai',
            'auth_type' => 'api_key',
            'model' => 'gpt-4o',
            'endpoint_url' => null,
            'api_key' => 'sk-proj-'.str_repeat('a', 40),
            'status' => 'unverified',
            'quota_limit' => 1000000,
            'quota_used' => 0,
            'metadata' => [],
        ];
    }
}
