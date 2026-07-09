<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\AiProviderResource;
use App\Http\Resources\ProjectResource;
use App\Services\HealthCheckService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BootstrapController extends Controller
{
    public function __invoke(Request $request, HealthCheckService $health): JsonResponse
    {
        $providers = $request->user()->aiProviders()->latest('updated_at')->get();
        $projects = $request->user()->projects()->withCount('messages')->latest('updated_at')->limit(8)->get();
        $activeProvider = $providers->firstWhere('status', 'verified') ?? $providers->first();

        return response()->json([
            'health' => $health->snapshot(),
            'ai' => [
                'activeProvider' => $activeProvider ? AiProviderResource::make($activeProvider) : null,
                'providers' => AiProviderResource::collection($providers),
                'providerOptions' => [
                    ['id' => 'openai', 'label' => 'OpenAI / GPT', 'authType' => 'api_key'],
                    ['id' => 'google', 'label' => 'Google AI Studio', 'authType' => 'api_key'],
                    ['id' => 'gemini', 'label' => 'Gemini', 'authType' => 'api_key'],
                    ['id' => 'anthropic', 'label' => 'Anthropic', 'authType' => 'api_key'],
                    ['id' => 'local', 'label' => 'Local LLM', 'authType' => 'local_endpoint'],
                    ['id' => 'custom', 'label' => 'Custom OpenAI-compatible', 'authType' => 'api_key'],
                ],
            ],
            'projects' => ProjectResource::collection($projects),
            'settings' => [
                'storage' => [
                    'driver' => 'sqlite',
                    'database' => database_path('database.sqlite'),
                    'projectRetention' => 'unlimited_local',
                ],
                'notifications' => [
                    'quotaWarnings' => true,
                    'failedVerification' => true,
                    'exportReady' => false,
                ],
                'applications' => [
                    'mermaid' => true,
                    'markdownExport' => true,
                    'pdfExport' => false,
                    'githubExport' => false,
                ],
            ],
        ]);
    }
}
