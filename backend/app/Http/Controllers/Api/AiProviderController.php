<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAiProviderRequest;
use App\Http\Requests\UpdateAiProviderRequest;
use App\Http\Resources\AiProviderResource;
use App\Jobs\VerifyAiProviderQuota;
use App\Models\AiProvider;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Gate;

class AiProviderController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        return AiProviderResource::collection(
            $request->user()->aiProviders()->latest('updated_at')->paginate(10),
        );
    }

    public function store(StoreAiProviderRequest $request): AiProviderResource
    {
        $provider = $request->user()->aiProviders()->create($this->payload($request->validated()));

        return AiProviderResource::make($provider);
    }

    public function update(UpdateAiProviderRequest $request, AiProvider $aiProvider): AiProviderResource
    {
        Gate::authorize('update', $aiProvider);

        $aiProvider->fill($this->payload($request->validated()));

        if ($request->hasAny(['apiKey', 'endpointUrl', 'provider', 'authType'])) {
            $aiProvider->status = 'unverified';
            $aiProvider->last_verified_at = null;
        }

        $aiProvider->save();

        return AiProviderResource::make($aiProvider);
    }

    public function verify(AiProvider $aiProvider): JsonResponse
    {
        Gate::authorize('update', $aiProvider);

        $aiProvider->status = 'verifying';
        $aiProvider->save();

        VerifyAiProviderQuota::dispatch($aiProvider);

        return response()->json([
            'ok' => true,
            'message' => 'Verification job dispatched to background queue.',
            'provider' => AiProviderResource::make($aiProvider),
        ], 202);
    }

    private function payload(array $validated): array
    {
        $map = [
            'name' => 'name',
            'provider' => 'provider',
            'authType' => 'auth_type',
            'model' => 'model',
            'endpointUrl' => 'endpoint_url',
            'apiKey' => 'api_key',
            'quotaLimit' => 'quota_limit',
            'quotaUsed' => 'quota_used',
            'metadata' => 'metadata',
        ];

        $payload = [];

        foreach ($map as $requestKey => $column) {
            if (array_key_exists($requestKey, $validated)) {
                $payload[$column] = $validated[$requestKey];
            }
        }

        return $payload;
    }
}
