<?php

namespace Tests\Feature;

use App\Models\AiProvider;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AiProviderTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    private string $token;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
        $this->token = $this->user->createToken('test_token')->plainTextToken;
    }

    public function test_can_list_ai_providers_paginated(): void
    {
        AiProvider::factory()->count(12)->create(['user_id' => $this->user->id]);

        $response = $this->withHeader('Authorization', 'Bearer '.$this->token)
            ->getJson('/api/v1/ai-providers');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'name', 'provider', 'authType', 'model', 'endpointUrl', 'status', 'quota'],
                ],
                'links',
                'meta',
            ]);

        $this->assertCount(10, $response->json('data'));
    }

    public function test_can_create_ai_provider(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer '.$this->token)
            ->postJson('/api/v1/ai-providers', [
                'name' => 'Custom OpenAI',
                'provider' => 'openai',
                'authType' => 'api_key',
                'apiKey' => 'sk-test-key-12345',
                'model' => 'gpt-4o',
            ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('ai_providers', [
            'name' => 'Custom OpenAI',
        ]);
    }

    public function test_ai_providers_can_be_soft_deleted(): void
    {
        $provider = AiProvider::factory()->create();

        $provider->delete();

        $this->assertDatabaseHas('ai_providers', [
            'id' => $provider->id,
        ]);
        $this->assertNotNull($provider->fresh()->deleted_at);
        $this->assertNull(AiProvider::find($provider->id));
    }

    public function test_user_cannot_see_other_users_ai_providers(): void
    {
        $otherUser = User::factory()->create();

        // Provider belonging to this user
        AiProvider::factory()->create([
            'user_id' => $this->user->id,
            'name' => 'My Owned Provider',
        ]);

        // Provider belonging to another user
        AiProvider::factory()->create([
            'user_id' => $otherUser->id,
            'name' => 'Someone Elses Provider',
        ]);

        $response = $this->withHeader('Authorization', 'Bearer '.$this->token)
            ->getJson('/api/v1/ai-providers');

        $response->assertStatus(200);
        $data = $response->json('data');
        $this->assertCount(1, $data);
        $this->assertEquals('My Owned Provider', $data[0]['name']);
    }

    public function test_user_cannot_modify_other_users_ai_providers(): void
    {
        $otherUser = User::factory()->create();
        $otherProvider = AiProvider::factory()->create([
            'user_id' => $otherUser->id,
            'name' => 'Someone Elses Provider',
        ]);

        // Attempt update via PATCH
        $responseUpdate = $this->withHeader('Authorization', 'Bearer '.$this->token)
            ->patchJson("/api/v1/ai-providers/{$otherProvider->id}", [
                'name' => 'Hacked Provider Name',
            ]);

        // Forbidden
        $responseUpdate->assertStatus(403);

        // Attempt verify via POST
        $responseVerify = $this->withHeader('Authorization', 'Bearer '.$this->token)
            ->postJson("/api/v1/ai-providers/{$otherProvider->id}/verify");

        // Forbidden
        $responseVerify->assertStatus(403);
    }
}
