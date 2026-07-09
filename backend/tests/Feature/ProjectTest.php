<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProjectTest extends TestCase
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

    public function test_can_list_projects_paginated(): void
    {
        Project::factory()->count(15)->create(['user_id' => $this->user->id]);

        $response = $this->withHeader('Authorization', 'Bearer '.$this->token)
            ->getJson('/api/v1/projects');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'name', 'status', 'currentStage', 'summary', 'stackDecision', 'updatedAt'],
                ],
                'links' => ['first', 'last', 'prev', 'next'],
                'meta' => ['current_page', 'from', 'last_page', 'links', 'path', 'per_page', 'to', 'total'],
            ]);

        $this->assertCount(10, $response->json('data'));
    }

    public function test_projects_can_be_soft_deleted(): void
    {
        $project = Project::factory()->create();

        $this->assertDatabaseHas('projects', [
            'id' => $project->id,
            'deleted_at' => null,
        ]);

        $project->delete();

        $this->assertDatabaseHas('projects', [
            'id' => $project->id,
        ]);
        $this->assertNotNull($project->fresh()->deleted_at);

        // Project should not show in active query
        $this->assertNull(Project::find($project->id));
        // But should show when using withTrashed
        $this->assertNotNull(Project::withTrashed()->find($project->id));
    }

    public function test_user_cannot_see_other_users_projects(): void
    {
        $otherUser = User::factory()->create();

        // Project belonging to this user
        Project::factory()->create([
            'user_id' => $this->user->id,
            'name' => 'My Owned Project',
        ]);

        // Project belonging to another user
        Project::factory()->create([
            'user_id' => $otherUser->id,
            'name' => 'Someone Elses Project',
        ]);

        $response = $this->withHeader('Authorization', 'Bearer '.$this->token)
            ->getJson('/api/v1/projects');

        $response->assertStatus(200);

        $data = $response->json('data');
        $this->assertCount(1, $data);
        $this->assertEquals('My Owned Project', $data[0]['name']);
    }
}
