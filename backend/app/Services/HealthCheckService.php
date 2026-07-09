<?php

namespace App\Services;

use App\Models\AiProvider;
use App\Models\ConversationMessage;
use App\Models\Project;
use Illuminate\Support\Facades\DB;
use Throwable;

class HealthCheckService
{
    public function snapshot(): array
    {
        $database = $this->database();
        $providers = AiProvider::query()->count();
        $verifiedProviders = AiProvider::query()->where('status', 'verified')->count();

        return [
            'status' => $database['ok'] ? 'ok' : 'degraded',
            'checkedAt' => now()->toIso8601String(),
            'app' => [
                'name' => config('app.name'),
                'environment' => app()->environment(),
                'debug' => (bool) config('app.debug'),
            ],
            'database' => $database,
            'records' => [
                'providers' => $providers,
                'verifiedProviders' => $verifiedProviders,
                'projects' => Project::query()->count(),
                'messages' => ConversationMessage::query()->count(),
            ],
            'frontendContract' => [
                'settingsBootstrap' => '/api/settings/bootstrap',
                'providers' => '/api/ai-providers',
                'projects' => '/api/projects',
                'history' => '/api/conversation-history',
            ],
        ];
    }

    private function database(): array
    {
        try {
            DB::select('select 1 as ok');

            return [
                'ok' => true,
                'connection' => config('database.default'),
                'driver' => DB::connection()->getDriverName(),
            ];
        } catch (Throwable $exception) {
            return [
                'ok' => false,
                'connection' => config('database.default'),
                'error' => $exception->getMessage(),
            ];
        }
    }
}
