<?php

namespace Database\Seeders;

use App\Models\AiProvider;
use App\Models\ConversationMessage;
use App\Models\Project;
use App\Models\SystemSetting;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        // Ensure a default user exists for seeding ownership
        $user = User::query()->updateOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Default Admin',
                'password' => Hash::make('password123'),
            ]
        );

        $openAi = AiProvider::query()->updateOrCreate(
            ['provider' => 'openai', 'name' => 'OpenAI GPT', 'user_id' => $user->id],
            [
                'auth_type' => 'api_key',
                'model' => 'gpt-4.1-mini',
                'status' => 'unverified',
                'quota_limit' => 1000000,
                'quota_used' => 128000,
                'quota_reset_at' => now()->addMonth(),
                'metadata' => ['docs' => 'https://platform.openai.com/docs'],
            ],
        );

        AiProvider::query()->updateOrCreate(
            ['provider' => 'gemini', 'name' => 'Gemini', 'user_id' => $user->id],
            [
                'auth_type' => 'api_key',
                'model' => 'gemini-2.5-flash',
                'status' => 'unverified',
                'quota_limit' => 750000,
                'quota_used' => 0,
                'quota_reset_at' => now()->addMonth(),
                'metadata' => ['docs' => 'https://ai.google.dev/'],
            ],
        );

        AiProvider::query()->updateOrCreate(
            ['provider' => 'local', 'name' => 'Local LLM', 'user_id' => $user->id],
            [
                'auth_type' => 'local_endpoint',
                'model' => 'llama-compatible',
                'endpoint_url' => 'http://127.0.0.1:11434/v1',
                'status' => 'verified',
                'last_verified_at' => now(),
                'quota_limit' => null,
                'quota_used' => 0,
                'metadata' => ['runtime' => 'OpenAI-compatible local endpoint'],
            ],
        );

        $project = Project::query()->updateOrCreate(
            ['name' => 'AI PRD Builder', 'user_id' => $user->id],
            [
                'status' => 'draft',
                'current_stage' => 'settings',
                'summary' => 'Open source AI workspace for generating PRDs through staged intake, stack decision, adaptive questions, Mermaid scratchboard, and export.',
                'stack_decision' => [
                    'frontend' => 'React 18 + TypeScript + Vite',
                    'backend' => 'Laravel API',
                    'database' => 'SQLite local / MySQL production',
                ],
                'metadata' => ['owner' => 'Malik', 'source' => 'seed'],
            ],
        );

        ConversationMessage::query()->updateOrCreate(
            ['project_id' => $project->id, 'role' => 'user', 'content' => 'Saya ingin membuat AI PRD Builder dengan sidebar, settings, provider AI, dan health check.'],
            ['metadata' => ['stage' => 'intake']],
        );

        ConversationMessage::query()->updateOrCreate(
            ['project_id' => $project->id, 'role' => 'assistant', 'content' => 'Thinking: stack Laravel API + SQLite dapat menyimpan provider AI, project, history, dan settings.'],
            ['metadata' => ['stage' => 'thinking']],
        );

        foreach ([
            ['general', 'appearance', ['theme' => 'dark']],
            ['notifications', 'quota_warnings', ['enabled' => true, 'thresholdPercent' => 80]],
            ['storage', 'retention', ['mode' => 'local_unlimited']],
            ['applications', 'enabled_tools', ['mermaid' => true, 'markdown_export' => true]],
        ] as [$group, $key, $value]) {
            SystemSetting::query()->updateOrCreate(
                ['group' => $group, 'key' => $key],
                ['value' => $value],
            );
        }

        $openAi->touch();
    }
}
